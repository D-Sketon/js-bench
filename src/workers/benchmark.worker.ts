import { bench, run, do_not_optimize } from "mitata";
import {
  createSafeFunction,
  createSafeSetupCode,
} from "../utils/benchmark";
import { BenchmarkResult, Dependency, TestCase } from "../store";

declare function importScripts(...urls: string[]): void;

// 为globalThis添加类型安全的接口
interface GlobalThisWithDependencies {
  [key: string]: unknown;
}

export interface WorkerMessage {
  type: "RUN_BENCHMARK";
  testCases: TestCase[];
  setupCode?: string;
  asyncMode?: boolean;
  dependencies?: Dependency[];
}

export interface WorkerResponse {
  type: "BENCHMARK_COMPLETE" | "BENCHMARK_ERROR" | "BENCHMARK_PROGRESS";
  results?: BenchmarkResult[];
  error?: string;
  progress?: {
    current: number;
    total: number;
    name: string;
  };
}

class DependencyLoader {
  private loadedDependencies = new Set<string>();
  private loadingPromises = new Map<string, Promise<unknown>>();

  async loadDependency(dependency: Dependency): Promise<unknown> {
    const key = `${dependency.mode}:${dependency.url}`;

    if (this.loadedDependencies.has(key)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = this.doLoadDependency(dependency);
    this.loadingPromises.set(key, promise);

    try {
      const result = await promise;
      this.loadedDependencies.add(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  private async doLoadDependency(dependency: Dependency): Promise<unknown> {
    if (dependency.mode === "esm") {
      return this.loadESMDependency(dependency);
    } else {
      return this.loadUMDDependency(dependency);
    }
  }

  private async loadESMDependency(dependency: Dependency): Promise<unknown> {
    try {
      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = await import(/* webpackIgnore: true */ dependency.url);

      if (dependency.name && module) {
        (globalThis as GlobalThisWithDependencies)[dependency.name] = module.default || module;
      }

      return module;
    } catch (error) {
      throw new Error(
        `Failed to load ESM dependency "${dependency.name}" from ${dependency.url}: ${error}`
      );
    }
  }

  private async loadUMDDependency(dependency: Dependency): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const globalScope = globalThis as GlobalThisWithDependencies;
      
      if (dependency.globalName && globalScope[dependency.globalName]) {
        resolve(globalScope[dependency.globalName]);
        return;
      }
      try {
        importScripts(dependency.url);

        let loadedModule: unknown;
        if (
          dependency.globalName &&
          globalScope[dependency.globalName]
        ) {
          loadedModule = globalScope[dependency.globalName];
        } else {
          loadedModule = globalScope[dependency.name];
        }

        if (dependency.name && loadedModule) {
          globalScope[dependency.name] = loadedModule;
        }

        resolve(loadedModule);
      } catch (error) {
        reject(
          new Error(
            `Failed to load UMD dependency "${dependency.name}" from ${dependency.url}: ${error}`
          )
        );
      }
    });
  }

  async loadDependencies(dependencies: Dependency[]): Promise<void> {
    const enabledDependencies = dependencies.filter(
      (dep) => dep.enabled && dep.url.trim()
    );

    if (enabledDependencies.length === 0) {
      return;
    }

    try {
      await Promise.all(
        enabledDependencies.map((dep) => this.loadDependency(dep))
      );
    } catch (error) {
      throw new Error(`Failed to load dependencies: ${error}`);
    }
  }

  reset() {
    this.loadedDependencies.clear();
    this.loadingPromises.clear();
  }
}

const dependencyLoader = new DependencyLoader();

async function runBenchmarks(
  testCases: TestCase[],
  setupCode: string = "",
  asyncMode: boolean = false,
  dependencies: Dependency[] = []
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  dependencyLoader.reset();

  try {
    const sendProgress = (current: number, total: number, name: string) => {
      postMessage({
        type: "BENCHMARK_PROGRESS",
        progress: { current, total, name },
      } as WorkerResponse);
    };

    const totalCases = testCases.length;
    let currentProgress = 0;

    // Stage 0: Load dependencies
    if (dependencies.length > 0) {
      sendProgress(0, totalCases, "Loading dependencies...");
      try {
        await dependencyLoader.loadDependencies(dependencies);
      } catch (error) {
        throw new Error(`Dependencies loading failed: ${error}`);
      }
    }

    // Stage 1: Validate all test cases
    sendProgress(currentProgress, totalCases, "Validating test cases...");

    const validTestCases: {
      testCase: TestCase;
      testFunction: (() => void) | (() => Promise<void>);
    }[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      try {
        const GLOBAL = createSafeSetupCode(setupCode)();
        const testFunction = createSafeFunction(testCase.code, GLOBAL, asyncMode, do_not_optimize);

        // Pre-execution check
        if (asyncMode) {
          await (testFunction as () => Promise<void>)();
        } else {
          (testFunction as () => void)();
        }

        validTestCases.push({ testCase, testFunction });
      } catch (error) {
        results.push({
          name: testCase.name,
          avg: 0,
          p99: 0,
          p75: 0,
          ops: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (validTestCases.length > 0) {

      currentProgress = 0;
      sendProgress(currentProgress, totalCases, "Preparing benchmark...");

      validTestCases.forEach(({ testCase, testFunction }) => {
        bench(testCase.name, testFunction);
      });

      sendProgress(0, totalCases, "Running benchmark, please wait...");

      const benchmarkResults = await run({
        colors: false,
      });

      if (benchmarkResults) {
        const noopFnAvg = benchmarkResults.context.noop.fn.avg / 1000;
        const noopIterAvg = benchmarkResults.context.noop.iter.avg / 1000;
        benchmarkResults.benchmarks.forEach((result) => {
          if (result && result.alias) {
            const existingIndex = results.findIndex(
              (r) => r.name === result.alias
            );

            const type = result.runs[0]?.stats?.kind;
            const noopAvg = type === 'iter' ? noopIterAvg : noopFnAvg;
            
            const avg = (result.runs[0]?.stats?.avg || 0) / 1000;
            const p99 = (result.runs[0]?.stats?.p99 || 0) / 1000;
            const p75 = (result.runs[0]?.stats?.p75 || 0) / 1000;
            const optimizedOut = avg < (1.42 * noopAvg);
            const newResult: BenchmarkResult = {
              name: result.alias,
              avg,
              p99,
              p75,
              ops: Math.round(1000000 / avg),
              optimizedOut,
            };

            if (existingIndex >= 0) {
              results[existingIndex] = newResult;
            } else {
              results.push(newResult);
            }
          }
        });
      } else {
        throw new Error("Mitata benchmark failed to produce results");
      }
    }

    sendProgress(totalCases, totalCases, "Benchmark completed");
  } catch (error) {
    console.error("Benchmark failed:", error);
    throw error;
  }
  return results;
}

self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const { type, testCases, setupCode, asyncMode, dependencies } = event.data;

  if (type === "RUN_BENCHMARK") {
    try {
      const results = await runBenchmarks(
        testCases,
        setupCode || "",
        asyncMode || false,
        dependencies || []
      );

      postMessage({
        type: "BENCHMARK_COMPLETE",
        results,
      } as WorkerResponse);
    } catch (error) {
      postMessage({
        type: "BENCHMARK_ERROR",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during benchmark",
      } as WorkerResponse);
    }
  }
});

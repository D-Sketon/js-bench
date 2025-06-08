import { TestCase, Dependency, BenchmarkResult } from "../store";
import type {
  WorkerMessage,
  WorkerResponse,
} from "../workers/benchmark.worker";

export interface BenchmarkProgress {
  current: number;
  total: number;
  name: string;
}

export class BenchmarkWorkerManager {
  private worker: Worker | null = null;
  private currentPromise: {
    resolve: (results: BenchmarkResult[]) => void;
    reject: (error: Error) => void;
  } | null = null;

  private progressCallback: ((progress: BenchmarkProgress) => void) | null =
    null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(
        new URL("../workers/benchmark.worker.ts", import.meta.url),
        { type: "module" }
      );

      this.worker.addEventListener(
        "message",
        this.handleWorkerMessage.bind(this)
      );
      this.worker.addEventListener("error", this.handleWorkerError.bind(this));
    } catch (error) {
      console.error("Failed to create worker:", error);
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
    const { type, results, error, progress } = event.data;

    switch (type) {
      case "BENCHMARK_COMPLETE":
        if (this.currentPromise && results) {
          this.currentPromise.resolve(results);
          this.currentPromise = null;
        }
        break;

      case "BENCHMARK_ERROR":
        if (this.currentPromise) {
          this.currentPromise.reject(
            new Error(error || "Benchmark test failed")
          );
          this.currentPromise = null;
        }
        break;

      case "BENCHMARK_PROGRESS":
        if (this.progressCallback && progress) {
          this.progressCallback(progress);
        }
        break;
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error("Worker error:", error);
    if (this.currentPromise) {
      this.currentPromise.reject(new Error("Worker execution error"));
      this.currentPromise = null;
    }
  }

  public async runBenchmarks(
    testCases: TestCase[],
    setupCode?: string,
    asyncMode?: boolean,
    dependencies?: Dependency[],
    onProgress?: (progress: BenchmarkProgress) => void
  ): Promise<BenchmarkResult[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker unavailable, please check browser support"));
        return;
      }

      if (this.currentPromise) {
        reject(new Error("Benchmark test already in progress"));
        return;
      }

      this.currentPromise = { resolve, reject };
      this.progressCallback = onProgress || null;

      const message: WorkerMessage = {
        type: "RUN_BENCHMARK",
        testCases,
        setupCode: setupCode || "",
        asyncMode: asyncMode || false,
        dependencies: dependencies || [],
      };

      this.worker.postMessage(message);
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    if (this.currentPromise) {
      this.currentPromise.reject(new Error("Worker terminated"));
      this.currentPromise = null;
    }

    this.progressCallback = null;
  }

  public get isAvailable(): boolean {
    return this.worker !== null;
  }
}

let workerManagerInstance: BenchmarkWorkerManager | null = null;

export function getBenchmarkWorkerManager(): BenchmarkWorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new BenchmarkWorkerManager();
  }
  return workerManagerInstance;
}

export function terminateBenchmarkWorker() {
  if (workerManagerInstance) {
    workerManagerInstance.terminate();
    workerManagerInstance = null;
  }
}

import { BenchmarkResult, Dependency } from "../store";

export async function formatCode(code: string): Promise<string> {
  try {
    const prettier = await import("prettier/standalone");
    const parserBabel = await import("prettier/plugins/babel");
    const prettierPluginEstree = await import("prettier/plugins/estree");

    return await prettier.format(code, {
      parser: "babel",
      plugins: [parserBabel.default, prettierPluginEstree.default],
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: "es5",
    });
  } catch (error) {
    console.warn("Format code failed:", error);
    return code;
  }
}

export function createSafeSetupCode(code: string): () => unknown {
  try {
    if (code.trim()) {
      return new Function(`
        "use strict";
  
        return function() {
          ${code}
        }
      `)() as () => void;
    }
    return () => {
      return undefined;
    };
  } catch {
    return () => {
      return undefined;
    };
  }
}

export function createSafeFunction(
  code: string,
  GLOBAL: unknown,
  asyncMode: boolean = false,
  do_not_optimize?: (v: unknown) => void
): (() => void) | (() => Promise<void>) {
  try {
    if (asyncMode) {
      return new Function(`
        "use strict";
        return function(GLOBAL, do_not_optimize) {
          return async function() {
            try {
              ${code}
            } catch (e) {
              throw new Error('Execution error: ' + e.message);
            }
          }
        }
      `)()(GLOBAL, do_not_optimize) as () => Promise<void>;
    } else {
      return new Function(`
        "use strict";
        return function(GLOBAL, do_not_optimize) {
          return function() {
            try {
              ${code}
            } catch (e) {
              throw new Error('Execution error: ' + e.message);
            }
          }
        }
      `)()(GLOBAL, do_not_optimize) as () => void;
    }
  } catch (error) {
    throw new Error(
      `Code compilation error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export function validateCode(
  code: string,
  asyncMode: boolean = false
): { isValid: boolean; error?: string } {
  try {
    createSafeFunction(code, undefined, asyncMode);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Syntax error",
    };
  }
}

export function validateSetupCode(
  setupCode: string,
  asyncMode: boolean = false
): { isValid: boolean; error?: string } {
  try {
    createSafeFunction(setupCode, undefined, asyncMode);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Setup code syntax error",
    };
  }
}

export function validateCodeWithSetup(
  setupCode: string,
  testCode: string,
  asyncMode: boolean = false
): { isValid: boolean; error?: string } {
  try {
    const GLOBAL = createSafeSetupCode(setupCode)();
    createSafeFunction(testCode, GLOBAL, asyncMode);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "Code combination syntax error",
    };
  }
}

export function validateDependencies(dependencies: Dependency[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const enabledDependencies = dependencies.filter((dep) => dep.enabled);

  enabledDependencies.forEach((dep) => {
    if (!dep.name.trim()) {
      errors.push(`Dependency name is missing`);
    }

    if (!dep.url.trim()) {
      errors.push(`Dependency "${dep.name}" is missing URL`);
    } else {
      try {
        new URL(dep.url);
      } catch {
        errors.push(`Dependency "${dep.name}" URL format is invalid`);
      }
    }

    if (dep.mode === "umd" && !dep.globalName?.trim()) {
      errors.push(
        `Dependency "${dep.name}" in UMD mode requires a global variable name`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateRelativePerformance(
  results: BenchmarkResult[]
): BenchmarkResult[] {
  const validResults = results.filter((r) => !r.error && r.ops > 0);
  if (validResults.length === 0) return results;

  const maxOps = Math.max(...validResults.map((r) => r.ops));

  return results.map((result) => ({
    ...result,
    relativePerformance: result.error ? 0 : (result.ops / maxOps) * 100,
  }));
}

export function getPerformanceRanking(
  results: BenchmarkResult[]
): BenchmarkResult[] {
  return [...results].filter((r) => !r.error).sort((a, b) => b.ops - a.ops);
}

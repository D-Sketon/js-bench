import React, { useCallback, useState, useEffect } from "react";
import {
  Play,
  Square,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Table,
  BarChart3,
} from "lucide-react";
import { useBenchmarkStore } from "../store";
import {
  validateCode,
  validateSetupCode,
  validateCodeWithSetup,
  validateDependencies,
} from "../utils/benchmark";
import {
  getBenchmarkWorkerManager,
  BenchmarkProgress,
  terminateBenchmarkWorker,
} from "../utils/workerManager";
import { useTranslation } from "../i18n";
import { useLanguageChange } from "../hooks/useLanguageChange";
import { useThemeChange } from "../hooks/useThemeChange";

interface BenchmarkRunnerProps {
  activeView: "table" | "chart";
  setActiveView: (view: "table" | "chart") => void;
  hasResults: boolean;
}

export const BenchmarkRunner: React.FC<BenchmarkRunnerProps> = ({
  activeView,
  setActiveView,
  hasResults,
}) => {
  const {
    testCases,
    setupCode,
    asyncMode,
    dependencies,
    isRunning,
    results,
    setRunning,
    setResults,
    clearResults,
    reset,
  } = useBenchmarkStore();

  const { t, currentLanguage } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BenchmarkProgress | null>(null);
  const [workerAvailable, setWorkerAvailable] = useState(true);

  useLanguageChange();
  useThemeChange();

  useEffect(() => {
    const workerManager = getBenchmarkWorkerManager();
    setWorkerAvailable(workerManager.isAvailable);
    return () => {
      terminateBenchmarkWorker();
    };
  }, []);

  const validateAllTestCases = useCallback(() => {
    const errors: string[] = [];

    // Validate dependencies
    const depValidation = validateDependencies(dependencies);
    if (!depValidation.isValid) {
      errors.push(...depValidation.errors);
    }

    // Validate setup code
    if (setupCode.trim()) {
      const setupValidation = validateSetupCode(setupCode, asyncMode);
      if (!setupValidation.isValid) {
        errors.push(`Setup Code: ${setupValidation.error}`);
      }
    }

    // Validate test cases
    testCases.forEach((testCase) => {
      if (setupCode.trim()) {
        // If there is setup code, validate the combination of setup code and test code
        const validation = validateCodeWithSetup(
          setupCode,
          testCase.code,
          asyncMode
        );
        if (!validation.isValid) {
          errors.push(
            `${t("testCase")} "${testCase.name}": ${validation.error}`
          );
        }
      } else {
        // If there is no setup code, only validate the test code
        const validation = validateCode(testCase.code, asyncMode);
        if (!validation.isValid) {
          errors.push(
            `${t("testCase")} "${testCase.name}": ${validation.error}`
          );
        }
      }
    });

    return errors;
  }, [testCases, setupCode, asyncMode, dependencies, t]);

  // Run benchmark
  const handleRunBenchmarks = useCallback(async () => {
    setError(null);
    setProgress(null);

    // Validate test cases, setup code and dependencies
    const validationErrors = validateAllTestCases();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      return;
    }

    if (testCases.length === 0) {
      setError(t("pleaseAddTestCase"));
      return;
    }

    setRunning(true);
    clearResults();

    try {
      const workerManager = getBenchmarkWorkerManager();

      if (!workerManager.isAvailable) {
        throw new Error(t("workerUnavailableDesc"));
      }

      // Run benchmark using Web Worker, passing setup code, async mode and dependencies
      const benchmarkResults = await workerManager.runBenchmarks(
        testCases,
        setupCode,
        asyncMode,
        dependencies,
        (progressData) => {
          setProgress(progressData);
        }
      );

      setResults(benchmarkResults);
      setProgress(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : currentLanguage === "zh"
            ? "运行基准测试时发生未知错误"
            : "Unknown error occurred while running benchmark"
      );
      setResults([]);
      setProgress(null);
    } finally {
      setRunning(false);
    }
  }, [
    testCases,
    setupCode,
    asyncMode,
    dependencies,
    setRunning,
    setResults,
    clearResults,
    validateAllTestCases,
    t,
    currentLanguage,
  ]);

  const handleStop = useCallback(() => {
    terminateBenchmarkWorker();
    setRunning(false);
    setProgress(null);
    setError(currentLanguage === "zh" ? "测试已停止" : "Test stopped");
    setTimeout(() => {
      const workerManager = getBenchmarkWorkerManager();
      setWorkerAvailable(workerManager.isAvailable);
    }, 100);
  }, [setRunning, currentLanguage]);

  const handleClearResults = useCallback(() => {
    clearResults();
    setError(null);
    setProgress(null);
  }, [clearResults]);

  const handleReset = useCallback(() => {
    reset();
    setError(null);
    setProgress(null);
  }, [reset]);

  const hasValidTestCases = testCases.some((tc) => {
    if (setupCode.trim()) {
      return validateCodeWithSetup(setupCode, tc.code, asyncMode).isValid;
    } else {
      return validateCode(tc.code, asyncMode).isValid;
    }
  });

  const hasLocalResults = results.length > 0;
  const hasSetupCode = setupCode.trim().length > 0;
  const setupCodeValid =
    !hasSetupCode || validateSetupCode(setupCode, asyncMode).isValid;
  const dependenciesValid = validateDependencies(dependencies).isValid;
  const enabledDependencies = dependencies.filter((dep) => dep.enabled);

  return (
    <div className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
          {t("benchmarkConsole")}
        </h2>
        <div className="flex items-center space-x-2">
          {enabledDependencies.length > 0 && (
            <span
              className={`text-sm flex items-center ${
                dependenciesValid
                  ? "text-green-600 dark:text-dark-accent-green"
                  : "text-red-600 dark:text-dark-accent-red"
              }`}
            >
              <CheckCircle size={16} className="mr-1" />
              {enabledDependencies.length}{" "}
              {currentLanguage === "zh" ? "个依赖" : "dependencies"}
            </span>
          )}
          {hasSetupCode && (
            <span
              className={`text-sm flex items-center ${
                setupCodeValid
                  ? "text-green-600 dark:text-dark-accent-green"
                  : "text-red-600 dark:text-dark-accent-red"
              }`}
            >
              <CheckCircle size={16} className="mr-1" />
              {setupCodeValid ? t("setupCodeValid") : t("setupCodeInvalid")}
            </span>
          )}
          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
            {testCases.length} {t("testCasesCount")}
          </span>
          {!workerAvailable && (
            <span className="text-sm text-amber-600 dark:text-dark-accent-orange flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {t("workerUnavailable")}
            </span>
          )}
          {hasLocalResults && (
            <span className="text-sm text-green-600 dark:text-dark-accent-green flex items-center">
              <CheckCircle size={16} className="mr-1" />
              {t("testCompletedStatus")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {!isRunning ? (
            <button
              onClick={handleRunBenchmarks}
              disabled={
                !hasValidTestCases ||
                !workerAvailable ||
                !setupCodeValid ||
                !dependenciesValid
              }
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                hasValidTestCases &&
                workerAvailable &&
                setupCodeValid &&
                dependenciesValid
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-dark-accent-blue dark:hover:bg-blue-600 text-white"
                  : "bg-gray-300 dark:bg-dark-bg-tertiary text-gray-500 dark:text-dark-text-muted cursor-not-allowed"
              }`}
            >
              <Play size={16} className="mr-2" />
              {t("runBenchmark")}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-dark-accent-red dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Square size={16} className="mr-2" />
              {t("stopTest")}
            </button>
          )}

          <button
            onClick={handleClearResults}
            disabled={!hasLocalResults || isRunning}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              hasLocalResults && !isRunning
                ? "bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-elevated text-gray-700 dark:text-dark-text-primary"
                : "bg-gray-50 dark:bg-dark-bg-primary text-gray-400 dark:text-dark-text-muted cursor-not-allowed"
            }`}
          >
            {t("clearResults")}
          </button>

          <button
            onClick={handleReset}
            disabled={isRunning}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              !isRunning
                ? "bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-elevated text-gray-700 dark:text-dark-text-primary"
                : "bg-gray-50 dark:bg-dark-bg-primary text-gray-400 dark:text-dark-text-muted cursor-not-allowed"
            }`}
          >
            <RotateCcw size={16} className="mr-1" />
            {t("resetAll")}
          </button>
        </div>

        {/* View switch button */}
        {hasResults && (
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg p-1 transition-colors">
            <button
              onClick={() => setActiveView("table")}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-all ${
                activeView === "table"
                  ? "bg-white dark:bg-dark-bg-elevated text-blue-700 dark:text-dark-accent-blue shadow-sm"
                  : "text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary"
              }`}
            >
              <Table size={16} className="mr-2" />
              {t("results")}
            </button>
            <button
              onClick={() => setActiveView("chart")}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-all ${
                activeView === "chart"
                  ? "bg-white dark:bg-dark-bg-elevated text-green-700 dark:text-dark-accent-green shadow-sm"
                  : "text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary"
              }`}
            >
              <BarChart3 size={16} className="mr-2" />
              {t("chart")}
            </button>
          </div>
        )}
      </div>

      {isRunning && (
        <div className="p-3 bg-blue-50 dark:bg-dark-accent-blue/10 border border-blue-200 dark:border-dark-accent-blue/30 rounded-lg mb-4 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner"></div>
            <div>
              <p className="text-blue-800 dark:text-dark-accent-blue font-medium">
                {t("runningBenchmark")}
              </p>
              {progress ? (
                <p className="text-blue-600 dark:text-dark-text-primary text-sm">
                  {progress.name}
                </p>
              ) : (
                <p className="text-blue-600 dark:text-dark-text-primary text-sm">
                  {t("pleaseWait", { count: testCases.length })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-dark-accent-red/10 border border-red-200 dark:border-dark-accent-red/30 rounded-lg mb-4 transition-colors">
          <AlertCircle
            size={20}
            className="text-red-500 dark:text-dark-accent-red mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-red-800 dark:text-dark-accent-red font-medium">
              {t("error")}
            </p>
            <pre className="text-red-600 dark:text-dark-text-primary text-sm whitespace-pre-wrap mt-1">
              {error}
            </pre>
          </div>
        </div>
      )}

      {!workerAvailable && (
        <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-dark-accent-orange/10 border border-amber-200 dark:border-dark-accent-orange/30 rounded-lg mb-4 transition-colors">
          <AlertCircle
            size={20}
            className="text-amber-500 dark:text-dark-accent-orange mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-amber-800 dark:text-dark-accent-orange font-medium">
              {t("workerUnavailable")}
            </p>
            <p className="text-amber-600 dark:text-dark-text-primary text-sm mt-1">
              {t("workerUnavailableDesc")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {testCases.map((testCase) => {
          const validation = validateCode(testCase.code, asyncMode);
          const result = results.find((r) => r.name === testCase.name);

          return (
            <div
              key={testCase.id}
              className={`p-3 border rounded-lg transition-colors ${
                validation.isValid
                  ? result
                    ? result.error
                      ? "border-red-200 dark:border-dark-accent-red/30 bg-red-50 dark:bg-dark-accent-red/10"
                      : "border-green-200 dark:border-dark-accent-green/30 bg-green-50 dark:bg-dark-accent-green/10"
                    : "border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary"
                  : "border-yellow-200 dark:border-dark-accent-orange/30 bg-yellow-50 dark:bg-dark-accent-orange/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-dark-text-primary truncate">
                  {testCase.name}
                </h4>
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    validation.isValid
                      ? result
                        ? result.error
                          ? "bg-red-500 dark:bg-dark-accent-red"
                          : "bg-green-500 dark:bg-dark-accent-green"
                        : "bg-gray-400 dark:bg-dark-text-secondary"
                      : "bg-yellow-500 dark:bg-dark-accent-orange"
                  }`}
                />
              </div>

              <p
                className={`text-xs ${
                  validation.isValid
                    ? result
                      ? result.error
                        ? "text-red-600 dark:text-dark-accent-red"
                        : "text-green-600 dark:text-dark-accent-green"
                      : "text-gray-600 dark:text-dark-text-secondary"
                    : "text-yellow-600 dark:text-dark-accent-orange"
                }`}
              >
                {!validation.isValid
                  ? t("syntaxError")
                  : result
                    ? result.error
                      ? t("executionFailed")
                      : `${result.ops.toLocaleString()} ${t("opsUnit")}`
                    : t("waitingTest")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

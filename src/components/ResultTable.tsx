import React, { useMemo } from "react";
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  Zap,
} from "lucide-react";
import { useBenchmarkStore, BenchmarkResult } from "../store";
import {
  calculateRelativePerformance,
  getPerformanceRanking,
} from "../utils/benchmark";
import { useTranslation } from "../i18n";
import { useLanguageChange } from "../hooks/useLanguageChange";
import { useThemeChange } from "../hooks/useThemeChange";

export const ResultTable: React.FC = () => {
  const { results } = useBenchmarkStore();
  const { t, currentLanguage } = useTranslation();

  useLanguageChange();
  useThemeChange();

  const processedResults = useMemo(() => {
    if (results.length === 0) return [];
    return calculateRelativePerformance(results);
  }, [results]);

  const rankedResults = useMemo(() => {
    return getPerformanceRanking(processedResults);
  }, [processedResults]);

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-primary p-8 h-full flex items-center justify-center transition-colors">
        <div className="text-center text-gray-500 dark:text-dark-text-secondary">
          <Activity
            size={48}
            className="mx-auto mb-4 text-gray-300 dark:text-dark-text-muted"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            {t("noResultsTitle")}
          </h3>
          <p>{t("noResultsDesc")}</p>
        </div>
      </div>
    );
  }

  const hasErrors = results.some((r) => r.error);
  const successfulResults = results.filter((r) => !r.error);
  const optimizedOutResults = results.filter((r) => r.optimizedOut && !r.error);

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-primary overflow-hidden h-full flex flex-col transition-colors">
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary flex-shrink-0 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {t("performanceResults")}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-dark-text-secondary">
            <span>
              {results.length} {t("testCasesCount")}
            </span>
            {hasErrors && (
              <span className="flex items-center text-amber-600 dark:text-dark-accent-orange">
                <AlertTriangle size={16} className="mr-1" />
                {results.filter((r) => r.error).length}{" "}
                {currentLanguage === "zh" ? "个错误" : "errors"}
              </span>
            )}
            {optimizedOutResults.length > 0 && (
              <span className="flex items-center text-orange-600 dark:text-dark-accent-orange">
                <Zap size={16} className="mr-1" />
                {optimizedOutResults.length}{" "}
                {currentLanguage === "zh" ? "个被优化" : "optimized out"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-bg-tertiary sticky top-0 transition-colors">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {t("ranking")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {t("testCase")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {t("operations")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {t("averageTime")} ({t("μs")})
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {'p99'} ({t("μs")})
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {'p75'} ({t("μs")})
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {t("relativePerformance")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary tracking-wider">
                {currentLanguage === "zh" ? "状态" : "Status"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-bg-secondary divide-y divide-gray-200 dark:divide-dark-border-primary transition-colors">
            {processedResults.map((result) => {
              const rank =
                rankedResults.findIndex((r) => r.name === result.name) + 1;
              const isWinner = rank === 1 && !result.error;
              const relativePerf = (result as BenchmarkResult & { relativePerformance?: number }).relativePerformance || 0;

              return (
                <tr
                  key={result.name}
                  className={isWinner ? "bg-green-50 dark:bg-dark-accent-green/10" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="text-gray-400 dark:text-dark-text-muted">
                        -
                      </span>
                    ) : (
                      <div className="flex items-center">
                        {rank === 1 && (
                          <Trophy
                            size={16}
                            className="text-yellow-500 dark:text-dark-accent-orange mr-1"
                          />
                        )}
                        <span
                          className={`font-medium ${
                            rank === 1
                              ? "text-yellow-600 dark:text-dark-accent-orange"
                              : rank <= 3
                                ? "text-green-600 dark:text-dark-accent-green"
                                : "text-gray-600 dark:text-dark-text-secondary"
                          }`}
                        >
                          #{rank}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                          {result.name}
                        </div>
                        {result.error && (
                          <div className="text-xs text-red-500 dark:text-dark-accent-red mt-1">
                            {result.error}
                          </div>
                        )}
                        {result.optimizedOut && !result.error && (
                          <div className="text-xs text-orange-500 dark:text-dark-accent-orange mt-1 flex items-center">
                            <Zap size={10} className="mr-1" />
                            {t("optimizedOutWarning")}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="text-gray-400 dark:text-dark-text-muted">
                        -
                      </span>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                        {result.ops.toLocaleString()}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="text-gray-400 dark:text-dark-text-muted">
                        -
                      </span>
                    ) : (
                      <div className="flex items-center text-sm text-gray-900 dark:text-dark-text-primary">
                        <Clock
                          size={14}
                          className="mr-1 text-gray-400 dark:text-dark-text-muted"
                        />
                        {(result.avg).toFixed(4)}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="text-gray-400 dark:text-dark-text-muted">
                        -
                      </span>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                        {(result.p99).toFixed(4)}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="text-gray-400 dark:text-dark-text-muted">
                        -
                      </span>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                        {(result.p75).toFixed(4)}
                      </div>
                    )}
                  </td>


                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="text-gray-400 dark:text-dark-text-muted">
                        -
                      </span>
                    ) : (
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <TrendingUp
                              size={14}
                              className="mr-1 text-gray-400 dark:text-dark-text-muted"
                            />
                            <span
                              className={`text-sm font-medium ${
                                relativePerf >= 80
                                  ? "text-green-600 dark:text-dark-accent-green"
                                  : relativePerf >= 50
                                    ? "text-yellow-600 dark:text-dark-accent-orange"
                                    : "text-red-600 dark:text-dark-accent-red"
                              }`}
                            >
                              {relativePerf.toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-1 w-20 bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                relativePerf >= 80
                                  ? "bg-green-500 dark:bg-dark-accent-green"
                                  : relativePerf >= 50
                                    ? "bg-yellow-500 dark:bg-dark-accent-orange"
                                    : "bg-red-500 dark:bg-dark-accent-red"
                              }`}
                              style={{ width: `${relativePerf}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.error ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-dark-accent-red/20 text-red-800 dark:text-dark-accent-red">
                        {currentLanguage === "zh" ? "失败" : "Failed"}
                      </span>
                    ) : result.optimizedOut ? (
                      <div className="flex items-center">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-dark-accent-orange/20 text-orange-800 dark:text-dark-accent-orange cursor-help"
                          title={t("optimizedOutTooltip")}
                        >
                          <Zap size={12} className="mr-1" />
                          {t("optimizedOut")}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-dark-accent-green/20 text-green-800 dark:text-dark-accent-green">
                        {currentLanguage === "zh" ? "成功" : "Success"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {successfulResults.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary flex-shrink-0 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">
                {t("fastest")}:
              </span>
              <span className="ml-2 font-medium text-green-600 dark:text-dark-accent-green break-words">
                {rankedResults[0]?.name} (
                {rankedResults[0]?.ops.toLocaleString()} {t("opsUnit")})
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">
                {t("slowest")}:
              </span>
              <span className="ml-2 font-medium text-red-600 dark:text-dark-accent-red break-words">
                {rankedResults[rankedResults.length - 1]?.name} (
                {rankedResults[rankedResults.length - 1]?.ops.toLocaleString()}{" "}
                {t("opsUnit")})
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">
                {t("performanceRatio")}:
              </span>
              <span className="ml-2 font-medium text-blue-600 dark:text-dark-accent-blue">
                {rankedResults.length > 1
                  ? `${(rankedResults[0]?.ops / rankedResults[rankedResults.length - 1]?.ops || 1).toFixed(1)}x`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

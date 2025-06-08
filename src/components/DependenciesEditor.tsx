import React, { useCallback, useState } from "react";
import { Package, Plus, Trash2, ExternalLink } from "lucide-react";
import { useBenchmarkStore, Dependency } from "../store";
import { useTranslation } from "../i18n";
import { useThemeChange } from "../hooks/useThemeChange";
import { useLanguageChange } from "../hooks/useLanguageChange";

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getUrlDisplayName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

export const DependenciesEditor: React.FC = () => {
  const {
    dependencies,
    addDependency,
    removeDependency,
    updateDependency,
    toggleDependency,
  } = useBenchmarkStore();
  const { t, currentLanguage } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  useLanguageChange();
  useThemeChange();

  const enabledDependencies = dependencies.filter((dep) => dep.enabled);

  const handleAddDependency = useCallback(() => {
    addDependency();
    setExpanded(true);
  }, [addDependency]);

  const handleUpdateDependency = useCallback(
    (id: string, field: keyof Dependency, value: string | boolean) => {
      updateDependency(id, { [field]: value });
    },
    [updateDependency]
  );

  return (
    <div className="border-b border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-primary transition-colors">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary transition-colors">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-green-100 dark:bg-dark-accent-green/20 rounded-lg transition-colors flex-shrink-0">
            <Package className="text-green-600 dark:text-dark-accent-green" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 
              className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary truncate"
              title={t("dependencies")}
            >
              {t("dependencies")}
            </h3>
            <p 
              className="text-sm text-gray-500 dark:text-dark-text-secondary truncate"
              title={t("dependencyDescription")}
            >
              {t("dependencyDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {enabledDependencies.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 dark:text-dark-accent-green bg-green-100 dark:bg-dark-accent-green/20 rounded-md">
              {enabledDependencies.length}{" "}
              {currentLanguage === "zh" ? "个已启用" : "enabled"}
            </span>
          )}

          <button
            onClick={handleAddDependency}
            className="flex items-center px-3 py-1.5 text-sm text-green-600 dark:text-dark-accent-green hover:text-green-800 dark:hover:text-dark-text-primary hover:bg-green-100 dark:hover:bg-dark-accent-green/20 rounded-md transition-colors"
          >
            <Plus size={16} className="mr-1" />
            {t("addDependency")}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center px-3 py-1.5 bg-green-100 dark:bg-dark-accent-green/20 hover:bg-green-200 dark:hover:bg-dark-accent-green/30 text-green-700 dark:text-dark-accent-green rounded-md text-sm font-medium transition-colors"
          >
            {expanded ? t("collapse") : t("expand")}
          </button>
        </div>
      </div>

      {/* Dependencies List */}
      {expanded && (
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {dependencies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-text-secondary">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">{t("noDependency")}</p>
            </div>
          ) : (
            dependencies.map((dependency) => (
              <div
                key={dependency.id}
                className={`p-4 border rounded-lg transition-colors ${
                  dependency.enabled
                    ? "border-green-200 dark:border-dark-accent-green/30 bg-green-50 dark:bg-dark-accent-green/10"
                    : "border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-secondary"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Package Name */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleDependency(dependency.id)}
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                          dependency.enabled
                            ? "bg-green-600 dark:bg-dark-accent-green border-green-600 dark:border-dark-accent-green"
                            : "border-gray-300 dark:border-dark-border-secondary"
                        }`}
                      >
                        {dependency.enabled && (
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        )}
                      </button>

                      <input
                        type="text"
                        value={dependency.name}
                        onChange={(e) =>
                          handleUpdateDependency(
                            dependency.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-md bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-dark-accent-green focus:border-green-500 dark:focus:border-dark-accent-green transition-colors"
                        placeholder={t("dependencyName")}
                      />
                    </div>

                    {/* URL */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={dependency.url}
                        onChange={(e) =>
                          handleUpdateDependency(
                            dependency.id,
                            "url",
                            e.target.value
                          )
                        }
                        className={`flex-1 px-3 py-2 border rounded-md bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-dark-accent-green focus:border-green-500 dark:focus:border-dark-accent-green transition-colors ${
                          dependency.url && !validateUrl(dependency.url)
                            ? "border-red-300 dark:border-dark-accent-red"
                            : "border-gray-300 dark:border-dark-border-primary"
                        }`}
                        placeholder="https://cdn.jsdelivr.net/npm/package@version/+esm"
                      />

                      {dependency.url && validateUrl(dependency.url) && (
                        <a
                          href={dependency.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 dark:text-dark-text-muted dark:hover:text-dark-text-secondary transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>

                    {/* URL Info */}
                    {dependency.url && validateUrl(dependency.url) && (
                      <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                        <span className="font-medium">
                          {t("source")}:
                        </span>{" "}
                        {getUrlDisplayName(dependency.url)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeDependency(dependency.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 dark:text-dark-text-muted dark:hover:text-dark-accent-red transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Enable Summary */}
      {!expanded && enabledDependencies.length > 0 && (
        <div className="p-3 bg-green-50 dark:bg-dark-accent-green/10 border-t border-green-200 dark:border-dark-accent-green/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-dark-accent-green">
              <Package size={16} />
              <span>
                {currentLanguage === "zh"
                  ? `已启用 ${enabledDependencies.length} 个依赖:`
                  : `${enabledDependencies.length} dependencies enabled:`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {enabledDependencies.slice(0, 3).map((dep) => (
                <span
                  key={dep.id}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 dark:text-dark-accent-green bg-green-100 dark:bg-dark-accent-green/20 rounded"
                >
                  {dep.name}
                </span>
              ))}
              {enabledDependencies.length > 3 && (
                <span className="text-xs text-green-600 dark:text-dark-accent-green">
                  +{enabledDependencies.length - 3}{" "}
                  {currentLanguage === "zh" ? "个更多" : "more"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

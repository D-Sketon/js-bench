import React, { useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { Settings, Code, AlertCircle } from "lucide-react";
import { useBenchmarkStore } from "../store";
import { formatCode, validateSetupCode } from "../utils/benchmark";
import { useTranslation } from "../i18n";
import { useTheme } from "../hooks/useTheme";
import { useThemeChange } from "../hooks/useThemeChange";
import { useLanguageChange } from "../hooks/useLanguageChange";

export const SetupCodeEditor: React.FC = () => {
  const { setupCode, updateSetupCode } = useBenchmarkStore();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isFormatting, setIsFormatting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLanguageChange();
  useThemeChange();

  const handleFormatCode = useCallback(async () => {
    if (isFormatting || !setupCode.trim()) return;

    setIsFormatting(true);
    try {
      const formatted = await formatCode(setupCode);
      updateSetupCode(formatted);
    } catch (error) {
      console.error("Setup Code Formatting Error:", error);
    } finally {
      setIsFormatting(false);
    }
  }, [setupCode, updateSetupCode, isFormatting]);

  const validation = validateSetupCode(setupCode);
  const hasCode = setupCode.trim().length > 0;

  return (
    <div className="border-b border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-primary transition-colors">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary transition-colors">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-purple-100 dark:bg-dark-accent-purple/20 rounded-lg transition-colors flex-shrink-0">
            <Settings
              className="text-purple-600 dark:text-dark-accent-purple"
              size={20}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 
              className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary truncate"
              title={t("setupCode")}
            >
              {t("setupCode")}
            </h3>
            <p 
              className="text-sm text-gray-500 dark:text-dark-text-secondary truncate"
              title={t("setupCodeDescription")}
            >
              {t("setupCodeDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {hasCode && (
            <>
              {!validation.isValid && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 dark:text-dark-accent-red bg-red-100 dark:bg-dark-accent-red/20 rounded-md">
                  {t("syntaxError")}
                </span>
              )}
              {validation.isValid && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 dark:text-dark-accent-green bg-green-100 dark:bg-dark-accent-green/20 rounded-md">
                  {t("syntaxValid")}
                </span>
              )}
            </>
          )}

          <button
            onClick={handleFormatCode}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
          >
            <Code size={16} className="mr-1" />
            {t("formatCode")}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center px-3 py-1.5 bg-purple-100 dark:bg-dark-accent-purple/20 hover:bg-purple-200 dark:hover:bg-dark-accent-purple/30 text-purple-700 dark:text-dark-accent-purple rounded-md text-sm font-medium transition-colors"
          >
            {expanded ? t("collapse") : t("expand")}
          </button>
        </div>
      </div>
      <div
        className={`transition-all duration-300 overflow-auto ${
          expanded ? "max-h-96" : "max-h-32"
        }`}
      >
        <div className="h-full">
          <CodeMirror
            value={setupCode}
            onChange={(value) => updateSetupCode(value)}
            extensions={[javascript()]}
            theme={theme === "dark" ? oneDark : undefined}
            className="h-full"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true,
            }}
            editable={true}
            readOnly={false}
          />
        </div>
      </div>
      {hasCode && !validation.isValid && (
        <div className="p-3 bg-red-50 dark:bg-dark-accent-red/10 border-t border-red-200 dark:border-dark-accent-red/30 transition-colors">
          <div className="flex items-start space-x-2">
            <AlertCircle
              size={16}
              className="text-red-500 dark:text-dark-accent-red mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-red-800 dark:text-dark-accent-red font-medium text-sm">
                {t("setupCodeError")}
              </p>
              <p className="text-red-600 dark:text-dark-text-primary text-sm mt-1">
                {validation.error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

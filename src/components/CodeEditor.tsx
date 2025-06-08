import React, { useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { X, Plus, Edit2, Code, Info } from "lucide-react";
import { useBenchmarkStore } from "../store";
import { formatCode, validateCode } from "../utils/benchmark";
import { useTranslation } from "../i18n";
import { useTheme } from "../hooks/useTheme";
import { useLanguageChange } from "../hooks/useLanguageChange";
import { useThemeChange } from "../hooks/useThemeChange";

export const CodeEditor: React.FC = () => {
  const {
    testCases,
    selectedTabId,
    addTestCase,
    removeTestCase,
    updateTestCase,
    setSelectedTab,
    asyncMode,
    setAsyncMode,
  } = useBenchmarkStore();

  const { t, currentLanguage } = useTranslation();
  const { theme } = useTheme();

  useLanguageChange();
  useThemeChange();

  const selectedTestCase = testCases.find((tc) => tc.id === selectedTabId);

  const handleCodeChange = useCallback(
    (value: string) => {
      if (selectedTabId) {
        updateTestCase(selectedTabId, { code: value });
      }
    },
    [selectedTabId, updateTestCase]
  );

  const handleNameChange = useCallback(
    (id: string, name: string) => {
      updateTestCase(id, { name });
    },
    [updateTestCase]
  );

  const handleFormatCode = useCallback(async () => {
    if (selectedTestCase) {
      try {
        const formattedCode = await formatCode(selectedTestCase.code);
        updateTestCase(selectedTestCase.id, { code: formattedCode });
      } catch (error) {
        console.error("Test Case Formatting Error:", error);
      }
    }
  }, [selectedTestCase, updateTestCase]);

  const validateCurrentCode = useCallback(() => {
    if (selectedTestCase) {
      return validateCode(selectedTestCase.code, asyncMode);
    }
    return { isValid: true };
  }, [selectedTestCase, asyncMode]);

  const validation = validateCurrentCode();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg-secondary transition-colors">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary transition-colors">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-100 dark:bg-dark-accent-blue/20 rounded-lg transition-colors flex-shrink-0">
            <Edit2 className="text-blue-600 dark:text-dark-accent-blue" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 
              className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary truncate"
              title={t("testCases")}
            >
              {t("testCases")}
            </h3>
            <p 
              className="text-sm text-gray-500 dark:text-dark-text-secondary truncate"
              title={t("testCaseDescription")}
            >
              {t("testCaseDescription")}
            </p>
          </div>
        </div>
      </div>
      <div className="flex bg-gray-50 dark:bg-dark-bg-tertiary border-b border-gray-200 dark:border-dark-border-primary flex-shrink-0 transition-colors">
        {/* 可滚动的标签页区域 */}
        <div className="flex items-center overflow-x-auto flex-1 min-w-0">
          {testCases.map((testCase) => (
            <div
              key={testCase.id}
              className={`flex items-center min-w-0 max-w-48 border-r border-gray-200 dark:border-dark-border-primary shrink-0 ${
                selectedTabId === testCase.id
                  ? "bg-white dark:bg-dark-bg-secondary border-b-white dark:border-b-dark-bg-secondary shadow-sm"
                  : "bg-gray-50 dark:bg-dark-bg-tertiary hover:bg-gray-100 dark:hover:bg-dark-bg-elevated"
              } transition-colors`}
            >
              <div
                onClick={() => setSelectedTab(testCase.id)}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors min-w-0 flex-1"
              >
                <TestCaseNameEditor
                  testCase={testCase}
                  isSelected={selectedTabId === testCase.id}
                  onNameChange={handleNameChange}
                />
              </div>
              {testCases.length > 1 && (
                <button
                  onClick={() => removeTestCase(testCase.id)}
                  className="p-2 text-gray-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-dark-accent-red hover:bg-red-50 dark:hover:bg-dark-accent-red/10 rounded-md mr-1 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* 固定在右边的添加按钮 */}
        <div className="flex-shrink-0 border-l border-gray-200 dark:border-dark-border-primary">
          <button
            onClick={addTestCase}
            className="flex items-center px-4 py-3 text-sm text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-elevated transition-colors whitespace-nowrap h-full"
          >
            <Plus size={16} className="mr-2" />
            {t("addTestCase")}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary flex-shrink-0 transition-colors">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <span 
            className="text-sm font-medium text-gray-700 dark:text-dark-text-primary truncate"
            title={selectedTestCase?.name}
          >
            {selectedTestCase?.name || t("noTestCase")}
          </span>
          {!validation.isValid && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 dark:text-dark-accent-red bg-red-100 dark:bg-dark-accent-red/20 rounded-md">
              {t("syntaxError")}
            </span>
          )}
          
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
          {validation.isValid && selectedTestCase && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 dark:text-dark-accent-green bg-green-100 dark:bg-dark-accent-green/20 rounded-md">
              {t("syntaxValid")}
            </span>
          )}
            <label className="flex items-center text-sm text-gray-600 dark:text-dark-text-secondary">
              <input
                type="checkbox"
                checked={asyncMode}
                onChange={(e) => setAsyncMode(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-dark-border-primary rounded"
              />
              {t("asyncMode")}
            </label>
          </div>
          <button
            onClick={handleFormatCode}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
          >
            <Code size={16} className="mr-1" />
            {t("formatCode")}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-dark-bg-primary min-h-0 transition-colors">
        {selectedTestCase ? (
          <div className="h-full">
            <CodeMirror
              key={`${selectedTestCase.id}-${theme}`}
              value={selectedTestCase.code}
              height="100%"
              theme={theme === "dark" ? oneDark : "light"}
              extensions={[javascript()]}
              onChange={handleCodeChange}
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
              style={{
                fontSize: "14px",
                fontFamily:
                  '"Fira Code", "JetBrains Mono", "Source Code Pro", "SF Mono", Monaco, Consolas, "Ubuntu Mono", monospace',
                lineHeight: "1.5",
                height: "100%",
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-bg-tertiary transition-colors">
            <div className="text-center">
              <Code
                size={48}
                className="mx-auto mb-4 text-gray-300 dark:text-dark-text-muted"
              />
              <p className="text-lg font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                {currentLanguage === "zh"
                  ? "请选择一个测试用例开始编辑"
                  : "Please select a test case to start editing"}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                {currentLanguage === "zh"
                  ? "点击上方标签页或添加新的测试用例"
                  : "Click on a tab above or add a new test case"}
              </p>
            </div>
          </div>
        )}
      </div>

      {!validation.isValid && validation.error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-dark-accent-red/10 border-t border-red-200 dark:border-dark-accent-red/30 flex-shrink-0 transition-colors">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-red-500 dark:bg-dark-accent-red rounded-full mt-1.5"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-dark-accent-red">
                {t("syntaxError")}
              </p>
              <p className="text-sm text-red-700 dark:text-dark-text-primary mt-1">
                {validation.error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 bg-white dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border-primary flex-shrink-0 transition-colors">
        <div className="flex items-center space-x-2">
          <Info size={16} className="text-gray-500 dark:text-dark-text-secondary" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              {t("doNotOptimizeHint")}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
              {t("doNotOptimizeDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestCaseNameEditor: React.FC<{
  testCase: { id: string; name: string };
  isSelected: boolean;
  onNameChange: (id: string, name: string) => void;
}> = ({ testCase, isSelected, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(testCase.name);
  const { t } = useTranslation();

  const handleSave = useCallback(() => {
    if (editingName.trim()) {
      onNameChange(testCase.id, editingName.trim());
    } else {
      setEditingName(testCase.name);
    }
    setIsEditing(false);
  }, [editingName, testCase.id, testCase.name, onNameChange]);

  const handleCancel = useCallback(() => {
    setEditingName(testCase.name);
    setIsEditing(false);
  }, [testCase.name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  if (isEditing) {
    return (
      <div className="flex items-center">
        <input
          type="text"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-32 px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="flex items-center group min-w-0">
      <span 
        className="truncate font-medium min-w-0 flex-1" 
        title={testCase.name}
      >
        {testCase.name}
      </span>
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="ml-2 p-1 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-all flex-shrink-0"
          title={t("renameTestCase")}
        >
          <Edit2 size={12} />
        </button>
      )}
    </div>
  );
};

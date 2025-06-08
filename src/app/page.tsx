"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { CodeEditor } from "../components/CodeEditor";
import { SetupCodeEditor } from "../components/SetupCodeEditor";
import { DependenciesEditor } from "../components/DependenciesEditor";
import { BenchmarkRunner } from "../components/BenchmarkRunner";
import { ResultTable } from "../components/ResultTable";
import { ChartVisualizer } from "../components/ChartVisualizer";
import { ShareDialog } from "../components/ShareDialog";
import { DynamicHead } from "../components/DynamicHead";
import { useBenchmarkStore } from "../store";
import { useTranslation, Language } from "../i18n";
import { useTheme } from "../hooks/useTheme";
import { ExpiryOption } from "../lib/redis";
import {
  Code,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  GripVertical,
  Share2,
  Github,
} from "lucide-react";
import { useThemeChange } from "../hooks/useThemeChange";
import { useLanguageChange } from "../hooks/useLanguageChange";
import Image from "next/image";

export default function HomePage() {
  const { results, testCases, setupCode, dependencies, asyncMode } =
    useBenchmarkStore();
  const { t, setLanguage, currentLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "chart">("table");

  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useThemeChange();
  useLanguageChange();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasResults = results.length > 0;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.classList.add("dragging");
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      const clampedWidth = Math.max(25, Math.min(75, newLeftWidth));
      setLeftPanelWidth(clampedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove("dragging");
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleShareClick = () => {
    setShowShareDialog(true);
  };

  const handleShare = async (title: string, expiryOption: ExpiryOption) => {
    setIsSharing(true);
    try {
      const shareData = {
        title,
        testCases,
        setupCode,
        dependencies,
        asyncMode,
        results,
        expiryOption,
        timestamp: Date.now(),
      };

      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shareData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShareUrl(result.url);
          setShowShareDialog(false);
        } else {
          throw new Error(result.error || t("shareFailed"));
        }
      } else {
        throw new Error(t("shareFailed"));
      }
    } catch (error) {
      console.error("Share failed:", error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleCloseShareSuccess = () => {
    setShareUrl("");
    setCopied(false);
  };

  const getLeftPanelStyle = () => {
    if (!isClient) {
      return {
        width: "50%",
        minWidth: "auto",
        maxWidth: "auto",
      };
    }

    const isLargeScreen = window.innerWidth >= 1024;
    return {
      width: isLargeScreen ? `${leftPanelWidth}%` : "100%",
      minWidth: isLargeScreen ? "300px" : "auto",
      maxWidth: isLargeScreen ? "75%" : "auto",
    };
  };

  const getRightPanelStyle = () => {
    if (!isClient) {
      return {
        width: "100%",
      };
    }

    const isLargeScreen = window.innerWidth >= 1024;
    return {
      width: isLargeScreen ? `${100 - leftPanelWidth}%` : "100%",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex flex-col transition-colors">
      <DynamicHead />
      
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary px-4 py-4 shadow-sm z-30 relative transition-colors" role="banner">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 dark:text-dark-text-secondary hover:text-gray-600 dark:hover:text-dark-text-primary rounded-md transition-colors"
              aria-label={t("openMenu")}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="rounded-lg shrink-0 overflow-hidden">
                <Image src="/icon.png" alt="Mitata JavaScript Performance Benchmark Tool Logo" className="w-8 h-8" width={32} height={32} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {t("title")}
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-2" role="navigation" aria-label="Main navigation">
            <button
              onClick={handleShareClick}
              disabled={isSharing}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
              aria-label={isSharing ? t("shareGenerating") : t("share")}
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">{isSharing ? t("shareGenerating") : t("share")}</span>
            </button>
            <a
              href="https://github.com/D-Sketon/js-bench"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
              aria-label="View source code on GitHub"
            >
              <Github size={18} />
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
              aria-label={theme === "light" ? t("switchToDarkMode") : t("switchToLightMode")}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="flex items-center space-x-2 p-2">
              <Globe
                size={16}
                className="text-gray-500 dark:text-dark-text-secondary"
                aria-hidden="true"
              />
              <label htmlFor="language-select" className="sr-only">
                {t("selectLanguage")}
              </label>
              <select
                id="language-select"
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-sm border border-gray-300 dark:border-dark-border-primary rounded px-2 py-1 bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary hover:border-gray-400 dark:hover:border-dark-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent-blue focus:border-blue-500 dark:focus:border-dark-accent-blue transition-colors"
                aria-label={t("selectLanguage")}
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </nav>
        </div>
      </header>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShare={handleShare}
        isSharing={isSharing}
        shareUrl={shareUrl}
        onCopyUrl={handleCopy}
        copied={copied}
        onCloseSuccess={handleCloseShareSuccess}
      />

      <main className="flex-1 flex overflow-hidden" ref={containerRef} role="main">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-dark-bg-secondary shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:inset-auto lg:shadow-none lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
          style={getLeftPanelStyle()}
          role="complementary"
          aria-label={t("codeEditor")}
        >
          {/* Mobile title bar */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-secondary transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {t("code")}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 dark:text-dark-text-secondary hover:text-gray-600 dark:hover:text-dark-text-primary rounded-md transition-colors"
              aria-label={t("closeMenu")}
            >
              <X size={20} />
            </button>
          </div>

          {/* Code editor area */}
          <div className="h-full flex flex-col">
            {/* Dependencies editor */}
            <section aria-label={t("dependencies")}>
              <DependenciesEditor />
            </section>

            {/* Setup code editor */}
            <section aria-label={t("setupCode")}>
              <SetupCodeEditor />
            </section>

            {/* Test case code editor */}
            <section className="flex-1" aria-label={t("testCases")}>
              <CodeEditor />
            </section>
          </div>
        </aside>

        {/* Resizer */}
        <div
          className="hidden lg:flex items-center justify-center w-1 bg-gray-200 dark:bg-dark-border-primary hover:bg-gray-300 dark:hover:bg-dark-border-secondary cursor-col-resize transition-colors group relative"
          onMouseDown={handleMouseDown}
          role="separator"
          aria-label={t("resizePanels")}
          tabIndex={0}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <GripVertical
              size={16}
              className="text-gray-400 dark:text-dark-text-muted group-hover:text-gray-600 dark:group-hover:text-dark-text-secondary transition-colors"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Right Panel - Main content area */}
        <section
          className="flex-1 flex flex-col min-w-0 bg-white dark:bg-dark-bg-secondary transition-colors"
          style={getRightPanelStyle()}
          aria-label={t("benchmarkResults")}
        >
          {/* Content area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Benchmark control console */}
            <div className="flex-shrink-0">
              <BenchmarkRunner
                activeView={activeView}
                setActiveView={setActiveView}
                hasResults={hasResults}
              />
            </div>

            {/* Result display area */}
            <div className="flex-1 p-6 bg-gray-50 dark:bg-dark-bg-primary min-h-0 transition-colors">
              {!hasResults ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-dark-text-secondary max-w-md">
                    <div className="p-3 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm mb-4 inline-block transition-colors">
                      <Code
                        size={48}
                        className="text-blue-500 dark:text-dark-accent-blue"
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-500 dark:text-dark-text-primary mb-3">
                      {currentLanguage === "zh"
                        ? "编写代码，开始性能测试"
                        : "Write code and start performance testing"}
                    </h2>
                    <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                      {currentLanguage === "zh"
                        ? "在左侧编写您的 JavaScript 代码，添加测试用例，然后点击运行按钮查看详细的性能分析结果。"
                        : "Write your JavaScript code on the left, add test cases, then click the run button to see detailed performance analysis results."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {activeView === "table" ? (
                    <div className="h-full overflow-y-auto" role="region" aria-label={t("resultsTable")}>
                      <ResultTable />
                    </div>
                  ) : (
                    <div className="h-full" role="region" aria-label={t("resultsChart")}>
                      <ChartVisualizer />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border-primary px-6 py-4 z-30 transition-colors" role="contentinfo">
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-dark-text-secondary">
          <span className="flex items-center space-x-1">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by</span>
            <span className="font-semibold text-gray-700 dark:text-dark-text-primary">D-Sketon</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBenchmarkStore, TestCase, BenchmarkResult, Dependency } from '../../../store';
import { CodeEditor } from '../../../components/CodeEditor';
import { SetupCodeEditor } from '../../../components/SetupCodeEditor';
import { DependenciesEditor } from '../../../components/DependenciesEditor';
import { BenchmarkRunner } from '../../../components/BenchmarkRunner';
import { ResultTable } from '../../../components/ResultTable';
import { ChartVisualizer } from '../../../components/ChartVisualizer';
import { ShareDialog } from '../../../components/ShareDialog';
import { DynamicHead } from '../../../components/DynamicHead';
import { useTranslation, Language } from '../../../i18n';
import { useTheme } from '../../../hooks/useTheme';
import { ExpiryOption } from '../../../lib/redis';
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
} from 'lucide-react';
import { useThemeChange } from '../../../hooks/useThemeChange';
import { useLanguageChange } from '../../../hooks/useLanguageChange';
import Image from 'next/image';

interface ShareData {
  testCases: TestCase[];
  setupCode: string;
  dependencies: Dependency[];
  asyncMode: boolean;
  results: BenchmarkResult[];
  timestamp: number;
  createdAt: string;
  title: string;
  expiryOption?: ExpiryOption;
}

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;
  
  const { 
    setTestCases, 
    setSetupCode, 
    setDependencies, 
    setAsyncMode, 
    setResults,
    results,
    testCases,
    setupCode,
    dependencies,
    asyncMode
  } = useBenchmarkStore();
  
  const { t, setLanguage, currentLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "chart">("table");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // share
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useThemeChange();
  useLanguageChange();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasResults = results.length > 0;

  useEffect(() => {
    const loadShareData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/share?id=${shareId}`);
        
        if (!response.ok) {
          throw new Error(t('shareFailed'));
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || t('shareFailed'));
        }
        
        const data: ShareData = result.data;
        setShareData(data);
        
        setTestCases(data.testCases || []);
        setSetupCode(data.setupCode || '');
        setDependencies(data.dependencies || []);
        setAsyncMode(data.asyncMode || false);
        setResults(data.results || []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : t('shareFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    if (shareId) {
      loadShareData();
    }
  }, [shareId, setTestCases, setSetupCode, setDependencies, setAsyncMode, setResults, t]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            {currentLanguage === 'zh' ? '加载分享内容中...' : 'Loading shared content...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            {currentLanguage === 'zh' ? '加载失败' : 'Loading Failed'}
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {currentLanguage === 'zh' ? '返回首页' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex flex-col transition-colors">
      <DynamicHead />
      
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary px-4 py-3 shadow-sm z-30 relative transition-colors">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 dark:text-dark-text-secondary hover:text-gray-600 dark:hover:text-dark-text-primary rounded-md transition-colors"
              aria-label={t("openMenu")}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-3 min-w-0">
              <div className="rounded-lg shrink-0 overflow-hidden">
                <Image src="/icon.png" alt="Mitata JavaScript Performance Benchmark Tool Logo" className="w-8 h-8" width={32} height={32} />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary truncate">
                  {shareData?.title || `${t("title")} - ${t("shareContent")}`}
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                  {shareData && `${currentLanguage === 'zh' ? '创建于' : 'Created at'} ${new Date(shareData.createdAt).toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US')}`}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            <button
              onClick={handleShareClick}
              disabled={isSharing}
              className="p-2.5 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200"
              aria-label={isSharing ? t("shareGenerating") : t("share")}
            >
              <Share2 size={18} />
            </button>
            <a
              href="https://github.com/D-Sketon/js-bench"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200"
              aria-label="View source code on GitHub"
              title="View on GitHub"
            >
              <Github size={18} />
            </a>

            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200"
              aria-label={theme === "light" ? t("switchToDarkMode") : t("switchToLightMode")}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg px-3 py-2">
              <Globe
                size={16}
                className="text-gray-500 dark:text-dark-text-secondary shrink-0 hidden sm:block"
                aria-hidden="true"
              />
              <label htmlFor="language-select" className="sr-only">
                {t("selectLanguage")}
              </label>
              <select
                id="language-select"
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-sm border-0 bg-transparent text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-0 cursor-pointer font-medium"
                aria-label={t("selectLanguage")}
              >
                <option value="en" className="bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary">EN</option>
                <option value="zh" className="bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary">中文</option>
              </select>
            </div>
          </nav>
        </div>
      </header>

      {/* 分享弹窗 */}
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

      {/* Content */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Panel - Code editor area */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-dark-bg-secondary shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:inset-auto lg:shadow-none lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
          style={getLeftPanelStyle()}
        >
          {/* Mobile title bar */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-secondary transition-colors">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {t("code")}
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 dark:text-dark-text-secondary hover:text-gray-600 dark:hover:text-dark-text-primary rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Code editor area */}
          <div className="h-full lg:h-full flex flex-col overflow-y-auto lg:overflow-hidden mobile-editor-container">
            {/* Dependencies editor */}
            <DependenciesEditor />

            {/* Setup code editor */}
            <SetupCodeEditor />

            {/* Test case code editor */}
            <div className="flex-1">
              <CodeEditor />
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className="hidden lg:flex items-center justify-center w-1 bg-gray-200 dark:bg-dark-border-primary hover:bg-gray-300 dark:hover:bg-dark-border-secondary cursor-col-resize transition-colors group relative"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <GripVertical 
              size={16} 
              className="text-gray-400 dark:text-dark-text-muted group-hover:text-gray-600 dark:group-hover:text-dark-text-secondary transition-colors" 
            />
          </div>
        </div>

        {/* Right Panel - Main content area */}
        <div 
          className="flex-1 flex flex-col min-w-0 bg-white dark:bg-dark-bg-secondary transition-colors"
          style={getRightPanelStyle()}
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
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center text-gray-500 dark:text-dark-text-secondary max-w-lg">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-dark-bg-secondary dark:to-dark-bg-tertiary rounded-2xl shadow-sm mb-6 inline-block transition-colors">
                      <Code
                        size={56}
                        className="text-blue-500 dark:text-dark-accent-blue"
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary mb-4">
                      {currentLanguage === "zh"
                        ? "查看分享的性能测试"
                        : "View Shared Performance Test"}
                    </h2>
                    <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed text-lg mb-6">
                      {currentLanguage === "zh"
                        ? "这是一个分享的基准测试。您可以查看代码、运行测试或创建自己的副本。"
                        : "This is a shared benchmark test. You can view the code, run tests, or create your own copy."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-gray-500 dark:text-dark-text-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{currentLanguage === "zh" ? "查看代码" : "View Code"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{currentLanguage === "zh" ? "运行测试" : "Run Tests"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>{currentLanguage === "zh" ? "分享结果" : "Share Results"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {activeView === "table" ? (
                    <div className="h-full overflow-y-auto">
                      <ResultTable />
                    </div>
                  ) : (
                    <div className="h-full">
                      <ChartVisualizer />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border-primary px-6 py-4 z-30 transition-colors">
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
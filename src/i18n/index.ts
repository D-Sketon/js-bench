export type Language = "en" | "zh";

interface Translations {
  // Header
  title: string;
  subtitle: string;

  // Navigation
  code: string;
  results: string;
  chart: string;

  // Code Editor
  testCases: string;
  testCaseDescription: string;
  addTestCase: string;
  removeTestCase: string;
  renameTestCase: string;
  formatCode: string;
  validateCode: string;
  noTestCase: string;
  asyncMode: string;
  doNotOptimizeHint: string;
  doNotOptimizeDescription: string;

  // Setup Code
  setupCode: string;
  setupCodeValid: string;
  setupCodeInvalid: string;
  setupCodeError: string;
  setupCodeDescription: string;

  // Dependencies
  dependencies: string;
  addDependency: string;
  removeDependency: string;
  dependencyName: string;
  dependencyUrl: string;
  dependencyMode: string;
  globalVariableName: string;
  enableDependency: string;
  dependencyDescription: string;
  noDependency: string;
  source: string;

  // Test Case Management
  testCaseName: string;
  newTestCase: string;
  enterTestCaseName: string;
  testCaseExists: string;

  // Benchmark Runner
  benchmarkConsole: string;
  testCasesCount: string;
  workerUnavailable: string;
  testCompletedStatus: string;
  runBenchmark: string;
  stopTest: string;
  clearResults: string;
  resetAll: string;
  runningBenchmark: string;
  pleaseWait: string;
  error: string;
  workerUnavailableDesc: string;
  waitingTest: string;
  syntaxError: string;
  syntaxValid: string;
  executionFailed: string;

  // Progress Messages
  validatingTestCases: string;
  preparingBenchmark: string;
  runningBenchmarkEllipsis: string;
  runningBenchmarkProgress: string;
  benchmarkCompleted: string;
  processingResults: string;
  testing: string;
  testCompleted: string;

  // Results Table
  performanceResults: string;
  testCase: string;
  operations: string;
  averageTime: string;
  relativePerformance: string;
  ranking: string;
  fastest: string;
  slowest: string;
  baseline: string;
  slower: string;
  faster: string;
  noResultsTitle: string;
  noResultsDesc: string;
  performanceRatio: string;

  // Chart Visualizer
  performanceVisualization: string;
  noChartDataTitle: string;
  noChartDataDesc: string;
  barChart: string;
  opsPerSec: string;
  avgTime: string;
  opsPerSecK: string;
  performance: string;

  // Share
  share: string;
  shareTitle: string;
  shareDescription: string;
  shareSuccess: string;
  shareFailed: string;
  shareGenerating: string;
  shareUrl: string;
  copyLink: string;
  copied: string;
  close: string;
  shareContent: string;
  enterShareTitle: string;
  shareTitlePlaceholder: string;
  shareExpiry: string;
  shareExpiry7d: string;
  shareExpiry30d: string;
  shareExpiryDescription: string;
  shareExpiry7dDesc: string;
  shareExpiry30dDesc: string;
  shareValidationTitle: string;
  shareValidationMessage: string;

  // Common
  name: string;
  value: string;
  actions: string;
  confirm: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;

  // Validation Messages
  pleaseAddTestCase: string;
  codeCompileError: string;
  codeExecutionError: string;
  testCaseNotExecuted: string;
  optimizedOut: string;
  optimizedOutWarning: string;
  optimizedOutTooltip: string;

  // Units
  ms: string;
  μs: string;
  ns: string;
  opsUnit: string;

  // Dependencies Editor
  expand: string;
  collapse: string;

  // Accessibility and SEO
  openMenu: string;
  closeMenu: string;
  switchToDarkMode: string;
  switchToLightMode: string;
  selectLanguage: string;
  codeEditor: string;
  resizePanels: string;
  benchmarkResults: string;
  resultsTable: string;
  resultsChart: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: "JS Mitata Benchmark",
    subtitle: "Professional JavaScript performance benchmarking platform",

    // Navigation
    code: "Code Editor",
    results: "Results",
    chart: "Chart",

    // Code Editor
    testCases: "Test Cases",
    testCaseDescription: "Write test cases here",
    addTestCase: "Add Test Case",
    removeTestCase: "Remove Test Case",
    renameTestCase: "Rename Test Case",
    formatCode: "Format Code",
    validateCode: "Validate Code",
    noTestCase: "No test case selected",
    asyncMode: "Async Mode",
    doNotOptimizeHint: "Use do_not_optimize()",
    doNotOptimizeDescription: "Call do_not_optimize(value) to prevent the JavaScript engine from optimizing away your code. Useful for preventing dead code elimination in benchmarks.",

    // Setup Code
    setupCode: "Setup Code",
    setupCodeValid: "Setup code valid",
    setupCodeInvalid: "Setup code invalid",
    setupCodeError: "Setup code error",
    setupCodeDescription: "Define global variables and helper functions here",

    // Dependencies
    dependencies: "Dependencies",
    addDependency: "Add",
    removeDependency: "Remove Dependency",
    dependencyName: "Package Name",
    dependencyUrl: "CDN URL",
    dependencyMode: "Mode",
    globalVariableName: "Global Variable Name",
    enableDependency: "Enable Dependency",
    dependencyDescription: "Import third-party packages via CDN, supports ESM",
    noDependency: "No dependencies yet, click the button above to add packages",
    source: "Source",

    // Test Case Management
    testCaseName: "Test Case Name",
    newTestCase: "New Test Case",
    enterTestCaseName: "Enter test case name",
    testCaseExists: "Test case name already exists",

    // Benchmark Runner
    benchmarkConsole: "Benchmark Console",
    testCasesCount: "test cases",
    workerUnavailable: "Worker unavailable",
    testCompletedStatus: "Test completed",
    runBenchmark: "Run Benchmark",
    stopTest: "Stop Test",
    clearResults: "Clear Results",
    resetAll: "Reset All",
    runningBenchmark: "Running benchmark...",
    pleaseWait: "Please wait patiently while testing {count} cases",
    error: "Error",
    workerUnavailableDesc:
      "Your browser may not support Web Workers, or Worker initialization failed. Benchmark functionality will be unavailable.",
    waitingTest: "Waiting for test",
    syntaxError: "Syntax error",
    syntaxValid: "Syntax valid",
    executionFailed: "Execution failed",

    // Progress Messages
    validatingTestCases: "Validating test cases...",
    preparingBenchmark: "Preparing benchmark...",
    runningBenchmarkEllipsis: "Running benchmark, please wait...",
    runningBenchmarkProgress: "Running benchmark",
    benchmarkCompleted: "Benchmark completed",
    processingResults: "Processing results...",
    testing: "Testing",
    testCompleted: "Test completed",

    // Results Table
    performanceResults: "Performance Results",
    testCase: "Test Case",
    operations: "Operations/sec",
    averageTime: "Average Time",
    relativePerformance: "Relative Performance",
    ranking: "Ranking",
    fastest: "Fastest",
    slowest: "Slowest",
    baseline: "baseline",
    slower: "slower",
    faster: "faster",
    noResultsTitle: "No Test Results",
    noResultsDesc: "Please run benchmark tests to view performance results",
    performanceRatio: "Performance Ratio",

    // Chart Visualizer
    performanceVisualization: "Performance Visualization",
    noChartDataTitle: "No Chart Data",
    noChartDataDesc:
      "Please run benchmark tests to view performance visualization charts",
    barChart: "Bar Chart",
    opsPerSec: "ops/sec",
    avgTime: "Avg Time",
    opsPerSecK: "Ops/s (K)",
    performance: "Performance",

    // Share
    share: "Share",
    shareTitle: "Share Title",
    shareDescription: "Share your benchmark test with others",
    shareSuccess: "Share link generated successfully",
    shareFailed: "Failed to generate share link, please try again",
    shareGenerating: "Generating...",
    shareUrl: "Share URL",
    copyLink: "Copy",
    copied: "Copied",
    close: "Close",
    shareContent: "Shared Content",
    enterShareTitle: "Enter share title",
    shareTitlePlaceholder: "My Performance Test",
    shareExpiry: "Expiry",
    shareExpiry7d: "7 days",
    shareExpiry30d: "30 days",
    shareExpiryDescription: "Share link expiry",
    shareExpiry7dDesc: "Expires in 7 days",
    shareExpiry30dDesc: "Expires in 30 days",
    shareValidationTitle: "Share Validation",
    shareValidationMessage: "Enter validation code",

    // Common
    name: "Name",
    value: "Value",
    actions: "Actions",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",

    // Validation Messages
    pleaseAddTestCase: "Please add at least one test case",
    codeCompileError: "Code compilation error",
    codeExecutionError: "Code execution error",
    testCaseNotExecuted: "Test case not executed",
    optimizedOut: "Optimized Out",
    optimizedOutWarning: "Code may have been optimized out",
    optimizedOutTooltip: "The benchmark was likely optimized out by the JavaScript engine (dead code elimination). Consider using do_not_optimize() to prevent this.",

    // Units
    ms: "ms",
    μs: "μs",
    ns: "ns",
    opsUnit: "ops/s",

    // Dependencies Editor
    expand: "Expand",
    collapse: "Collapse",

    // Accessibility and SEO
    openMenu: "Open Menu",
    closeMenu: "Close Menu",
    switchToDarkMode: "Switch to Dark Mode",
    switchToLightMode: "Switch to Light Mode",
    selectLanguage: "Select Language",
    codeEditor: "Code Editor",
    resizePanels: "Resize Panels",
    benchmarkResults: "Benchmark Results",
    resultsTable: "Results Table",
    resultsChart: "Results Chart",
  },

  zh: {
    // Header
    title: "JS Mitata 性能测试",
    subtitle: "专业的 JavaScript 性能基准测试平台",

    // Navigation
    code: "代码编辑器",
    results: "测试结果",
    chart: "图表视图",

    // Code Editor
    testCases: "测试用例",
    testCaseDescription: "在此编写测试用例",
    addTestCase: "添加测试用例",
    removeTestCase: "删除测试用例",
    renameTestCase: "重命名测试用例",
    formatCode: "格式化代码",
    validateCode: "验证代码",
    noTestCase: "未选择测试用例",
    asyncMode: "异步模式",
    doNotOptimizeHint: "使用 do_not_optimize()",
    doNotOptimizeDescription: "调用 do_not_optimize(value) 来防止JavaScript引擎优化掉您的代码。对于防止基准测试中的死代码消除很有用。",

    // Setup Code
    setupCode: "Setup代码",
    setupCodeValid: "Setup代码有效",
    setupCodeInvalid: "Setup代码无效",
    setupCodeError: "Setup代码错误",
    setupCodeDescription: "在此定义全局变量和辅助函数",

    // Dependencies
    dependencies: "第三方依赖",
    addDependency: "添加依赖",
    removeDependency: "删除依赖",
    dependencyName: "包名",
    dependencyUrl: "CDN 地址",
    dependencyMode: "模式",
    globalVariableName: "全局变量名",
    enableDependency: "启用依赖",
    dependencyDescription: "通过 CDN 引入第三方包，仅支持 ESM 模式",
    noDependency: "暂无依赖项，点击上方按钮添加第三方包",
    source: "源",

    // Test Case Management
    testCaseName: "测试用例名称",
    newTestCase: "新建测试用例",
    enterTestCaseName: "输入测试用例名称",
    testCaseExists: "测试用例名称已存在",

    // Benchmark Runner
    benchmarkConsole: "基准测试控制台",
    testCasesCount: "个测试用例",
    workerUnavailable: "Worker 不可用",
    testCompletedStatus: "测试已完成",
    runBenchmark: "运行基准测试",
    stopTest: "停止测试",
    clearResults: "清除结果",
    resetAll: "重置全部",
    runningBenchmark: "正在运行基准测试...",
    pleaseWait: "请耐心等待，正在测试 {count} 个用例",
    error: "错误",
    workerUnavailableDesc:
      "您的浏览器可能不支持 Web Workers，或 Worker 初始化失败。基准测试功能将不可用。",
    waitingTest: "等待测试",
    syntaxError: "语法错误",
    syntaxValid: "语法正确",
    executionFailed: "执行失败",

    // Progress Messages
    validatingTestCases: "验证测试用例...",
    preparingBenchmark: "准备基准测试...",
    runningBenchmarkEllipsis: "正在运行基准测试，请耐心等待...",
    runningBenchmarkProgress: "运行基准测试中",
    benchmarkCompleted: "基准测试完成",
    processingResults: "处理测试结果...",
    testing: "测试",
    testCompleted: "测试完成",

    // Results Table
    performanceResults: "性能测试结果",
    testCase: "测试用例",
    operations: "每秒操作数",
    averageTime: "平均时间",
    relativePerformance: "相对性能",
    ranking: "排名",
    fastest: "最快",
    slowest: "最慢",
    baseline: "基准",
    slower: "慢",
    faster: "快",
    noResultsTitle: "暂无测试结果",
    noResultsDesc: "请运行基准测试以查看性能结果",
    performanceRatio: "性能差异",

    // Chart Visualizer
    performanceVisualization: "性能可视化",
    noChartDataTitle: "暂无图表数据",
    noChartDataDesc: "请运行基准测试以查看性能可视化图表",
    barChart: "柱状图",
    opsPerSec: "ops/sec",
    avgTime: "平均时间",
    opsPerSecK: "每秒操作数 (千次)",
    performance: "性能",

    // Share
    share: "分享",
    shareTitle: "分享标题",
    shareDescription: "与他人分享您的基准测试",
    shareSuccess: "短链生成成功",
    shareFailed: "生成短链失败，请重试",
    shareGenerating: "生成中...",
    shareUrl: "分享链接",
    copyLink: "复制",
    copied: "已复制",
    close: "关闭",
    shareContent: "分享内容",
    enterShareTitle: "请输入分享标题",
    shareTitlePlaceholder: "我的性能测试",
    shareExpiry: "过期时间",
    shareExpiry7d: "7天",
    shareExpiry30d: "30天",
    shareExpiryDescription: "分享链接过期时间",
    shareExpiry7dDesc: "7天后过期",
    shareExpiry30dDesc: "30天后过期",
    shareValidationTitle: "分享验证",
    shareValidationMessage: "输入验证码",

    // Common
    name: "名称",
    value: "值",
    actions: "操作",
    confirm: "确认",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    remove: "移除",

    // Validation Messages
    pleaseAddTestCase: "请至少添加一个测试用例",
    codeCompileError: "代码编译错误",
    codeExecutionError: "代码执行错误",
    testCaseNotExecuted: "测试用例未执行",
    optimizedOut: "被优化",
    optimizedOutWarning: "代码可能被优化掉了",
    optimizedOutTooltip: "基准测试可能被JavaScript引擎优化掉了（死代码消除）。建议使用 do_not_optimize() 来防止优化。",

    // Units
    ms: "毫秒",
    μs: "微秒",
    ns: "纳秒",
    opsUnit: "次/秒",

    // Dependencies Editor
    expand: "展开",
    collapse: "收起",

    // Accessibility and SEO
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    switchToDarkMode: "切换到暗模式",
    switchToLightMode: "切换到亮模式",
    selectLanguage: "选择语言",
    codeEditor: "代码编辑器",
    resizePanels: "调整面板大小",
    benchmarkResults: "基准测试结果",
    resultsTable: "结果表格",
    resultsChart: "结果图表",
  },
};

let currentLanguage: Language = "en";


const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem("mitata-language", lang);
      window.dispatchEvent(new Event("language-change"));
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }
};

const t = (
  key: keyof Translations,
  params?: Record<string, string | number>
): string => {
  let text =
    translations[currentLanguage][key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
  }

  return text;
};

export const useTranslation = () => {
  return {
    t,
    setLanguage,
    currentLanguage,
    availableLanguages: Object.keys(translations) as Language[],
  };
};

export const initializeLanguage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const savedLanguage = localStorage.getItem("mitata-language") as Language;
    if (savedLanguage && translations[savedLanguage]) {
      currentLanguage = savedLanguage;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
};

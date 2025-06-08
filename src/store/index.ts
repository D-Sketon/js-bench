import { create } from "zustand";

export interface TestCase {
  id: string;
  name: string;
  code: string;
}

export interface BenchmarkResult {
  name: string;
  avg: number;
  p99: number;
  p75: number;
  ops: number;
  error?: string;
  optimizedOut?: boolean;
}

export interface Dependency {
  id: string;
  name: string;
  url: string;
  mode: "esm" | "umd";
  globalName?: string; // For UMD mode
  enabled: boolean;
}

interface BenchmarkStore {
  testCases: TestCase[];
  results: BenchmarkResult[];
  isRunning: boolean;
  selectedTabId: string | null;
  setupCode: string;
  asyncMode: boolean;
  dependencies: Dependency[];

  addTestCase: () => void;
  removeTestCase: (id: string) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  setSelectedTab: (id: string) => void;
  setTestCases: (testCases: TestCase[]) => void;

  updateSetupCode: (code: string) => void;
  setSetupCode: (code: string) => void;

  setAsyncMode: (enabled: boolean) => void;

  addDependency: () => void;
  removeDependency: (id: string) => void;
  updateDependency: (id: string, updates: Partial<Dependency>) => void;
  toggleDependency: (id: string) => void;
  setDependencies: (dependencies: Dependency[]) => void;

  setRunning: (running: boolean) => void;
  setResults: (results: BenchmarkResult[]) => void;
  clearResults: () => void;

  reset: () => void;
}

const defaultTestCases: TestCase[] = [
  {
    id: "1",
    name: "For Loop",
    code: `// For Loop
let sum = 0;
for (let i = 0; i < GLOBAL.length; i++) {
  sum += GLOBAL[i];
}`,
  },
  {
    id: "2",
    name: "Array.reduce",
    code: `// Array.reduce 
const sum = GLOBAL.reduce((acc, val) => acc + val, 0);`,
  },
];

const defaultSetupCode = `// Setup Code - Run before each test case
// You can define global variables, functions, or initialize data here
// The return value will be stored into \`GLOBAL\` variable
return Array.from({ length: 1000 }, (_, i) => i);`;

const defaultDependencies: Dependency[] = [
  {
    id: "1",
    name: "lodash",
    url: "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm",
    mode: "esm",
    globalName: "",
    enabled: false,
  },
];

export const useBenchmarkStore = create<BenchmarkStore>((set, get) => ({
  testCases: defaultTestCases,
  results: [],
  isRunning: false,
  selectedTabId: defaultTestCases[0].id,
  setupCode: defaultSetupCode,
  asyncMode: false,
  dependencies: defaultDependencies,

  addTestCase: () => {
    const newId = Date.now().toString();
    const newTestCase: TestCase = {
      id: newId,
      name: `Test Case ${get().testCases.length + 1}`,
      code: `// Add your test code here
const result = 'Hello World';
return result;`,
    };
    set((state) => ({
      testCases: [...state.testCases, newTestCase],
      selectedTabId: newId,
    }));
  },

  removeTestCase: (id: string) => {
    const { testCases, selectedTabId } = get();
    if (testCases.length <= 1) return;

    const newTestCases = testCases.filter((tc) => tc.id !== id);
    const newSelectedTabId =
      selectedTabId === id ? newTestCases[0]?.id || null : selectedTabId;

    set({
      testCases: newTestCases,
      selectedTabId: newSelectedTabId,
      results: [],
    });
  },

  updateTestCase: (id: string, updates: Partial<TestCase>) => {
    set((state) => ({
      testCases: state.testCases.map((tc) =>
        tc.id === id ? { ...tc, ...updates } : tc
      ),
    }));
  },

  setSelectedTab: (id: string) => {
    set({ selectedTabId: id });
  },

  setTestCases: (testCases: TestCase[]) => {
    set({ testCases });
  },

  updateSetupCode: (code: string) => {
    set({ setupCode: code });
    set({ results: [] });
  },

  setSetupCode: (code: string) => {
    set({ setupCode: code });
  },

  setAsyncMode: (enabled: boolean) => {
    set({ asyncMode: enabled });
    set({ results: [] });
  },

  addDependency: () => {
    const newId = Date.now().toString();
    const newDependency: Dependency = {
      id: newId,
      name: "new-package",
      url: "",
      mode: "esm",
      enabled: false,
    };
    set((state) => ({
      dependencies: [...state.dependencies, newDependency],
      results: [],
    }));
  },

  removeDependency: (id: string) => {
    set((state) => ({
      dependencies: state.dependencies.filter((dep) => dep.id !== id),
      results: [],
    }));
  },

  updateDependency: (id: string, updates: Partial<Dependency>) => {
    set((state) => ({
      dependencies: state.dependencies.map((dep) =>
        dep.id === id ? { ...dep, ...updates } : dep
      ),
      results: [],
    }));
  },

  toggleDependency: (id: string) => {
    set((state) => ({
      dependencies: state.dependencies.map((dep) =>
        dep.id === id ? { ...dep, enabled: !dep.enabled } : dep
      ),
      results: [],
    }));
  },

  setDependencies: (dependencies: Dependency[]) => {
    set({ dependencies });
  },

  setRunning: (running: boolean) => {
    set({ isRunning: running });
  },

  setResults: (results: BenchmarkResult[]) => {
    set({ results });
  },

  clearResults: () => {
    set({ results: [] });
  },

  reset: () => {
    set({
      testCases: defaultTestCases,
      results: [],
      isRunning: false,
      selectedTabId: defaultTestCases[0].id,
      setupCode: defaultSetupCode,
      asyncMode: false,
      dependencies: defaultDependencies,
    });
  },
}));

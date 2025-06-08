// Polyfill for bun:jsc module in browser environment
// This module provides memory usage information in Bun, but we'll provide browser alternatives

export function memoryUsage() {
  if (typeof performance !== "undefined" && performance.memory) {
    return {
      rss: performance.memory.usedJSHeapSize,
      heapTotal: performance.memory.totalJSHeapSize,
      heapUsed: performance.memory.usedJSHeapSize,
      external: 0,
      arrayBuffers: 0,
    };
  }

  return {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0,
  };
}

const jsc = {
  memoryUsage,
};

export default jsc;
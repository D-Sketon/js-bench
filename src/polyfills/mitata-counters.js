// Polyfill for @mitata/counters module in browser environment
// This module provides hardware performance counters, but we'll provide browser alternatives

export class HardwareCounters {
  constructor() {
    this.enabled = false;
  }

  start() {
    return this;
  }

  stop() {
    return {
      cycles: 0,
      instructions: 0,
      cache_references: 0,
      cache_misses: 0,
      branch_instructions: 0,
      branch_misses: 0,
    };
  }

  read() {
    return {
      cycles: 0,
      instructions: 0,
      cache_references: 0,
      cache_misses: 0,
      branch_instructions: 0,
      branch_misses: 0,
    };
  }
}

export function createCounters() {
  return new HardwareCounters();
}

export function isSupported() {
  return false;
}

const counters = {
  HardwareCounters,
  createCounters,
  isSupported,
};

export default counters;

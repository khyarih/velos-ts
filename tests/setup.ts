/**
 * Vitest Setup
 * Global setup that runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { rmSync, existsSync } from 'fs';

// Clean up temp directories before and after all tests
const tempDir = resolve(__dirname, 'temp');

beforeAll(() => {
  // Clean temp directory before tests start
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

afterAll(() => {
  // Clean temp directory after all tests complete
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

// Mock console methods to reduce noise in test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  // Suppress console output during tests unless DEBUG is set
  if (!process.env.DEBUG) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Test setup file for Vitest
import { beforeEach, afterEach, vi } from 'vitest';

// Mock file system
global.fs = await import('fs/promises');

// Setup before each test
beforeEach(async () => {
  // Clean up any test data
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(async () => {
  // Reset all mocks
  vi.restoreAllMocks();
});

/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/backend/**/__tests__/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'frontend/',
    ],
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json'],
    exclude: [
      'node_modules/',
      'dist/',
      'frontend/',
    ],
  },
});

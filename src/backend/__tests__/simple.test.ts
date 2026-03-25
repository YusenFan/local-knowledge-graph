/// <reference types="vitest" />

import { describe, it, expect, vi } from 'vitest';

// Simple tests without external dependencies
describe('Simple Tests', () => {
  describe('Basic Types', () => {
    it('should have test environment', () => {
      expect(true).toBe(true);
    });

    it('should handle basic arithmetic', () => {
      expect(1 + 1).toBe(2);
    });

    it('should handle string operations', () => {
      const text = 'Hello World';
      expect(text.toLowerCase()).toBe('hello world');
      expect(text.split(' ')).toHaveLength(2);
    });

    it('should handle array operations', () => {
      const arr = [1, 2, 3];
      expect(arr).toHaveLength(3);
      expect(arr.includes(2)).toBe(true);
    });
  });

  describe('Async Operations', () => {
    it('should handle async/await', async () => {
      const promise = Promise.resolve(42);
      const result = await promise;
      expect(result).toBe(42);
    });

    it('should handle async operations', async () => {
      const result = await Promise.all([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ]);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('Mock Functions', () => {
    it('should create and use a mock', () => {
      const mockFn = vi.fn(() => 42);
      mockFn();
      expect(mockFn).toHaveBeenCalled();
    });

    it('should return mocked value', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      expect(mockFn(5)).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
    });
  });
});

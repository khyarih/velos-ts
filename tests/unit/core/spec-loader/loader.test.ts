/**
 * Tests for Spec Loader
 */

import { describe, it, expect } from 'vitest';
import { SpecLoaderError } from '@/core/spec-loader/loader';

describe('Spec Loader', () => {
  describe('SpecLoaderError', () => {
    it('should create error with message and code', () => {
      const error = new SpecLoaderError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('SpecLoaderError');
    });

    it('should create error with details', () => {
      const details = { file: 'test.yaml', line: 10 };
      const error = new SpecLoaderError('Test error', 'TEST_CODE', details);

      expect(error.details).toEqual(details);
    });

    it('should be instance of Error', () => {
      const error = new SpecLoaderError('Test error', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
    });
  });
});

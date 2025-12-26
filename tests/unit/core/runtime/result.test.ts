/**
 * Tests for Result Pattern
 */

import { describe, it, expect } from 'vitest';
import { success, failure, errorToDetails } from '@/core/runtime/result';
import type { Result, Success, Failure, ErrorDetails } from '@/core/runtime/result';

describe('Result Pattern', () => {
  describe('success()', () => {
    it('should create a successful result with data', () => {
      const result = success({ id: 1, name: 'Test' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Test' });
    });

    it('should create a successful result with optional message', () => {
      const result = success('test-data', 'Operation completed');

      expect(result.success).toBe(true);
      expect(result.data).toBe('test-data');
      expect(result.message).toBe('Operation completed');
    });

    it('should handle null data', () => {
      const result = success(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle undefined data', () => {
      const result = success(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe('failure()', () => {
    it('should create a failure result with error details', () => {
      const error: ErrorDetails = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      const result = failure(error);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(error);
    });

    it('should preserve all error details fields', () => {
      const error: ErrorDetails = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { field: 'email', reason: 'invalid format' },
        statusCode: 400,
      };

      const result = failure(error);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Validation failed');
      expect(result.error.details).toEqual({ field: 'email', reason: 'invalid format' });
      expect(result.error.statusCode).toBe(400);
    });
  });

  describe('errorToDetails()', () => {
    it('should convert Error to ErrorDetails', () => {
      const error = new Error('Something went wrong');
      const details = errorToDetails(error, 'CUSTOM_ERROR');

      expect(details.code).toBe('CUSTOM_ERROR');
      expect(details.message).toBe('Something went wrong');
    });

    it('should handle Error with default code', () => {
      const error = new Error('Error message');
      const details = errorToDetails(error);

      expect(details.code).toBe('UNKNOWN_ERROR');
      expect(details.message).toBe('Error message');
    });

    it('should handle string errors', () => {
      const details = errorToDetails('Simple error message', 'STRING_ERROR');

      expect(details.code).toBe('STRING_ERROR');
      expect(details.message).toBe('Simple error message');
    });

    it('should handle object errors with message property', () => {
      const error = { message: 'Custom error object' };
      const details = errorToDetails(error, 'OBJECT_ERROR');

      expect(details.code).toBe('OBJECT_ERROR');
      expect(details.message).toBe('Custom error object');
    });

    it('should handle unknown error types', () => {
      const error = { someProperty: 'value' };
      const details = errorToDetails(error, 'UNKNOWN_TYPE');

      expect(details.code).toBe('UNKNOWN_TYPE');
      expect(details.message).toContain('Unknown error');
    });

    it('should preserve error details from HTTP responses', () => {
      const httpError = {
        message: 'Not Found',
        statusCode: 404,
        details: { resource: 'user', id: 123 },
      };

      const details = errorToDetails(httpError, 'HTTP_ERROR');

      expect(details.code).toBe('HTTP_ERROR');
      expect(details.message).toBe('Not Found');
      expect(details.statusCode).toBe(404);
      expect(details.details).toEqual({ resource: 'user', id: 123 });
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify success results', () => {
      const result: Result<string> = success('data');

      if (result.success) {
        // TypeScript should narrow the type here
        expect(result.data).toBe('data');
      } else {
        throw new Error('Should not reach here');
      }
    });

    it('should correctly identify failure results', () => {
      const result: Result<string> = failure({
        code: 'ERROR',
        message: 'Failed',
      });

      if (!result.success) {
        // TypeScript should narrow the type here
        expect(result.error.code).toBe('ERROR');
      } else {
        throw new Error('Should not reach here');
      }
    });
  });

  describe('Practical Usage', () => {
    async function fetchUser(id: number): Promise<Result<{ id: number; name: string }>> {
      try {
        if (id < 0) {
          throw new Error('Invalid user ID');
        }

        return success({ id, name: `User ${id}` });
      } catch (error) {
        return failure(errorToDetails(error, 'FETCH_USER_ERROR'));
      }
    }

    it('should handle successful operations', async () => {
      const result = await fetchUser(1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(1);
        expect(result.data.name).toBe('User 1');
      }
    });

    it('should handle failed operations', async () => {
      const result = await fetchUser(-1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FETCH_USER_ERROR');
        expect(result.error.message).toBe('Invalid user ID');
      }
    });
  });
});

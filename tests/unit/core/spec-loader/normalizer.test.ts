/**
 * Tests for Normalizer
 */

import { describe, it, expect } from 'vitest';
import { normalizeSpec, extractOperations } from '@/core/spec-loader/normalizer';
import type { OpenAPISpec } from '@/types/openapi.types';

describe('Normalizer', () => {
  describe('normalizeSpec()', () => {
    it('should normalize a basic spec', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {},
            },
          },
        },
      };

      const result = normalizeSpec(spec);

      expect(result.spec).toBeDefined();
      expect(result.operations).toBeDefined();
      expect(result.operations.length).toBeGreaterThan(0);
    });

    it('should generate operation IDs for operations without them', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              responses: {},
            },
          },
        },
      };

      const result = normalizeSpec(spec);

      expect(result.operations[0].operationId).toBeDefined();
      expect(result.operations[0].operationId).toBeTruthy();
    });

    it('should ensure tags array exists', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {},
            },
          },
        },
      };

      const result = normalizeSpec(spec);

      expect(result.operations[0].tags).toBeDefined();
    });

    it('should mark path parameters as required', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  schema: { type: 'string' },
                },
              ],
              responses: {},
            },
          },
        },
      };

      const result = normalizeSpec(spec);

      const operation = result.operations[0];
      const pathParam = operation.parameters?.find((p) => p.in === 'path');
      expect(pathParam?.required).toBe(true);
    });

    it('should handle spec without paths', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
      };

      const result = normalizeSpec(spec);

      expect(result.operations).toEqual([]);
    });

    it('should normalize all HTTP methods', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {},
            },
            post: {
              operationId: 'createUser',
              responses: {},
            },
            put: {
              operationId: 'updateUser',
              responses: {},
            },
            delete: {
              operationId: 'deleteUser',
              responses: {},
            },
          },
        },
      };

      const result = normalizeSpec(spec);

      expect(result.operations).toHaveLength(4);
      expect(result.operations.map((op) => op.method).sort()).toEqual([
        'delete',
        'get',
        'post',
        'put',
      ]);
    });
  });

  describe('extractOperations()', () => {
    it('should extract operations from spec', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {},
            },
          },
          '/products': {
            get: {
              operationId: 'getProducts',
              responses: {},
            },
          },
        },
      };

      const operations = extractOperations(spec);

      expect(operations).toHaveLength(2);
    });

    it('should include path and method in extracted operations', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {},
            },
          },
        },
      };

      const operations = extractOperations(spec);

      expect(operations[0].path).toBe('/users');
      expect(operations[0].method).toBe('get');
    });

    it('should handle empty paths', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {},
      };

      const operations = extractOperations(spec);

      expect(operations).toEqual([]);
    });

    it('should handle spec without paths property', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
      };

      const operations = extractOperations(spec);

      expect(operations).toEqual([]);
    });
  });
});

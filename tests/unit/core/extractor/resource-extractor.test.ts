/**
 * Tests for Resource Extractor
 */

import { describe, it, expect } from 'vitest';
import {
  extractResources,
  extractResourceGroups,
  type ResourceExtractionOptions,
} from '@/core/extractor/resource-extractor';
import type { NormalizedOperation } from '@/core/spec-loader/normalizer';
import type { OpenAPISpec } from '@/types/openapi.types';

describe('Resource Extractor', () => {
  describe('extractResources()', () => {
    it('should extract resources from operations', () => {
      const operations: NormalizedOperation[] = [
        {
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
          tags: ['User'],
        },
        {
          operationId: 'createUser',
          method: 'post',
          path: '/users',
          tags: ['User'],
        },
        {
          operationId: 'getUser',
          method: 'get',
          path: '/users/{id}',
          tags: ['User'],
        },
      ];

      const resources = extractResources(operations);

      expect(resources).toHaveLength(1);
      expect(resources[0].name).toBe('User');
      expect(resources[0].operations).toHaveLength(3);
      expect(resources[0].tag).toBe('User');
    });

    it('should handle operations without tags', () => {
      const operations: NormalizedOperation[] = [
        {
          operationId: 'getItems',
          method: 'get',
          path: '/items',
        },
      ];

      const resources = extractResources(operations);

      expect(resources).toHaveLength(1);
      expect(resources[0].tag).toBe('Uncategorized');
    });

    it('should group operations by resource', () => {
      const operations: NormalizedOperation[] = [
        {
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
          tags: ['User'],
        },
        {
          operationId: 'getProducts',
          method: 'get',
          path: '/products',
          tags: ['Product'],
        },
      ];

      const resources = extractResources(operations);

      expect(resources).toHaveLength(2);
      expect(resources.map((r) => r.name).sort()).toEqual(['Product', 'User']);
    });
  });

  describe('extractResourceGroups()', () => {
    it('should extract resources from OpenAPI spec', () => {
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
              tags: ['User'],
              responses: {},
            },
          },
          '/products': {
            get: {
              operationId: 'getProducts',
              tags: ['Product'],
              responses: {},
            },
          },
        },
      };

      const resources = extractResourceGroups(spec);

      expect(resources.length).toBeGreaterThan(0);
    });

    it('should filter operations by include patterns', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/api/users': {
            get: {
              operationId: 'getUsers',
              tags: ['User'],
              responses: {},
            },
          },
          '/admin/settings': {
            get: {
              operationId: 'getSettings',
              tags: ['Admin'],
              responses: {},
            },
          },
        },
      };

      const options: ResourceExtractionOptions = {
        includePatterns: ['/api/**'],
      };

      const resources = extractResourceGroups(spec, options);

      // Should only include operations matching the pattern
      const allOps = resources.flatMap((r) => r.operations);
      expect(allOps.every((op) => op.path.startsWith('/api'))).toBe(true);
    });

    it('should filter operations by exclude patterns', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/api/users': {
            get: {
              operationId: 'getUsers',
              tags: ['User'],
              responses: {},
            },
          },
          '/api/admin/settings': {
            get: {
              operationId: 'getSettings',
              tags: ['Admin'],
              responses: {},
            },
          },
        },
      };

      const options: ResourceExtractionOptions = {
        excludePatterns: ['/api/admin/**'],
      };

      const resources = extractResourceGroups(spec, options);

      // Should exclude admin operations
      const allOps = resources.flatMap((r) => r.operations);
      expect(allOps.every((op) => !op.path.includes('/admin'))).toBe(true);
    });

    it('should handle empty spec', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {},
      };

      const resources = extractResourceGroups(spec);

      expect(resources).toEqual([]);
    });

    it('should handle spec with no paths', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
      };

      const resources = extractResourceGroups(spec);

      expect(resources).toEqual([]);
    });

    it('should handle both include and exclude patterns', () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/api/users': {
            get: {
              operationId: 'getUsers',
              tags: ['User'],
              responses: {},
            },
          },
          '/api/admin/users': {
            get: {
              operationId: 'getAdminUsers',
              tags: ['Admin'],
              responses: {},
            },
          },
          '/public/info': {
            get: {
              operationId: 'getInfo',
              tags: ['Public'],
              responses: {},
            },
          },
        },
      };

      const options: ResourceExtractionOptions = {
        includePatterns: ['/api/**'],
        excludePatterns: ['/api/admin/**'],
      };

      const resources = extractResourceGroups(spec, options);

      // Should include /api/users but exclude /api/admin/users and /public/info
      const allOps = resources.flatMap((r) => r.operations);
      expect(allOps.length).toBe(1);
      expect(allOps[0].path).toBe('/api/users');
    });

    it('should handle operations with multiple tags', () => {
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
              tags: ['User', 'Admin'],
              responses: {},
            },
          },
        },
      };

      const resources = extractResourceGroups(spec);

      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].tag).toBe('User'); // Should use first tag
    });
  });
});

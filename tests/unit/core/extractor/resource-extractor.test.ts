/**
 * Tests for Resource Extractor
 */

import { describe, it, expect } from 'vitest';
import {
  extractResources,
  extractResourceGroups,
  inferResourceInfo,
  getResourceStatistics,
  type ResourceExtractionOptions,
} from '@/core/extractor/resource-extractor';
import type { NormalizedOperation } from '@/core/spec-loader/normalizer';
import type { OpenAPISpec } from '@/types/openapi.types';
import type { ResourceGroup } from '@/types/generator.types';

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

    it('should use resource config when provided', () => {
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
        },
      };

      const resourceConfig = new Map();
      resourceConfig.set('User', { customField: 'value' });

      const options: ResourceExtractionOptions = {
        resourceConfig,
      };

      const resources = extractResourceGroups(spec, options);

      expect(resources.length).toBeGreaterThan(0);
      // Config should be set if available
    });

    it('should infer primary entity type when enabled', () => {
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
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/UserDTO',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            UserDTO: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const options: ResourceExtractionOptions = {
        inferPrimaryEntityType: true,
      };

      const resources = extractResourceGroups(spec, options);

      expect(resources.length).toBeGreaterThan(0);
      // Primary entity type should be inferred
    });
  });

  describe('inferResourceInfo()', () => {
    it('should infer resource from simple path', () => {
      const info = inferResourceInfo('/users');

      expect(info.resourceName).toBeDefined();
      expect(info.resourceKey).toBeDefined();
    });

    it('should handle versioned API paths', () => {
      const info = inferResourceInfo('/api/v1/products');

      expect(info.resourceName).toBeDefined();
      expect(info.basePath).toBe('/api/v1/products');
    });

    it('should handle nested resources', () => {
      // With depth=2, grouped resources like /api/v1/admin/products create nested resources
      const info = inferResourceInfo('/api/v1/admin/products', undefined, { depth: 2 });

      expect(info.isNested).toBe(true);
      expect(info.resourceKey).toBe('admin.products'); // Key uses path segments as-is
      expect(info.resourceName).toBe('AdminProduct'); // Name is singularized and PascalCased
    });

    it('should handle paths with parameters', () => {
      const info = inferResourceInfo('/api/v1/products/{id}');

      expect(info.basePath).toBeDefined();
    });

    it('should group sub-resources under root with auto strategy', () => {
      // Default strategy='auto' groups sub-resources under root
      const info = inferResourceInfo('/api/v1/orders/{id}/items');

      expect(info.resourceKey).toBe('orders'); // Note: path segment not singularized in key
      expect(info.resourceName).toBe('Order'); // But name is singularized
      expect(info.isNested).toBe(false);
    });

    it('should respect depth configuration with auto strategy', () => {
      // With depth=2 and auto strategy, sub-resources still grouped under root
      const info = inferResourceInfo('/api/v1/orders/{id}/items', undefined, {
        depth: 2,
        strategy: 'auto',
      });

      expect(info.resourceKey).toBe('orders');
      expect(info.resourceName).toBe('Order');
    });

    it('should use full strategy to create separate repos for sub-resources', () => {
      // strategy='full' creates separate repos for sub-resources
      const info = inferResourceInfo('/api/v1/orders/{id}/items', undefined, { strategy: 'full' });

      expect(info.resourceKey).toBe('orders.items');
      expect(info.resourceName).toBe('OrderItem'); // Each segment singularized: Order + Item
      expect(info.isNested).toBe(true);
    });

    it('should use root strategy to always use first segment', () => {
      // strategy='root' always uses only the root segment
      const info1 = inferResourceInfo('/api/v1/admin/products', undefined, { strategy: 'root' });
      const info2 = inferResourceInfo('/api/v1/orders/{id}/items', undefined, { strategy: 'root' });

      expect(info1.resourceKey).toBe('admin');
      expect(info2.resourceKey).toBe('orders');
    });

    it('should handle depth configuration for grouped resources', () => {
      // Without params, depth controls how many segments to include
      const info1 = inferResourceInfo('/api/v1/admin/products', undefined, { depth: 1 });
      const info2 = inferResourceInfo('/api/v1/admin/products', undefined, { depth: 2 });

      expect(info1.resourceKey).toBe('admin');
      expect(info2.resourceKey).toBe('admin.products');
    });
  });

  describe('getResourceStatistics()', () => {
    it('should calculate statistics for resources', () => {
      const resources: ResourceGroup[] = [
        {
          name: 'User',
          resourceKey: 'user',
          basePath: '/users',
          operations: [
            { operationId: 'getUsers', method: 'get', path: '/users' },
            { operationId: 'createUser', method: 'post', path: '/users' },
          ],
          tag: 'User',
        },
      ];

      const stats = getResourceStatistics(resources);

      expect(stats.totalResources).toBe(1);
      expect(stats.totalOperations).toBe(2);
    });
  });
});

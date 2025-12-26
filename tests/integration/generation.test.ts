/**
 * Integration Tests for Repository Generation
 * Tests the complete end-to-end generation flow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { loadOpenAPISpec } from '@/core/spec-loader/loader';
import { normalizeSpec } from '@/core/spec-loader/normalizer';
import { extractResources } from '@/core/extractor/resource-extractor';
import { createTempDir, cleanupTempDir, getFixturePath } from '@tests/helpers/test-utils';

describe('Repository Generation - Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir('integration-test');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Simple API Generation', () => {
    it('should load and normalize simple API spec', () => {
      const specPath = getFixturePath('openapi-specs/simple-api.json');
      const spec = loadOpenAPISpec(specPath);

      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Simple API');
      expect(spec.paths).toBeDefined();
    });

    it('should extract operations from simple API', () => {
      const specPath = getFixturePath('openapi-specs/simple-api.json');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      expect(normalized.operations.length).toBeGreaterThan(0);

      // Check that operations have required fields
      normalized.operations.forEach((op) => {
        expect(op.operationId).toBeDefined();
        expect(op.method).toBeDefined();
        expect(op.path).toBeDefined();
        expect(op.tags).toBeDefined();
      });
    });

    it('should group operations by resource', () => {
      const specPath = getFixturePath('openapi-specs/simple-api.json');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);
      const resources = extractResources(normalized.operations);

      expect(resources.length).toBeGreaterThan(0);

      // Should have Product and Category resources
      const resourceNames = resources.map((r) => r.name);
      expect(resourceNames).toContain('Product');
      expect(resourceNames).toContain('Category');
    });

    it('should identify correct base paths for resources', () => {
      const specPath = getFixturePath('openapi-specs/simple-api.json');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);
      const resources = extractResources(normalized.operations);

      const productResource = resources.find((r) => r.name === 'Product');
      expect(productResource).toBeDefined();
      expect(productResource?.basePath).toBe('/products');
    });

    it('should map HTTP methods correctly', () => {
      const specPath = getFixturePath('openapi-specs/simple-api.json');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);
      const resources = extractResources(normalized.operations);

      const productResource = resources.find((r) => r.name === 'Product');
      const methods = productResource?.operations.map((op) => op.method) || [];

      expect(methods).toContain('get');
      expect(methods).toContain('post');
      expect(methods).toContain('put');
      expect(methods).toContain('delete');
    });
  });

  describe('Complex API Generation', () => {
    it('should load and process YAML spec', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);

      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Complex API');
    });

    it('should handle nested resource paths', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);
      const resources = extractResources(normalized.operations);

      // Should have User, Post, Comment resources
      const resourceNames = resources.map((r) => r.name);
      expect(resourceNames.length).toBeGreaterThan(0);
    });

    it('should extract path parameters', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      // Find operation with path parameters
      const getUserOp = normalized.operations.find((op) => op.operationId === 'getUserById');
      expect(getUserOp).toBeDefined();
      expect(getUserOp?.parameters).toBeDefined();
      expect(getUserOp?.parameters?.some((p) => p.in === 'path')).toBe(true);
    });

    it('should extract query parameters', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      // Find operation with query parameters
      const getUserPostsOp = normalized.operations.find((op) => op.operationId === 'getUserPosts');
      expect(getUserPostsOp).toBeDefined();
      expect(getUserPostsOp?.parameters?.some((p) => p.in === 'query')).toBe(true);
    });

    it('should identify request body schemas', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      // Find operation with request body
      const updateUserOp = normalized.operations.find((op) => op.operationId === 'updateUser');
      expect(updateUserOp).toBeDefined();
      expect(updateUserOp?.requestBody).toBeDefined();
    });

    it('should identify response schemas', () => {
      const specPath = getFixturePath('openapi-specs/simple-api.json');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      normalized.operations.forEach((op) => {
        expect(op.responses).toBeDefined();
        expect(Object.keys(op.responses).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Pattern Filtering', () => {
    it('should filter operations by include patterns', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      const includePatterns = ['/users/**'];
      const filtered = normalized.operations.filter((op) => {
        return includePatterns.some((pattern) => {
          // Simple pattern matching for test
          if (pattern.includes('**')) {
            const prefix = pattern.replace('/**', '');
            return op.path.startsWith(prefix);
          }
          return op.path === pattern;
        });
      });

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((op) => {
        expect(op.path).toMatch(/^\/users/);
      });
    });

    it('should filter operations by exclude patterns', () => {
      const specPath = getFixturePath('openapi-specs/complex-api.yaml');
      const spec = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(spec);

      const excludePatterns = ['/admin/**'];
      const filtered = normalized.operations.filter((op) => {
        return !excludePatterns.some((pattern) => {
          if (pattern.includes('**')) {
            const prefix = pattern.replace('/**', '');
            return op.path.startsWith(prefix);
          }
          return op.path === pattern;
        });
      });

      filtered.forEach((op) => {
        expect(op.path).not.toMatch(/^\/admin/);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent spec file', () => {
      const specPath = resolve(tempDir, 'non-existent.json');

      expect(() => loadOpenAPISpec(specPath)).toThrow();
    });

    it('should throw error for invalid JSON spec', () => {
      const specPath = resolve(tempDir, 'invalid.json');
      writeFileSync(specPath, '{ invalid json');

      expect(() => loadOpenAPISpec(specPath)).toThrow();
    });

    it('should throw error for invalid YAML spec', () => {
      const specPath = resolve(tempDir, 'invalid.yaml');
      writeFileSync(specPath, 'invalid: yaml: [[[');

      expect(() => loadOpenAPISpec(specPath)).toThrow();
    });

    it('should handle spec without paths', () => {
      const specPath = resolve(tempDir, 'no-paths.json');
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };
      writeFileSync(specPath, JSON.stringify(spec));

      const loaded = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(loaded);

      expect(normalized.operations).toEqual([]);
    });
  });

  describe('Resource Grouping Edge Cases', () => {
    it('should handle operations without tags', () => {
      const specPath = resolve(tempDir, 'no-tags.json');
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      writeFileSync(specPath, JSON.stringify(spec));

      const loaded = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(loaded);
      const resources = extractResources(normalized.operations);

      expect(resources.length).toBeGreaterThan(0);
    });

    it('should handle operations without operationId', () => {
      const specPath = resolve(tempDir, 'no-operation-id.json');
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items': {
            get: {
              tags: ['Item'],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };
      writeFileSync(specPath, JSON.stringify(spec));

      const loaded = loadOpenAPISpec(specPath);
      const normalized = normalizeSpec(loaded);

      // Should generate operationId
      expect(normalized.operations[0].operationId).toBeDefined();
    });
  });
});

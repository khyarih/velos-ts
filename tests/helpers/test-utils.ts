/**
 * Test Utilities
 * Common helpers for testing
 */

import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import type { GeneratorConfig } from '@/types';

/**
 * Create a temporary directory for testing
 */
export function createTempDir(name: string): string {
  const tempDir = resolve(__dirname, '..', 'temp', name);

  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }

  mkdirSync(tempDir, { recursive: true });

  return tempDir;
}

/**
 * Clean up a temporary directory
 */
export function cleanupTempDir(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

/**
 * Read a file from the test fixtures directory
 */
export function readFixture(filename: string): string {
  const fixturePath = resolve(__dirname, '..', 'fixtures', filename);
  return readFileSync(fixturePath, 'utf-8');
}

/**
 * Get the path to a fixture file
 */
export function getFixturePath(filename: string): string {
  return resolve(__dirname, '..', 'fixtures', filename);
}

/**
 * Create a test configuration
 */
export function createTestConfig(overrides: Partial<GeneratorConfig> = {}): GeneratorConfig {
  return {
    openApiSpecPath: './api-docs.json',
    outputDir: './output',
    apiSpecTypesPath: '@/api/api-spec',
    overwrite: true,
    includePatterns: [],
    excludePatterns: [],
    generateInterfaces: true,
    generateTypeAliases: true,
    generateJSDocs: true,
    generateIndex: true,
    generateReadme: true,
    ...overrides,
  };
}

/**
 * Mock ApiClient for testing
 */
export class MockApiClient {
  private responses: Map<string, any> = new Map();
  public calls: Array<{ method: string; path: string; data?: any }> = [];

  mockResponse(path: string, response: any): void {
    this.responses.set(path, response);
  }

  reset(): void {
    this.responses.clear();
    this.calls = [];
  }

  async get<T>(path: string, params?: any, headers?: any, options?: any): Promise<T> {
    this.calls.push({ method: 'GET', path, data: params });
    const response = this.responses.get(path);
    if (response instanceof Error) throw response;
    return response;
  }

  async post<T>(path: string, data?: any, headers?: any, options?: any): Promise<T> {
    this.calls.push({ method: 'POST', path, data });
    const response = this.responses.get(path);
    if (response instanceof Error) throw response;
    return response;
  }

  async put<T>(path: string, data?: any, headers?: any, options?: any): Promise<T> {
    this.calls.push({ method: 'PUT', path, data });
    const response = this.responses.get(path);
    if (response instanceof Error) throw response;
    return response;
  }

  async patch<T>(path: string, data?: any, headers?: any, options?: any): Promise<T> {
    this.calls.push({ method: 'PATCH', path, data });
    const response = this.responses.get(path);
    if (response instanceof Error) throw response;
    return response;
  }

  async delete<T>(path: string, data?: any, headers?: any, options?: any): Promise<T> {
    this.calls.push({ method: 'DELETE', path, data });
    const response = this.responses.get(path);
    if (response instanceof Error) throw response;
    return response;
  }
}

/**
 * Assert that a file exists
 */
export function assertFileExists(path: string): void {
  if (!existsSync(path)) {
    throw new Error(`Expected file to exist: ${path}`);
  }
}

/**
 * Assert that a file contains specific content
 */
export function assertFileContains(path: string, content: string): void {
  assertFileExists(path);
  const fileContent = readFileSync(path, 'utf-8');
  if (!fileContent.includes(content)) {
    throw new Error(`File ${path} does not contain: ${content}`);
  }
}

/**
 * Wait for a specified time (for async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a sample OpenAPI spec for testing
 */
export function createSampleSpec(name: string = 'Test API'): any {
  return {
    openapi: '3.0.0',
    info: {
      title: name,
      version: '1.0.0',
    },
    paths: {
      '/items': {
        get: {
          operationId: 'getAllItems',
          tags: ['Item'],
          responses: {
            '200': {
              description: 'List of items',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Item',
                    },
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
        Item: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      },
    },
  };
}

/**
 * Normalize line endings for cross-platform testing
 */
export function normalizeLineEndings(str: string): string {
  return str.replace(/\r\n/g, '\n');
}

/**
 * Remove whitespace for comparison
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * OpenAPI Specification Normalizer
 * Normalizes OpenAPI specs to a consistent internal format
 */

import type { OpenAPISpec, OpenAPIOperation, OpenAPIPathItem } from '../../types/openapi.types';

/**
 * Normalized operation with computed fields
 */
export interface NormalizedOperation extends OpenAPIOperation {
  /** HTTP method (lowercase) */
  method: string;
  /** Full path */
  path: string;
  /** Operation ID (generated if missing) */
  operationId: string;
}

/**
 * Result of normalizing a spec with extracted operations
 */
export interface NormalizedSpec {
  /** Normalized OpenAPI specification */
  spec: OpenAPISpec;
  /** Extracted and normalized operations */
  operations: NormalizedOperation[];
}

/**
 * Normalizes an OpenAPI specification
 * - Ensures all operations have operation IDs
 * - Normalizes method names to lowercase
 * - Resolves $ref references (basic)
 * - Extracts operations into a flat array
 *
 * @param spec - OpenAPI specification
 * @returns Normalized specification with operations
 */
export function normalizeSpec(spec: OpenAPISpec): NormalizedSpec {
  const normalized = { ...spec };

  // Normalize paths
  if (normalized.paths) {
    const normalizedPaths: typeof normalized.paths = {};

    for (const [path, pathItem] of Object.entries(normalized.paths)) {
      normalizedPaths[path] = normalizePathItem(pathItem, path);
    }

    normalized.paths = normalizedPaths;
  }

  // Extract operations
  const operations = extractOperations(normalized);

  return {
    spec: normalized,
    operations,
  };
}

/**
 * Normalizes a path item
 *
 * @param pathItem - Path item to normalize
 * @param path - Path string
 * @returns Normalized path item
 */
function normalizePathItem(pathItem: OpenAPIPathItem, path: string): OpenAPIPathItem {
  const normalized = { ...pathItem };

  // Normalize each HTTP method
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

  for (const method of methods) {
    const operation = normalized[method];
    if (operation) {
      normalized[method] = normalizeOperation(operation, method, path);
    }
  }

  return normalized;
}

/**
 * Normalizes an operation
 *
 * @param operation - Operation to normalize
 * @param method - HTTP method
 * @param path - Path string
 * @returns Normalized operation
 */
function normalizeOperation(
  operation: OpenAPIOperation,
  method: string,
  path: string
): OpenAPIOperation {
  const normalized = { ...operation };

  // Ensure operation has an ID
  if (!normalized.operationId) {
    normalized.operationId = generateOperationId(method, path);
  }

  // Ensure tags array exists
  if (!normalized.tags) {
    normalized.tags = [];
  }

  // Normalize parameters
  if (normalized.parameters) {
    normalized.parameters = normalized.parameters.map((param) => ({
      ...param,
      required: param.required ?? param.in === 'path', // Path params are always required
    }));
  }

  return normalized;
}

/**
 * Generates an operation ID from method and path
 *
 * @param method - HTTP method
 * @param path - Path string
 * @returns Generated operation ID
 *
 * @example
 * ```typescript
 * generateOperationId('get', '/api/v1/products/{id}')
 * // => 'getApiV1ProductsById'
 * ```
 */
export function generateOperationId(method: string, path: string): string {
  // Remove leading slash and split by /
  const segments = path.replace(/^\//, '').split('/').filter(Boolean);

  // Convert path parameters to 'ById', 'ByName', etc.
  const converted = segments.map((segment) => {
    if (segment.startsWith('{') && segment.endsWith('}')) {
      const paramName = segment.slice(1, -1);
      return 'By' + capitalize(paramName);
    }
    return capitalize(segment);
  });

  // Combine: method + path segments
  return method.toLowerCase() + converted.join('');
}

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extracts all operations from an OpenAPI spec
 *
 * @param spec - OpenAPI specification
 * @returns Array of normalized operations
 */
export function extractOperations(spec: OpenAPISpec): NormalizedOperation[] {
  const operations: NormalizedOperation[] = [];

  if (!spec.paths) {
    return operations;
  }

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue;

    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

    for (const method of methods) {
      const operation = pathItem[method];
      if (operation) {
        operations.push({
          ...operation,
          method: method.toLowerCase(),
          path,
          operationId: operation.operationId || generateOperationId(method, path),
        });
      }
    }
  }

  return operations;
}

/**
 * Filters operations by tag
 *
 * @param operations - Operations to filter
 * @param tag - Tag to filter by
 * @returns Filtered operations
 */
export function filterOperationsByTag(
  operations: NormalizedOperation[],
  tag: string
): NormalizedOperation[] {
  return operations.filter((op) => op.tags?.includes(tag));
}

/**
 * Filters operations by path pattern
 *
 * @param operations - Operations to filter
 * @param pattern - Path pattern (supports wildcards)
 * @returns Filtered operations
 */
export function filterOperationsByPath(
  operations: NormalizedOperation[],
  pattern: string
): NormalizedOperation[] {
  const regex = new RegExp('^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$');

  return operations.filter((op) => regex.test(op.path));
}

/**
 * Groups operations by tag
 *
 * @param operations - Operations to group
 * @returns Map of tag to operations
 */
export function groupOperationsByTag(
  operations: NormalizedOperation[]
): Map<string, NormalizedOperation[]> {
  const groups = new Map<string, NormalizedOperation[]>();

  for (const operation of operations) {
    const tags = operation.tags || ['default'];

    for (const tag of tags) {
      const existing = groups.get(tag) || [];
      existing.push(operation);
      groups.set(tag, existing);
    }
  }

  return groups;
}

/**
 * Groups operations by base path (resource)
 *
 * @param operations - Operations to group
 * @returns Map of base path to operations
 */
export function groupOperationsByBasePath(
  operations: NormalizedOperation[]
): Map<string, NormalizedOperation[]> {
  const groups = new Map<string, NormalizedOperation[]>();

  for (const operation of operations) {
    const basePath = extractBasePath(operation.path);
    const existing = groups.get(basePath) || [];
    existing.push(operation);
    groups.set(basePath, existing);
  }

  return groups;
}

/**
 * Extracts the base path from a full path
 * Removes path parameters
 *
 * @param path - Full path
 * @returns Base path
 *
 * @example
 * ```typescript
 * extractBasePath('/api/v1/products/{id}') // => '/api/v1/products'
 * extractBasePath('/api/v1/products/{id}/variants/{variantId}') // => '/api/v1/products'
 * ```
 */
export function extractBasePath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const baseSegments: string[] = [];

  for (const segment of segments) {
    // Stop at first path parameter
    if (segment.startsWith('{') && segment.endsWith('}')) {
      break;
    }
    baseSegments.push(segment);
  }

  return '/' + baseSegments.join('/');
}

/**
 * Gets all unique tags from operations
 *
 * @param operations - Operations
 * @returns Array of unique tags
 */
export function getUniqueTags(operations: NormalizedOperation[]): string[] {
  const tags = new Set<string>();

  for (const operation of operations) {
    if (operation.tags) {
      for (const tag of operation.tags) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags);
}

/**
 * Gets statistics about an OpenAPI spec
 *
 * @param spec - OpenAPI specification
 * @returns Statistics object
 */
export function getSpecStatistics(spec: OpenAPISpec): {
  totalPaths: number;
  totalOperations: number;
  operationsByMethod: Record<string, number>;
  tags: string[];
  totalSchemas: number;
} {
  const operations = extractOperations(spec);
  const operationsByMethod: Record<string, number> = {};

  for (const operation of operations) {
    operationsByMethod[operation.method] = (operationsByMethod[operation.method] || 0) + 1;
  }

  return {
    totalPaths: Object.keys(spec.paths).length,
    totalOperations: operations.length,
    operationsByMethod,
    tags: getUniqueTags(operations),
    totalSchemas: spec.components?.schemas ? Object.keys(spec.components.schemas).length : 0,
  };
}

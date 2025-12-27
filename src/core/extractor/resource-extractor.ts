/**
 * Resource Extractor Module
 * Extracts and groups operations by resource from OpenAPI specifications
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import type { OpenAPISpec } from '../../types/openapi.types';
import type { ResourceGroup, ResourceInfo } from '../../types/generator.types';
import type { NormalizedOperation } from '../spec-loader/normalizer';
import { extractOperations } from '../spec-loader/normalizer';
import { singularize, toPascalCase } from '../../utils/string-utils';
import { getPathSegments } from '../../utils/path-utils';

/**
 * Resource grouping configuration
 */
export interface ResourceGroupingConfig {
  /** Number of path segments to use for grouping */
  depth?: number;
  /** Grouping strategy */
  strategy?: 'root' | 'full' | 'auto';
}

/**
 * Resource extraction options
 */
export interface ResourceExtractionOptions {
  /** Patterns to include (whitelist) */
  includePatterns?: string[];
  /** Patterns to exclude (blacklist) */
  excludePatterns?: string[];
  /** Whether to infer primary entity types */
  inferPrimaryEntityType?: boolean;
  /** Custom resource configuration */
  resourceConfig?: Map<string, any>;
  /** Resource grouping configuration */
  resourceGrouping?: ResourceGroupingConfig;
}

/**
 * Extracts resources from an array of normalized operations
 * Simpler version that doesn't require the full spec
 *
 * @param operations - Array of normalized operations
 * @param groupingConfig - Optional resource grouping configuration
 * @returns Array of resource groups
 *
 * @example
 * ```typescript
 * const operations = extractOperations(spec);
 * const resources = extractResources(operations);
 * ```
 */
export function extractResources(
  operations: NormalizedOperation[],
  groupingConfig?: ResourceGroupingConfig
): ResourceGroup[] {
  const resourceMap = new Map<string, ResourceGroup>();

  for (const operation of operations) {
    // Infer resource information from path
    const resourceInfo = inferResourceInfo(
      operation.path,
      operation.tags?.[0] || 'Uncategorized',
      groupingConfig
    );

    // Get or create resource group
    let group = resourceMap.get(resourceInfo.resourceKey);
    if (!group) {
      group = {
        name: resourceInfo.resourceName,
        resourceKey: resourceInfo.resourceKey,
        basePath: resourceInfo.basePath,
        operations: [],
        tag: operation.tags?.[0] || 'Uncategorized',
      };
      resourceMap.set(resourceInfo.resourceKey, group);
    }

    // Add operation to resource group
    group.operations.push(operation);
  }

  return Array.from(resourceMap.values());
}

/**
 * Extracts resource groups from an OpenAPI specification
 *
 * @param spec - OpenAPI specification
 * @param options - Extraction options
 * @returns Array of resource groups
 *
 * @example
 * ```typescript
 * const resources = extractResourceGroups(spec, {
 *   includePatterns: ['/api/v1/product**', '/api/v1/category**'],
 *   excludePatterns: ['/api/v1/admin/**'],
 *   inferPrimaryEntityType: true,
 * });
 * ```
 */
export function extractResourceGroups(
  spec: OpenAPISpec,
  options: ResourceExtractionOptions = {}
): ResourceGroup[] {
  const {
    includePatterns,
    excludePatterns,
    inferPrimaryEntityType = true,
    resourceConfig,
    resourceGrouping,
  } = options;

  // Extract all operations from spec
  const allOperations = extractOperations(spec);

  // Filter operations by patterns
  let filteredOperations = allOperations;

  if (excludePatterns && excludePatterns.length > 0) {
    filteredOperations = filteredOperations.filter(
      (op) => !matchesAnyPattern(op.path, excludePatterns)
    );
  }

  if (includePatterns && includePatterns.length > 0) {
    filteredOperations = filteredOperations.filter((op) =>
      matchesAnyPattern(op.path, includePatterns)
    );
  }

  // Group operations by resource
  const resourceMap = new Map<string, ResourceGroup>();

  for (const operation of filteredOperations) {
    // Infer resource information from path
    const resourceInfo = inferResourceInfo(
      operation.path,
      operation.tags?.[0] || 'Uncategorized',
      resourceGrouping
    );

    // Get or create resource group
    let group = resourceMap.get(resourceInfo.resourceKey);
    if (!group) {
      const config = resourceConfig?.get(resourceInfo.resourceName);

      group = {
        name: resourceInfo.resourceName,
        resourceKey: resourceInfo.resourceKey,
        basePath: resourceInfo.basePath,
        operations: [],
        tag: operation.tags?.[0] || 'Uncategorized',
        config,
      };
      resourceMap.set(resourceInfo.resourceKey, group);
    }

    // Add operation to resource group
    group.operations.push(operation);
  }

  // Convert map to array
  const resources = Array.from(resourceMap.values());

  // Infer primary entity types if requested
  if (inferPrimaryEntityType) {
    for (const resource of resources) {
      resource.primaryEntityType = inferPrimaryEntity(resource, spec);
    }
  }

  return resources;
}

/**
 * Infers resource information from an API path
 *
 * @param pathPattern - API endpoint path
 * @param primaryTag - Primary tag from OpenAPI spec
 * @param groupingConfig - Resource grouping configuration
 * @returns Resource information
 *
 * @example
 * ```typescript
 * inferResourceInfo('/api/v1/product/{id}', 'Products')
 * // Returns: {
 * //   basePath: '/api/v1/product',
 * //   resourceName: 'Product',
 * //   resourceKey: 'product',
 * //   segments: ['api', 'v1', 'product'],
 * //   isNested: false
 * // }
 *
 * inferResourceInfo('/api/v1/admin/product/{id}', 'AdminProducts')
 * // Returns: {
 * //   basePath: '/api/v1/admin/product',
 * //   resourceName: 'AdminProduct',
 * //   resourceKey: 'admin.product',
 * //   segments: ['api', 'v1', 'admin', 'product'],
 * //   isNested: true
 * // }
 * ```
 */
export function inferResourceInfo(
  pathPattern: string,
  _primaryTag?: string,
  groupingConfig?: ResourceGroupingConfig
): ResourceInfo {
  // Get configuration with defaults
  const depth = groupingConfig?.depth ?? 1;
  const strategy = groupingConfig?.strategy ?? 'auto';

  // Remove path parameters
  const pathWithoutParams = pathPattern.replace(/\/\{[^}]+\}/g, '');

  // Get clean segments
  const allSegments = getPathSegments(pathWithoutParams);

  if (allSegments.length === 0) {
    return {
      basePath: '/default',
      resourceName: 'Default',
      resourceKey: 'default',
      segments: ['default'],
      isNested: false,
    };
  }

  // Determine resource segment(s) based on path structure
  let resourceSegments: string[];
  let basePath: string;
  let resourceStartIndex: number; // Index where resource segments start

  // Pattern recognition: /api/vX/resource or /api/vX/group/resource
  if (allSegments[0] === 'api') {
    const hasVersion =
      allSegments.length > 1 && allSegments[1] !== undefined && /^v\d+$/.test(allSegments[1]);

    if (hasVersion) {
      // Format: /api/v1/resource - resources start at index 2
      resourceStartIndex = 2;

      if (
        allSegments.length === resourceStartIndex + 1 &&
        allSegments[resourceStartIndex] !== undefined
      ) {
        // /api/v1/product → ['product']
        resourceSegments = [allSegments[resourceStartIndex] as string];
        basePath = '/' + allSegments.slice(0, resourceStartIndex + 1).join('/');
      } else if (allSegments.length >= resourceStartIndex + 2) {
        // Apply grouping strategy
        // Safe to access allSegments[resourceStartIndex] here since length >= resourceStartIndex + 2
        const rootSegment = allSegments[resourceStartIndex] as string;

        if (strategy === 'root') {
          // Always use root resource (first segment after version)
          // /api/v1/orders/items → ['orders']
          // /api/v1/admin/products → ['admin']
          resourceSegments = [rootSegment];
          basePath = '/' + allSegments.slice(0, resourceStartIndex + 1).join('/');
        } else if (strategy === 'full') {
          // Use all path segments (old behavior)
          // /api/v1/orders/items → ['orders', 'items']
          // /api/v1/admin/products → ['admin', 'products']
          resourceSegments = allSegments.slice(-2);
          basePath = '/' + allSegments.join('/');
        } else {
          // strategy === 'auto': Auto-detect based on path parameters
          // If original path has params, treat additional segments as sub-resources
          const hasPathParams = pathPattern.includes('/{');

          if (hasPathParams) {
            // /api/v1/orders/{id}/items → ['orders'] (always root, ignore depth)
            resourceSegments = [rootSegment];
            basePath = '/' + allSegments.slice(0, resourceStartIndex + 1).join('/');
          } else {
            // /api/v1/admin/products → ['admin', 'products'] (if depth >= 2)
            // /api/v1/products/sku → ['products'] (depth=1, use root)
            resourceSegments = allSegments.slice(resourceStartIndex, resourceStartIndex + depth);
            // BasePath includes prefix + depth resource segments
            basePath = '/' + allSegments.slice(0, resourceStartIndex + depth).join('/');
          }
        }
      } else {
        // Fallback
        resourceSegments = allSegments.slice(resourceStartIndex);
        basePath = '/' + allSegments.join('/');
      }
    } else {
      // Format: /api/resource (no version) - resources start at index 1
      resourceStartIndex = 1;
      resourceSegments = allSegments.slice(resourceStartIndex, resourceStartIndex + depth);
      basePath = '/' + allSegments.slice(0, resourceStartIndex + depth).join('/');
    }
  } else {
    // No /api prefix - resources start at index 0
    resourceStartIndex = 0;
    resourceSegments = allSegments.slice(resourceStartIndex, resourceStartIndex + depth);
    basePath = '/' + allSegments.slice(0, resourceStartIndex + depth).join('/');
  }

  // Ensure we have at least one segment
  if (resourceSegments.length === 0) {
    resourceSegments = [allSegments[allSegments.length - 1] || 'default'];
    basePath = pathWithoutParams;
  }

  // Build resource key using dots (e.g., "admin.product" or "product")
  const resourceKey = resourceSegments.join('.');

  // Build resource name in PascalCase (e.g., "AdminProduct" or "Product")
  const resourceName = resourceSegments.map((seg) => toPascalCase(singularize(seg))).join('');

  return {
    basePath,
    resourceName,
    resourceKey,
    segments: allSegments,
    isNested: resourceSegments.length > 1,
  };
}

/**
 * Infers the primary entity type for a resource from its operations
 *
 * @param resource - Resource group
 * @param spec - OpenAPI specification
 * @returns Primary entity type name or undefined
 *
 * @example
 * ```typescript
 * const primaryType = inferPrimaryEntity(resource, spec);
 * // => 'ProductDTO'
 * ```
 */
export function inferPrimaryEntity(
  resource: ResourceGroup,
  _spec: OpenAPISpec
): string | undefined {
  // Priority 1: Look for successful GET responses (200, 201)
  for (const op of resource.operations) {
    if (op.method === 'get') {
      const entityType = extractEntityTypeFromResponse(op, ['200', '201']);
      if (entityType) {
        return entityType;
      }
    }
  }

  // Priority 2: Look for POST/PUT responses
  for (const op of resource.operations) {
    if (op.method === 'post' || op.method === 'put') {
      const entityType = extractEntityTypeFromResponse(op, ['200', '201']);
      if (entityType) {
        return entityType;
      }
    }
  }

  // Priority 3: Look for request bodies
  for (const op of resource.operations) {
    if (op.requestBody) {
      const entityType = extractEntityTypeFromRequestBody(op);
      if (entityType) {
        return entityType;
      }
    }
  }

  return undefined;
}

/**
 * Extracts entity type from operation response
 *
 * @param operation - Operation to extract from
 * @param statusCodes - Status codes to check
 * @returns Entity type name or undefined
 */
function extractEntityTypeFromResponse(
  operation: NormalizedOperation,
  statusCodes: string[]
): string | undefined {
  if (!operation.responses) return undefined;

  for (const statusCode of statusCodes) {
    const response = operation.responses[statusCode];
    if (!response?.content) continue;

    const jsonContent = response.content['application/json'];
    if (!jsonContent?.schema) continue;

    const schema = jsonContent.schema;

    // Direct reference
    if (schema.$ref) {
      return extractSchemaNameFromRef(schema.$ref);
    }

    // Array with items
    if (schema.type === 'array' && schema.items?.$ref) {
      return extractSchemaNameFromRef(schema.items.$ref);
    }

    // Handle generic wrapper types like Page<T>
    if (schema.type === 'object' && schema.properties) {
      // Look for common pagination patterns
      const contentProp = (schema.properties as any).content;
      if (contentProp?.items?.$ref) {
        return extractSchemaNameFromRef(contentProp.items.$ref);
      }

      const dataProp = (schema.properties as any).data;
      if (dataProp?.$ref) {
        return extractSchemaNameFromRef(dataProp.$ref);
      }
      if (dataProp?.items?.$ref) {
        return extractSchemaNameFromRef(dataProp.items.$ref);
      }
    }
  }

  return undefined;
}

/**
 * Extracts entity type from operation request body
 *
 * @param operation - Operation to extract from
 * @returns Entity type name or undefined
 */
function extractEntityTypeFromRequestBody(operation: NormalizedOperation): string | undefined {
  const requestBody = operation.requestBody;
  if (!requestBody?.content) return undefined;

  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent?.schema) return undefined;

  const schema = jsonContent.schema;

  if (schema.$ref) {
    return extractSchemaNameFromRef(schema.$ref);
  }

  return undefined;
}

/**
 * Extracts schema name from $ref string
 *
 * @param ref - Schema reference
 * @returns Schema name
 *
 * @example
 * ```typescript
 * extractSchemaNameFromRef('#/components/schemas/ProductDTO')
 * // => 'ProductDTO'
 * ```
 */
function extractSchemaNameFromRef(ref: string): string {
  return ref.split('/').pop() || 'unknown';
}

/**
 * Checks if a path matches any of the patterns
 *
 * @param path - Path to check
 * @param patterns - Patterns to match against
 * @returns True if path matches any pattern
 *
 * Pattern rules:
 * - `*` matches any characters except `/` (single segment)
 * - `**` matches any characters including `/` (multiple segments)
 * - `/path/**` matches `/path` AND `/path/anything`
 *
 * @example
 * `/api/v1/product**` matches:
 *   - `/api/v1/product`
 *   - `/api/v1/products`
 *   - `/api/v1/product/{id}`
 *
 * `/api/v1/product/**` matches:
 *   - `/api/v1/product`
 *   - `/api/v1/product/{id}`
 *   - `/api/v1/product/sku/{sku}`
 */
function matchesAnyPattern(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    let regexPattern: string;

    // Special handling for /** pattern - should match base path too
    // /api/v1/product/** should match both /api/v1/product and /api/v1/product/anything
    if (pattern.endsWith('/**')) {
      const basePath = pattern.slice(0, -3); // Remove /**
      // Replace wildcards in base path first
      const baseRegex = basePath.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
      // Add optional /anything part (already in regex format, don't process further)
      regexPattern = baseRegex + '(/.*)?';
    } else {
      // Standard wildcard replacement
      regexPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    }

    const regex = new RegExp('^' + regexPattern + '$');
    return regex.test(path);
  });
}

/**
 * Gets resource statistics
 *
 * @param resources - Resource groups
 * @returns Statistics object
 */
export function getResourceStatistics(resources: ResourceGroup[]): {
  totalResources: number;
  totalOperations: number;
  operationsPerResource: Record<string, number>;
  resourcesWithPrimaryEntity: number;
  nestedResources: number;
} {
  const operationsPerResource: Record<string, number> = {};
  let resourcesWithPrimaryEntity = 0;
  let nestedResources = 0;
  let totalOperations = 0;

  for (const resource of resources) {
    operationsPerResource[resource.resourceKey] = resource.operations.length;
    totalOperations += resource.operations.length;

    if (resource.primaryEntityType) {
      resourcesWithPrimaryEntity++;
    }

    if (resource.resourceKey.includes('.')) {
      nestedResources++;
    }
  }

  return {
    totalResources: resources.length,
    totalOperations,
    operationsPerResource,
    resourcesWithPrimaryEntity,
    nestedResources,
  };
}

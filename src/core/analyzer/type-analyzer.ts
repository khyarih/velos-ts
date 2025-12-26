/**
 * Type Analyzer Module
 * Analyzes and collects type information from resources and operations
 */

import type { OpenAPISpec, OpenAPISchema } from '../../types/openapi.types';
import type {
  ResourceGroup,
  SchemaUsage,
  QueryParamType,
  QueryParameter,
} from '../../types/generator.types';
import { extractSchemaName, openApiTypeToTypeScript } from '../../utils/schema-utils';
import { toPascalCase } from '../../utils/string-utils';

/**
 * Collects all schema types used by a resource's operations
 *
 * @param resource - Resource group to analyze
 * @param spec - OpenAPI specification for resolving references
 * @returns Set of schema names used
 *
 * @example
 * ```typescript
 * const schemas = collectUsedSchemas(resource, spec);
 * // => Set(['ProductDTO', 'UpdateProductRequest', 'Page'])
 * ```
 */
export function collectUsedSchemas(resource: ResourceGroup, spec: OpenAPISpec): Set<string> {
  const schemas = new Set<string>();

  for (const op of resource.operations) {
    // Collect from request body
    collectSchemasFromRequestBody(op, schemas);

    // Collect from responses
    collectSchemasFromResponses(op, schemas, spec);
  }

  return schemas;
}

/**
 * Collects schema usage statistics for a resource
 *
 * @param resource - Resource group to analyze
 * @param spec - OpenAPI specification
 * @returns Array of schema usage information
 */
export function analyzeSchemaUsage(resource: ResourceGroup, spec: OpenAPISpec): SchemaUsage[] {
  const usageMap = new Map<string, SchemaUsage>();

  for (const op of resource.operations) {
    // Analyze request body schemas
    const requestSchemas = getSchemasFromRequestBody(op);
    for (const schema of requestSchemas) {
      updateSchemaUsage(usageMap, schema, op.operationId, 'request');
    }

    // Analyze response schemas
    const responseSchemas = getSchemasFromResponses(op);
    for (const schema of responseSchemas) {
      updateSchemaUsage(usageMap, schema, op.operationId, 'response');
    }
  }

  // Determine primary entity
  const usageArray = Array.from(usageMap.values());
  if (usageArray.length > 0) {
    // Mark the most used schema in responses as primary
    const sorted = usageArray
      .filter((u) => u.context !== 'request')
      .sort((a, b) => b.usageCount - a.usageCount);

    if (sorted.length > 0) {
      sorted[0].isPrimary = true;
    }
  }

  return usageArray;
}

/**
 * Collects query parameter types for a resource
 *
 * @param resource - Resource group to analyze
 * @returns Array of query parameter type definitions
 *
 * @example
 * ```typescript
 * const queryTypes = collectQueryParamTypes(resource);
 * // => [{
 * //   typeName: 'GetAllProductsQueryParams',
 * //   operationId: 'getAllProducts',
 * //   parameters: [{ name: 'page', type: 'number', optional: true }],
 * //   allOptional: true
 * // }]
 * ```
 */
export function collectQueryParamTypes(resource: ResourceGroup): QueryParamType[] {
  const queryTypes: QueryParamType[] = [];

  for (const op of resource.operations) {
    const queryParams = op.parameters?.filter((p) => p.in === 'query') || [];

    if (queryParams.length > 0) {
      const typeName = `${toPascalCase(op.operationId)}QueryParams`;

      const parameters: QueryParameter[] = queryParams.map((p) => ({
        name: p.name,
        type: mapSchemaTypeToTypeScript(p.schema),
        optional: !p.required,
        description: p.description,
        enumValues: p.schema?.enum as string[] | undefined,
      }));

      const allOptional = parameters.every((p) => p.optional);

      queryTypes.push({
        typeName,
        operationId: op.operationId,
        parameters,
        allOptional,
      });
    }
  }

  return queryTypes;
}

/**
 * Gets all path parameter types for a resource
 *
 * @param resource - Resource group to analyze
 * @returns Map of parameter names to their types
 */
export function collectPathParameterTypes(resource: ResourceGroup): Map<string, string> {
  const pathParams = new Map<string, string>();

  for (const op of resource.operations) {
    const params = op.parameters?.filter((p) => p.in === 'path') || [];

    for (const param of params) {
      if (!pathParams.has(param.name)) {
        pathParams.set(param.name, mapSchemaTypeToTypeScript(param.schema));
      }
    }
  }

  return pathParams;
}

/**
 * Determines the return type for an operation
 *
 * @param operation - Operation to analyze
 * @param spec - OpenAPI specification
 * @returns Return type string
 */
export function inferReturnType(operation: any, spec: OpenAPISpec): string {
  // Check successful responses
  const successResponse =
    operation.responses?.['200'] || operation.responses?.['201'] || operation.responses?.['204'];

  if (!successResponse?.content) {
    return 'void';
  }

  const jsonContent = successResponse.content['application/json'] || successResponse.content['*/*'];

  if (!jsonContent?.schema) {
    return 'unknown';
  }

  return mapSchemaToTypeString(jsonContent.schema, spec);
}

/**
 * Maps an OpenAPI schema to a TypeScript type string
 *
 * @param schema - OpenAPI schema
 * @param spec - OpenAPI specification for resolving references
 * @returns TypeScript type string
 */
export function mapSchemaToTypeString(schema: OpenAPISchema, spec: OpenAPISpec): string {
  if (schema.$ref) {
    const schemaName = extractSchemaName(schema.$ref);
    return `components['schemas']['${schemaName}']`;
  }

  if (schema.type === 'array' && schema.items) {
    const itemType = mapSchemaToTypeString(schema.items, spec);
    return `${itemType}[]`;
  }

  if (schema.type) {
    return openApiTypeToTypeScript(schema.type, schema.format);
  }

  return 'unknown';
}

// ============================================================================
// Private Helper Functions
// ============================================================================

/**
 * Collects schemas from request body
 */
function collectSchemasFromRequestBody(operation: any, schemas: Set<string>): void {
  if (!operation.requestBody?.content) return;

  const jsonContent = operation.requestBody.content['application/json'];
  if (jsonContent?.schema?.$ref) {
    const schemaName = extractSchemaName(jsonContent.schema.$ref);
    schemas.add(schemaName);
  }
}

/**
 * Collects schemas from responses
 */
function collectSchemasFromResponses(
  operation: any,
  schemas: Set<string>,
  spec: OpenAPISpec
): void {
  const successResponse =
    operation.responses?.['200'] || operation.responses?.['201'] || operation.responses?.['204'];

  if (!successResponse?.content) return;

  const jsonContent = successResponse.content['application/json'] || successResponse.content['*/*'];

  if (!jsonContent?.schema?.$ref) return;

  const schemaName = extractSchemaName(jsonContent.schema.$ref);
  schemas.add(schemaName);

  // Handle pagination/wrapper types
  if (schemaName.includes('Page') && spec.components?.schemas) {
    handlePageSchema(schemaName, schemas, spec);
  }
}

/**
 * Handles Page-like schema types
 */
function handlePageSchema(schemaName: string, schemas: Set<string>, spec: OpenAPISpec): void {
  const pageSchema = spec.components?.schemas?.[schemaName];
  if (!pageSchema) return;

  // Look for content property with array items
  const properties = (pageSchema as any).properties;
  if (properties?.content?.items?.$ref) {
    const contentType = extractSchemaName(properties.content.items.$ref);
    schemas.add(contentType);
    schemas.add('Page');
  }

  // Look for data property
  if (properties?.data?.items?.$ref) {
    const contentType = extractSchemaName(properties.data.items.$ref);
    schemas.add(contentType);
    schemas.add('Page');
  }
}

/**
 * Gets schemas from request body
 */
function getSchemasFromRequestBody(operation: any): string[] {
  const schemas: string[] = [];

  if (operation.requestBody?.content) {
    const jsonContent = operation.requestBody.content['application/json'];
    if (jsonContent?.schema?.$ref) {
      schemas.push(extractSchemaName(jsonContent.schema.$ref));
    }
  }

  return schemas;
}

/**
 * Gets schemas from responses
 */
function getSchemasFromResponses(operation: any): string[] {
  const schemas: string[] = [];

  for (const [statusCode, response] of Object.entries(operation.responses || {})) {
    if (!statusCode.startsWith('2')) continue; // Only success responses

    const resp = response as any;
    if (resp.content) {
      const jsonContent = resp.content['application/json'] || resp.content['*/*'];
      if (jsonContent?.schema?.$ref) {
        schemas.push(extractSchemaName(jsonContent.schema.$ref));
      }
    }
  }

  return schemas;
}

/**
 * Updates schema usage tracking
 */
function updateSchemaUsage(
  usageMap: Map<string, SchemaUsage>,
  schemaName: string,
  operationId: string,
  context: 'request' | 'response'
): void {
  const existing = usageMap.get(schemaName);

  if (existing) {
    existing.usageCount++;
    existing.usedInOperations.push(operationId);

    if (existing.context !== context) {
      existing.context = 'both';
    }
  } else {
    usageMap.set(schemaName, {
      name: schemaName,
      usageCount: 1,
      usedInOperations: [operationId],
      context,
      isPrimary: false,
    });
  }
}

/**
 * Maps OpenAPI schema to TypeScript type
 */
function mapSchemaTypeToTypeScript(schema: any): string {
  if (!schema) return 'unknown';

  if (schema.$ref) {
    const schemaName = extractSchemaName(schema.$ref);
    return `components['schemas']['${schemaName}']`;
  }

  if (schema.enum) {
    return schema.enum.map((v: any) => `'${v}'`).join(' | ');
  }

  if (schema.type === 'array' && schema.items) {
    return `${mapSchemaTypeToTypeScript(schema.items)}[]`;
  }

  return openApiTypeToTypeScript(schema.type, schema.format);
}

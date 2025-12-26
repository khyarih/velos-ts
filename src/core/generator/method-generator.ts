/**
 * Method Generator
 * Generates repository method implementations
 */

import type { OpenAPISpec } from '../../types/openapi.types';
import type { ResourceGroup, MethodSignature, MethodParameter } from '../../types/generator.types';
import type { NormalizedOperation } from '../spec-loader/normalizer';
import { extractSchemaName } from '../../utils/schema-utils';
import { toCamelCase } from '../../utils/string-utils';
import { inferReturnType } from '../analyzer/type-analyzer';

/**
 * Generates a method implementation for an operation
 *
 * @param operation - Operation to generate method for
 * @param resource - Resource group
 * @param spec - OpenAPI specification
 * @returns Method implementation as string
 */
export function generateMethod(
  operation: NormalizedOperation,
  resource: ResourceGroup,
  spec: OpenAPISpec
): string {
  const methodName = getMethodName(operation);
  const signature = extractMethodSignature(operation, spec);
  const body = generateMethodBody(operation, resource, spec);

  const lines: string[] = [];

  // JSDoc comment
  lines.push('  /**');
  if (operation.summary) {
    lines.push(`   * ${operation.summary}`);
  }
  if (operation.description) {
    lines.push(`   * ${operation.description}`);
  }
  lines.push('   *');
  lines.push('   * @async');
  lines.push('   */');

  // Method signature
  lines.push(`  async ${methodName}(${signature.params}): ${signature.returnType} {`);

  // Method body
  lines.push(body);

  // Close method
  lines.push('  }');

  return lines.join('\n');
}

/**
 * Gets the method name from an operation
 *
 * @param operation - Operation
 * @returns Method name in camelCase
 */
export function getMethodName(operation: NormalizedOperation): string {
  return toCamelCase(operation.operationId);
}

/**
 * Extracts method signature from an operation
 *
 * @param operation - Operation
 * @param spec - OpenAPI specification
 * @returns Method signature information
 */
export function extractMethodSignature(
  operation: NormalizedOperation,
  spec: OpenAPISpec
): MethodSignature {
  const parameters: MethodParameter[] = [];

  // Path parameters
  const pathParams = operation.parameters?.filter((p) => p.in === 'path') || [];
  for (const param of pathParams) {
    parameters.push({
      name: param.name,
      type: getParameterType(param.schema),
      optional: false,
      source: 'path',
      originalName: param.name,
      description: param.description,
    });
  }

  // Request body parameter
  if (operation.requestBody) {
    const bodyType = getRequestBodyType(operation);
    parameters.push({
      name: 'data',
      type: bodyType,
      optional: !operation.requestBody.required,
      source: 'body',
      description: operation.requestBody.description,
    });
  }

  // Query parameters
  const queryParams = operation.parameters?.filter((p) => p.in === 'query') || [];
  if (queryParams.length > 0) {
    const queryTypeName = `${toCamelCase(operation.operationId)}QueryParams`;
    parameters.push({
      name: 'queryParams',
      type: queryTypeName,
      optional: queryParams.every((p) => !p.required),
      source: 'query',
      description: 'Query parameters',
    });
  }

  // Request options (always optional, always last)
  parameters.push({
    name: 'options',
    type: 'RequestOptions',
    optional: true,
    source: 'options',
    description: 'Request options',
  });

  // Build params string
  const paramsString = parameters
    .map((p) => {
      const optional = p.optional ? '?' : '';
      return `${p.name}${optional}: ${p.type}`;
    })
    .join(', ');

  // Determine return type
  const returnType = inferReturnType(operation, spec);
  const fullReturnType = `Promise<Result<${returnType}>>`;

  return {
    params: paramsString,
    returnType: fullReturnType,
    parameters,
    returnTypeInfo: {
      baseType: returnType,
      isResultWrapped: true,
      isArray: returnType.includes('[]'),
      isGeneric: returnType.includes('<'),
      fullType: fullReturnType,
    },
  };
}

/**
 * Generates the method body implementation
 *
 * @param operation - Operation
 * @param resource - Resource group
 * @param spec - OpenAPI specification
 * @returns Method body as string
 */
export function generateMethodBody(
  operation: NormalizedOperation,
  resource: ResourceGroup,
  spec: OpenAPISpec
): string {
  const method = operation.method.toLowerCase();
  const pathParams = operation.parameters?.filter((p) => p.in === 'path') || [];
  const queryParams = operation.parameters?.filter((p) => p.in === 'query') || [];
  const hasRequestBody = !!operation.requestBody;
  const needsAuth = requiresAuthentication(operation);

  // Build endpoint path
  const endpointPath = buildEndpointPath(operation.path, resource.basePath, pathParams);

  // Determine response type
  const responseType = getResponseType(operation);

  // Build API client call
  const clientCall = buildClientCall(
    method,
    endpointPath,
    responseType,
    hasRequestBody,
    queryParams.length > 0,
    needsAuth
  );

  // Wrap in try-catch with Result pattern
  return `    try {
      ${clientCall}
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }`;
}

/**
 * Builds the endpoint path with parameter interpolation
 *
 * @param fullPath - Full operation path
 * @param basePath - Resource base path
 * @param pathParams - Path parameters
 * @returns Endpoint path template string
 */
function buildEndpointPath(fullPath: string, basePath: string, pathParams: any[]): string {
  // Replace base path with ${this.endpoint}
  let path = fullPath.replace(basePath, '${this.endpoint}');

  // Replace {param} with ${param}
  path = path.replace(/\{(\w+)\}/g, '${$1}');

  // Wrap in backticks
  return '`' + path + '`';
}

/**
 * Builds the API client call
 *
 * @param method - HTTP method
 * @param endpointPath - Endpoint path
 * @param responseType - Response type
 * @param hasRequestBody - Whether operation has request body
 * @param hasQueryParams - Whether operation has query parameters
 * @param needsAuth - Whether operation needs authentication
 * @returns Client call statement
 */
function buildClientCall(
  method: string,
  endpointPath: string,
  responseType: string,
  hasRequestBody: boolean,
  hasQueryParams: boolean,
  needsAuth: boolean
): string {
  const optionsWithAuth = needsAuth ? '{ ...options, requiresAuth: true }' : 'options';

  switch (method) {
    case 'get':
      if (hasQueryParams) {
        return `const response = await this.apiClient.get<${responseType}>(${endpointPath}, queryParams as unknown as Record<string, unknown>, {}, ${optionsWithAuth});`;
      }
      return `const response = await this.apiClient.get<${responseType}>(${endpointPath}, undefined, {}, ${optionsWithAuth});`;

    case 'post':
      if (hasRequestBody) {
        return `const response = await this.apiClient.post<${responseType}>(${endpointPath}, data, {}, ${optionsWithAuth});`;
      }
      return `const response = await this.apiClient.post<${responseType}>(${endpointPath}, undefined, {}, ${optionsWithAuth});`;

    case 'put':
      if (hasRequestBody) {
        return `const response = await this.apiClient.put<${responseType}>(${endpointPath}, data, {}, ${optionsWithAuth});`;
      }
      return `const response = await this.apiClient.put<${responseType}>(${endpointPath}, undefined, {}, ${optionsWithAuth});`;

    case 'patch':
      if (hasRequestBody) {
        return `const response = await this.apiClient.patch<${responseType}>(${endpointPath}, data, {}, ${optionsWithAuth});`;
      }
      return `const response = await this.apiClient.patch<${responseType}>(${endpointPath}, undefined, {}, ${optionsWithAuth});`;

    case 'delete':
      return `const response = await this.apiClient.delete<void>(${endpointPath}, undefined, {}, ${optionsWithAuth});`;

    default:
      return `throw new Error('Unsupported HTTP method: ${method}');`;
  }
}

/**
 * Gets the parameter type from schema
 *
 * @param schema - Parameter schema
 * @returns TypeScript type
 */
function getParameterType(schema: any): string {
  if (!schema) return 'unknown';

  if (schema.type === 'integer' || schema.type === 'number') {
    return 'number';
  }

  if (schema.type === 'boolean') {
    return 'boolean';
  }

  if (schema.type === 'array') {
    return 'unknown[]';
  }

  return 'string';
}

/**
 * Gets the request body type
 *
 * @param operation - Operation
 * @returns TypeScript type for request body
 */
function getRequestBodyType(operation: NormalizedOperation): string {
  const requestBody = operation.requestBody;
  if (!requestBody?.content) return 'unknown';

  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent?.schema) return 'unknown';

  const schema = jsonContent.schema;

  if (schema.$ref) {
    const schemaName = extractSchemaName(schema.$ref);
    return schemaName;
  }

  if (schema.type === 'array') {
    return 'unknown[]';
  }

  if (schema.type === 'object') {
    return 'Record<string, unknown>';
  }

  return 'unknown';
}

/**
 * Gets the response type from operation
 *
 * @param operation - Operation
 * @returns TypeScript type for response
 */
function getResponseType(operation: NormalizedOperation): string {
  const successResponse =
    operation.responses?.['200'] || operation.responses?.['201'] || operation.responses?.['204'];

  if (!successResponse?.content) {
    return 'void';
  }

  const jsonContent = successResponse.content['application/json'] || successResponse.content['*/*'];

  if (!jsonContent?.schema) {
    return 'unknown';
  }

  const schema = jsonContent.schema;

  if (schema.$ref) {
    return extractSchemaName(schema.$ref);
  }

  if (schema.type === 'array') {
    return 'unknown[]';
  }

  if (schema.type === 'object') {
    return 'Record<string, unknown>';
  }

  return 'unknown';
}

/**
 * Determines if an operation requires authentication
 *
 * @param operation - Operation to check
 * @returns True if authentication is required
 */
function requiresAuthentication(operation: NormalizedOperation): boolean {
  // If operation has explicit security requirements, it needs auth
  if (operation.security && operation.security.length > 0) {
    return true;
  }

  // Default to requiring auth for POST, PUT, PATCH, DELETE
  const method = operation.method.toLowerCase();
  return ['post', 'put', 'patch', 'delete'].includes(method);
}

/**
 * Generates all methods for a resource
 *
 * @param resource - Resource group
 * @param spec - OpenAPI specification
 * @returns Array of method implementations
 */
export function generateAllMethods(resource: ResourceGroup, spec: OpenAPISpec): string[] {
  return resource.operations.map((op) => generateMethod(op, resource, spec));
}

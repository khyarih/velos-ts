/**
 * Interface Generator
 * Generates TypeScript interfaces for repositories
 */

import type { OpenAPISpec } from '../../types/openapi.types';
import type { ResourceGroup } from '../../types/generator.types';
import { getMethodName, extractMethodSignature } from './method-generator';

/**
 * Generates a repository interface
 *
 * @param resource - Resource group
 * @param interfaceName - Name of the interface
 * @param spec - OpenAPI specification
 * @returns Interface definition as string
 */
export function generateInterface(
  resource: ResourceGroup,
  interfaceName: string,
  spec: OpenAPISpec
): string {
  const lines: string[] = [];

  // JSDoc comment
  lines.push('/**');
  lines.push(` * ${resource.name} Repository Interface`);
  lines.push(` *`);
  lines.push(` * Defines the contract for ${resource.name} repository operations.`);
  lines.push(` * All methods return Promise<Result<T>> for type-safe error handling.`);
  lines.push(` *`);
  lines.push(` * @interface ${interfaceName}`);
  lines.push(' */');

  // Interface declaration
  lines.push(`export interface ${interfaceName} {`);

  // Generate method signatures
  for (const operation of resource.operations) {
    const methodSignature = generateMethodSignature(operation, spec);
    lines.push(methodSignature);
    lines.push('');
  }

  // Close interface
  lines.push('}');

  return lines.join('\n');
}

/**
 * Generates a method signature for the interface
 *
 * @param operation - Operation
 * @param spec - OpenAPI specification
 * @returns Method signature as string
 */
function generateMethodSignature(operation: any, spec: OpenAPISpec): string {
  const methodName = getMethodName(operation);
  const signature = extractMethodSignature(operation, spec);

  const lines: string[] = [];

  // JSDoc comment
  lines.push('  /**');
  if (operation.summary) {
    lines.push(`   * ${operation.summary}`);
  }
  if (operation.description) {
    lines.push(`   * ${operation.description}`);
  }
  lines.push('   */');

  // Method signature
  lines.push(`  ${methodName}(${signature.params}): ${signature.returnType};`);

  return lines.join('\n');
}

/**
 * Gets the interface name for a resource
 *
 * @param resourceName - Resource name
 * @returns Interface name
 */
export function getInterfaceName(resourceName: string): string {
  return `I${resourceName}Repository`;
}

/**
 * Gets the class name for a resource
 *
 * @param resourceName - Resource name
 * @returns Class name
 */
export function getClassName(resourceName: string): string {
  return `${resourceName}Repository`;
}

/**
 * Type Alias Generator
 * Generates type aliases and query parameter interfaces
 */

import type { QueryParamType } from '../../types/generator.types';
import type { GeneratorConfig } from '../../types/config.types';

/**
 * Generates type aliases for schema types
 *
 * @param usedSchemas - Set of schema names to create aliases for
 * @param config - Generator configuration
 * @returns Type alias definitions as string
 */
export function generateTypeAliases(usedSchemas: Set<string>, _config: GeneratorConfig): string {
  if (usedSchemas.size === 0) {
    return '';
  }

  const aliases: string[] = [];
  aliases.push('// Type Aliases');

  const sortedSchemas = Array.from(usedSchemas).sort();

  for (const schemaName of sortedSchemas) {
    // Skip the generic Page type - it doesn't exist as a direct schema
    if (schemaName === 'Page') {
      continue;
    }

    const alias = `export type ${schemaName} = components['schemas']['${schemaName}'];`;
    aliases.push(alias);
  }

  return aliases.join('\n');
}

/**
 * Generates query parameter type interfaces
 *
 * @param queryTypes - Array of query parameter type definitions
 * @returns Query parameter interfaces as string
 */
export function generateQueryParamTypes(queryTypes: QueryParamType[]): string {
  if (queryTypes.length === 0) {
    return '';
  }

  const interfaces: string[] = [];
  interfaces.push('');
  interfaces.push('// Query Parameter Types');

  for (const queryType of queryTypes) {
    const interfaceCode = generateQueryParamInterface(queryType);
    interfaces.push(interfaceCode);
  }

  return interfaces.join('\n');
}

/**
 * Generates a single query parameter interface
 *
 * @param queryType - Query parameter type definition
 * @returns Interface code as string
 */
export function generateQueryParamInterface(queryType: QueryParamType): string {
  const lines: string[] = [];

  // Add JSDoc if all parameters are optional
  if (queryType.allOptional) {
    lines.push(`/** Query parameters for ${queryType.operationId} (all optional) */`);
  } else {
    lines.push(`/** Query parameters for ${queryType.operationId} */`);
  }

  lines.push(`export interface ${queryType.typeName} {`);

  for (const param of queryType.parameters) {
    // Add parameter JSDoc if description exists
    if (param.description) {
      lines.push(`  /** ${param.description} */`);
    }

    // Add enum values as JSDoc if they exist
    if (param.enumValues && param.enumValues.length > 0) {
      lines.push(`  /** Possible values: ${param.enumValues.join(', ')} */`);
    }

    const optional = param.optional ? '?' : '';
    lines.push(`  ${param.name}${optional}: ${param.type};`);
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Combines type aliases and query parameter types
 *
 * @param usedSchemas - Set of schema names
 * @param queryTypes - Array of query parameter types
 * @param config - Generator configuration
 * @returns Combined type definitions
 */
export function generateAllTypes(
  usedSchemas: Set<string>,
  queryTypes: QueryParamType[],
  config: GeneratorConfig
): string {
  const parts: string[] = [];

  const typeAliases = generateTypeAliases(usedSchemas, config);
  if (typeAliases) {
    parts.push(typeAliases);
  }

  const queryParams = generateQueryParamTypes(queryTypes);
  if (queryParams) {
    parts.push(queryParams);
  }

  return parts.join('\n\n');
}

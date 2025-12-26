/**
 * Import Generator
 * Generates import statements for repository files
 */

import type { ResourceGroup } from '../../types/generator.types';
import type { GeneratorConfig } from '../../types/config.types';

/**
 * Generates import statements for a repository file
 *
 * @param resource - Resource group
 * @param config - Generator configuration
 * @param usedSchemas - Set of schema names used in the repository
 * @returns Import statements as string
 */
export function generateImports(
  resource: ResourceGroup,
  config: GeneratorConfig,
  usedSchemas: Set<string>
): string {
  const imports: string[] = [];

  // Import runtime dependencies
  imports.push(`import type { ApiClient, RequestOptions } from 'velos-ts/runtime';`);
  imports.push(`import { BaseRepository } from 'velos-ts/runtime';`);
  imports.push(`import type { Result } from 'velos-ts/runtime';`);
  imports.push(`import { success, failure, errorToDetails } from 'velos-ts/runtime';`);
  imports.push('');

  // Import OpenAPI types
  const apiSpecPath = config.apiSpecTypesPath;
  imports.push(`import type { components } from '${apiSpecPath}';`);
  imports.push('');

  return imports.join('\n');
}

/**
 * Generates import statement for a custom module
 *
 * @param from - Module path
 * @param namedImports - Named imports
 * @param typeOnly - Whether this is a type-only import
 * @returns Import statement
 */
export function generateCustomImport(
  from: string,
  namedImports: string[],
  typeOnly: boolean = false
): string {
  const typePrefix = typeOnly ? 'type ' : '';
  const imports = namedImports.join(', ');
  return `import ${typePrefix}{ ${imports} } from '${from}';`;
}

/**
 * Generates import statement for a default import
 *
 * @param from - Module path
 * @param defaultImport - Default import name
 * @returns Import statement
 */
export function generateDefaultImport(from: string, defaultImport: string): string {
  return `import ${defaultImport} from '${from}';`;
}

/**
 * Generates import statement for a namespace import
 *
 * @param from - Module path
 * @param namespace - Namespace name
 * @returns Import statement
 */
export function generateNamespaceImport(from: string, namespace: string): string {
  return `import * as ${namespace} from '${from}';`;
}

/**
 * Combines multiple import statements with proper spacing
 *
 * @param imports - Array of import statements
 * @returns Combined import statements
 */
export function combineImports(imports: string[]): string {
  return imports.filter(Boolean).join('\n') + '\n';
}

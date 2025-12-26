/**
 * Schema Utility Functions
 * Utilities for working with OpenAPI schemas and references
 */

/**
 * Extracts the schema type name from a $ref string
 *
 * @param ref - OpenAPI $ref string (e.g., '#/components/schemas/ProductDTO')
 * @returns Schema name (e.g., 'ProductDTO')
 *
 * @example
 * ```typescript
 * extractSchemaName('#/components/schemas/ProductDTO') // 'ProductDTO'
 * extractSchemaName('#/components/responses/ErrorResponse') // 'ErrorResponse'
 * ```
 */
export function extractSchemaName(ref: string): string {
  return ref.split('/').pop() || 'unknown';
}

/**
 * Checks if a string is an OpenAPI $ref
 *
 * @param value - Value to check
 * @returns true if value is a $ref string
 */
export function isRef(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('#/');
}

/**
 * Extracts all schema references from an object
 *
 * @param obj - Object to search for refs
 * @returns Set of schema names
 */
export function extractSchemaRefs(obj: unknown): Set<string> {
  const refs = new Set<string>();

  function traverse(value: unknown): void {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string' && isRef(value)) {
      refs.add(extractSchemaName(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(traverse);
      return;
    }

    if (typeof value === 'object') {
      Object.values(value).forEach(traverse);
    }
  }

  traverse(obj);
  return refs;
}

/**
 * Builds a TypeScript type reference from components path
 *
 * @param schemaName - Schema name
 * @param componentsPath - Path to components type (default: 'components')
 * @returns TypeScript type reference
 *
 * @example
 * ```typescript
 * buildTypeReference('ProductDTO') // "components['schemas']['ProductDTO']"
 * buildTypeReference('ProductDTO', 'api') // "api['schemas']['ProductDTO']"
 * ```
 */
export function buildTypeReference(
  schemaName: string,
  componentsPath: string = 'components'
): string {
  return `${componentsPath}['schemas']['${schemaName}']`;
}

/**
 * Checks if a schema name represents a generic type
 *
 * @param schemaName - Schema name to check
 * @returns true if schema appears to be generic (e.g., Page«ProductDTO»)
 */
export function isGenericType(schemaName: string): boolean {
  return /[<«].*[>»]/.test(schemaName);
}

/**
 * Extracts generic type information from a schema name
 *
 * @param schemaName - Generic schema name (e.g., 'Page«ProductDTO»')
 * @returns Object with wrapper and inner type, or null if not generic
 *
 * @example
 * ```typescript
 * parseGenericType('Page«ProductDTO»') // { wrapper: 'Page', inner: 'ProductDTO' }
 * parseGenericType('List<String>') // { wrapper: 'List', inner: 'String' }
 * parseGenericType('ProductDTO') // null
 * ```
 */
export function parseGenericType(schemaName: string): {
  wrapper: string;
  inner: string;
} | null {
  const match = schemaName.match(/^([^<«]+)[<«]([^>»]+)[>»]$/);
  if (!match) {
    return null;
  }

  return {
    wrapper: match[1].trim(),
    inner: match[2].trim(),
  };
}

/**
 * Converts a generic schema name to TypeScript generic syntax
 *
 * @param schemaName - Schema name (possibly generic)
 * @param componentsPath - Path to components type
 * @returns TypeScript type string
 *
 * @example
 * ```typescript
 * toTypeScriptGeneric('Page«ProductDTO»', 'components')
 * // "Page<components['schemas']['ProductDTO']>"
 * ```
 */
export function toTypeScriptGeneric(
  schemaName: string,
  componentsPath: string = 'components'
): string {
  const generic = parseGenericType(schemaName);
  if (!generic) {
    return buildTypeReference(schemaName, componentsPath);
  }

  const innerType = buildTypeReference(generic.inner, componentsPath);
  return `${generic.wrapper}<${innerType}>`;
}

/**
 * Checks if a type is a primitive TypeScript type
 *
 * @param typeName - Type name to check
 * @returns true if type is primitive
 */
export function isPrimitiveType(typeName: string): boolean {
  const primitives = [
    'string',
    'number',
    'boolean',
    'null',
    'undefined',
    'void',
    'any',
    'unknown',
    'never',
  ];
  return primitives.includes(typeName.toLowerCase());
}

/**
 * Converts OpenAPI type to TypeScript type
 *
 * @param openApiType - OpenAPI type
 * @param format - OpenAPI format
 * @returns TypeScript type
 */
export function openApiTypeToTypeScript(openApiType?: string, format?: string): string {
  if (!openApiType) {
    return 'unknown';
  }

  switch (openApiType.toLowerCase()) {
    case 'integer':
    case 'number':
      return 'number';
    case 'string':
      if (format === 'date' || format === 'date-time') {
        return 'string'; // Can be Date, but keeping as string for API compatibility
      }
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'unknown[]';
    case 'object':
      return 'Record<string, unknown>';
    case 'null':
      return 'null';
    default:
      return 'unknown';
  }
}

/**
 * Sanitizes a schema name to be a valid TypeScript identifier
 *
 * @param schemaName - Schema name to sanitize
 * @returns Valid TypeScript identifier
 */
export function sanitizeSchemaName(schemaName: string): string {
  return schemaName
    .replace(/[<>«»]/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1') // Identifiers can't start with numbers
    .replace(/_+/g, '_'); // Collapse multiple underscores
}

/**
 * Generator Type Definitions
 * Types specific to the code generation process
 */

import type { OpenAPIOperation } from './openapi.types';
import type { RepositoryConfig } from './config.types';

/**
 * Represents a grouped set of operations for a single resource/entity
 */
export interface ResourceGroup {
  /** Resource name in PascalCase (e.g., 'AdminProduct', 'Category', 'User') */
  name: string;

  /** Resource key with dots for file naming (e.g., 'admin.product', 'category') */
  resourceKey: string;

  /** Base API endpoint path (e.g., '/api/v1/product') */
  basePath: string;

  /** Collection of operations for this resource */
  operations: OpenAPIOperation[];

  /** Primary tag from OpenAPI spec */
  tag: string;

  /** Primary entity type for this resource (inferred from responses) */
  primaryEntityType?: string;

  /** Resource configuration for enhancements */
  config?: RepositoryConfig;
}

/**
 * Resource path information extracted from API endpoint
 */
export interface ResourceInfo {
  /** Base path for the resource (e.g., '/api/v1/product') */
  basePath: string;

  /** Resource name in PascalCase (e.g., 'Product', 'AdminProduct') */
  resourceName: string;

  /** Resource key for file naming (e.g., 'product', 'admin.product') */
  resourceKey: string;

  /** Path segments that make up the resource */
  segments: string[];

  /** Whether this is a nested resource (contains dots in key) */
  isNested: boolean;
}

/**
 * Method signature information
 */
export interface MethodSignature {
  /** Parameter list as string (e.g., 'id: number, options?: RequestOptions') */
  params: string;

  /** Return type as string (e.g., 'Promise<Result<ProductDTO>>') */
  returnType: string;

  /** Parameter definitions */
  parameters: MethodParameter[];

  /** Return type details */
  returnTypeInfo: ReturnTypeInfo;
}

/**
 * Method parameter information
 */
export interface MethodParameter {
  /** Parameter name */
  name: string;

  /** Parameter type */
  type: string;

  /** Whether parameter is optional */
  optional: boolean;

  /** Parameter source (path, query, body, header) */
  source: 'path' | 'query' | 'body' | 'header' | 'options';

  /** Original parameter definition from OpenAPI */
  originalName?: string;

  /** Parameter description */
  description?: string;
}

/**
 * Return type information
 */
export interface ReturnTypeInfo {
  /** Base return type (the T in Result<T>) */
  baseType: string;

  /** Whether return type is wrapped in Result */
  isResultWrapped: boolean;

  /** Whether return type is an array */
  isArray: boolean;

  /** Whether return type is a generic type */
  isGeneric: boolean;

  /** Generic wrapper type (e.g., 'Page') */
  genericWrapper?: string;

  /** Generic inner type (e.g., 'ProductDTO') */
  genericInner?: string;

  /** Full TypeScript type string */
  fullType: string;
}

/**
 * Schema usage information
 */
export interface SchemaUsage {
  /** Schema name */
  name: string;

  /** How many times this schema is used in the resource */
  usageCount: number;

  /** Operations that use this schema */
  usedInOperations: string[];

  /** Usage context (request, response, both) */
  context: 'request' | 'response' | 'both';

  /** Whether this is the primary entity type */
  isPrimary: boolean;
}

/**
 * Query parameter type information
 */
export interface QueryParamType {
  /** Type name (e.g., 'GetAllProductsQueryParams') */
  typeName: string;

  /** Operation ID this type belongs to */
  operationId: string;

  /** Parameter definitions */
  parameters: QueryParameter[];

  /** Whether all parameters are optional */
  allOptional: boolean;
}

/**
 * Query parameter definition
 */
export interface QueryParameter {
  /** Parameter name */
  name: string;

  /** Parameter type */
  type: string;

  /** Whether parameter is optional */
  optional: boolean;

  /** Parameter description */
  description?: string;

  /** Default value */
  defaultValue?: unknown;

  /** Enum values if applicable */
  enumValues?: string[];
}

/**
 * Import statement information
 */
export interface ImportStatement {
  /** Module path to import from */
  from: string;

  /** Named imports */
  namedImports: string[];

  /** Default import */
  defaultImport?: string;

  /** Namespace import (import * as) */
  namespaceImport?: string;

  /** Whether this is a type-only import */
  typeOnly: boolean;
}

/**
 * Type alias information
 */
export interface TypeAlias {
  /** Alias name */
  name: string;

  /** Type definition */
  type: string;

  /** JSDoc comment */
  jsdoc?: string;

  /** Whether this is exported */
  exported: boolean;
}

/**
 * Code block information
 */
export interface CodeBlock {
  /** Code block type */
  type: 'import' | 'type' | 'interface' | 'class' | 'function' | 'export';

  /** Code content */
  content: string;

  /** JSDoc comment */
  jsdoc?: string;

  /** Dependencies (other code blocks this depends on) */
  dependencies?: string[];
}

/**
 * Generated repository information
 */
export interface GeneratedRepository {
  /** Resource name */
  resourceName: string;

  /** Resource key */
  resourceKey: string;

  /** File name */
  fileName: string;

  /** File path */
  filePath: string;

  /** File content */
  content: string;

  /** Class name */
  className: string;

  /** Interface name */
  interfaceName: string;

  /** Imported types */
  importedTypes: string[];

  /** Generated methods */
  methods: GeneratedMethod[];

  /** Type aliases */
  typeAliases: TypeAlias[];
}

/**
 * Generated method information
 */
export interface GeneratedMethod {
  /** Method name */
  name: string;

  /** Method signature */
  signature: MethodSignature;

  /** Method implementation */
  implementation: string;

  /** JSDoc comment */
  jsdoc?: string;

  /** HTTP method */
  httpMethod: string;

  /** Endpoint path */
  endpoint: string;

  /** Operation ID */
  operationId: string;
}

/**
 * Generation context
 * Shared state during code generation
 */
export interface GenerationContext {
  /** Current resource being generated */
  currentResource?: ResourceGroup;

  /** All resources being generated */
  allResources: ResourceGroup[];

  /** Used schema types */
  usedSchemas: Set<string>;

  /** Generated type aliases */
  typeAliases: Map<string, TypeAlias>;

  /** Import statements */
  imports: ImportStatement[];

  /** Configuration */
  config: any;

  /** OpenAPI spec */
  spec: any;
}

/**
 * Template data
 * Data passed to code generation templates
 */
export interface TemplateData {
  /** Resource information */
  resource: ResourceGroup;

  /** Imports */
  imports: string;

  /** Type aliases */
  typeAliases: string;

  /** Interface definition */
  interface: string;

  /** Class definition */
  class: string;

  /** Additional exports */
  exports?: string;

  /** File header comment */
  header?: string;

  /** Footer comment */
  footer?: string;
}

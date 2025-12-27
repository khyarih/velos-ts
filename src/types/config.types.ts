/**
 * Configuration Type Definitions
 * Types related to generator configuration
 */

/**
 * Configuration for the repository generator
 */
export interface GeneratorConfig {
  /** Path to the OpenAPI specification file (JSON or YAML) */
  openApiSpecPath: string;

  /** Output directory for generated repositories */
  outputDir: string;

  /** Path to the TypeScript types generated from OpenAPI spec */
  apiSpecTypesPath: string;

  /** Whether to overwrite existing files */
  overwrite: boolean;

  /** Whether to use enhanced features (adapters, mappings, convenience methods) */
  useEnhancements: boolean;

  /** Endpoint patterns to include (whitelist) */
  includePatterns?: string[];

  /** Endpoint patterns to exclude (blacklist) */
  excludePatterns?: string[];

  /** Whether to generate TypeScript interfaces */
  generateInterfaces?: boolean;

  /** Whether to generate type aliases */
  generateTypeAliases?: boolean;

  /** Whether to generate JSDoc comments */
  generateJSDocs?: boolean;

  /** Custom naming strategy */
  namingStrategy?: NamingStrategy;

  /** Resource grouping configuration */
  resourceGrouping?: ResourceGroupingConfig;

  /** Custom template directory */
  templateDir?: string;

  /** Hooks for pre/post generation */
  hooks?: GeneratorHooks;
}

/**
 * Naming strategy configuration
 */
export interface NamingStrategy {
  /** Repository class name pattern (default: '{Resource}Repository') */
  repositoryClass?: string;

  /** Repository interface name pattern (default: 'I{Resource}Repository') */
  repositoryInterface?: string;

  /** Repository file name pattern (default: '{resource}.repository.ts') */
  repositoryFile?: string;

  /** Method naming convention (camelCase, snake_case, etc.) */
  methodNaming?: 'camelCase' | 'snake_case' | 'kebab-case';

  /** Type alias naming pattern (default: same as schema name) */
  typeAlias?: string;
}

/**
 * Resource grouping configuration
 */
export interface ResourceGroupingConfig {
  /**
   * Number of path segments to use for resource grouping (after /api/vX/)
   * Default: 1
   */
  depth?: number;

  /**
   * Grouping strategy:
   * - 'root': Always use only the first segment for maximum grouping
   * - 'full': Creates separate repositories for all path segments
   * - 'auto': Auto-detect based on path parameters (sub-resources grouped with root)
   * Default: 'auto'
   */
  strategy?: 'root' | 'full' | 'auto';
}

/**
 * Generator hooks for custom processing
 */
export interface GeneratorHooks {
  /** Hook called before generation starts */
  beforeGenerate?: (config: GeneratorConfig) => void | Promise<void>;

  /** Hook called after generation completes */
  afterGenerate?: (files: GeneratedFile[]) => void | Promise<void>;

  /** Hook called for each generated file */
  onFileGenerated?: (file: GeneratedFile) => void | Promise<void>;

  /** Hook called when an error occurs */
  onError?: (error: Error) => void | Promise<void>;
}

/**
 * Information about a generated file
 */
export interface GeneratedFile {
  /** File path (absolute) */
  path: string;

  /** File content */
  content: string;

  /** Resource name this file belongs to */
  resource: string;

  /** File type */
  type: 'repository' | 'interface' | 'index' | 'types';
}

/**
 * Repository configuration for a specific resource
 */
export interface RepositoryConfig {
  /** Resource identifier */
  resource: string;

  /** Custom base path override */
  basePath?: string;

  /** Custom endpoint patterns for this resource */
  patterns?: string[];

  /** Whether to enable enhanced features for this resource */
  enhanced?: boolean;

  /** Custom methods to add to this repository */
  customMethods?: CustomMethod[];
}

/**
 * Custom method definition
 */
export interface CustomMethod {
  /** Method name */
  name: string;

  /** Method parameters */
  parameters: MethodParameter[];

  /** Return type */
  returnType: string;

  /** Method implementation */
  implementation: string;

  /** JSDoc comment */
  jsdoc?: string;
}

/**
 * Method parameter definition
 */
export interface MethodParameter {
  /** Parameter name */
  name: string;

  /** Parameter type */
  type: string;

  /** Whether parameter is optional */
  optional?: boolean;

  /** Default value */
  defaultValue?: string;
}

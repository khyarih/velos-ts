/**
 * Configuration Loader
 * Loads and merges configuration from files and defaults
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import * as yaml from 'js-yaml';
import type { GeneratorConfig } from '../types/config.types';
import { validateConfig, safeValidateConfig, getValidationErrors } from './config-schema';

/**
 * Configuration file names to search for (in order of priority)
 */
const CONFIG_FILE_NAMES = [
  'velos.config.yaml',
  'velos.config.yml',
  '.velos.yaml',
  '.velos.yml',
  'velos.yaml',
  'velos.yml',
];

/**
 * Configuration loading error
 */
export class ConfigLoadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ConfigLoadError';
  }
}

/**
 * Loads configuration from a YAML file
 *
 * @param configPath - Path to configuration file
 * @returns Parsed configuration
 * @throws ConfigLoadError if loading fails
 */
export function loadConfigFromFile(configPath: string): GeneratorConfig {
  const resolvedPath = resolve(configPath);

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    throw new ConfigLoadError(`Configuration file not found: ${resolvedPath}`, 'CONFIG_NOT_FOUND');
  }

  // Read file
  let content: string;
  try {
    content = readFileSync(resolvedPath, 'utf-8');
  } catch (error) {
    throw new ConfigLoadError(
      `Failed to read configuration file: ${resolvedPath}`,
      'CONFIG_READ_ERROR',
      error
    );
  }

  // Parse YAML
  let config: unknown;
  try {
    config = yaml.load(content);
  } catch (error) {
    throw new ConfigLoadError(
      `Failed to parse YAML configuration: ${resolvedPath}`,
      'CONFIG_PARSE_ERROR',
      error
    );
  }

  // Validate configuration
  const validation = safeValidateConfig(config);
  if (!validation.success) {
    const validationError = validation.error;
    const errors = validationError
      ? getValidationErrors(validationError)
      : ['Unknown validation error'];
    throw new ConfigLoadError(
      `Invalid configuration:\n${errors.join('\n')}`,
      'CONFIG_VALIDATION_ERROR',
      validationError
    );
  }

  return validation.data as GeneratorConfig;
}

/**
 * Searches for a configuration file in the current directory and parent directories
 *
 * @param startDir - Directory to start searching from (defaults to cwd)
 * @returns Path to configuration file or undefined if not found
 */
export function findConfigFile(startDir: string = process.cwd()): string | undefined {
  let currentDir = resolve(startDir);
  const root = resolve('/');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Check each config file name
    for (const fileName of CONFIG_FILE_NAMES) {
      const configPath = resolve(currentDir, fileName);
      if (existsSync(configPath)) {
        return configPath;
      }
    }

    // Move to parent directory
    const parentDir = dirname(currentDir);

    // Stop if we've reached the root
    if (currentDir === root || parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return undefined;
}

/**
 * Loads configuration, searching for config file if not specified
 *
 * @param configPath - Optional path to configuration file
 * @returns Loaded configuration
 * @throws ConfigLoadError if config file specified but not found or invalid
 */
export function loadConfig(configPath?: string): GeneratorConfig | undefined {
  // If config path specified, load from that file
  if (configPath) {
    return loadConfigFromFile(configPath);
  }

  // Search for config file
  const foundConfigPath = findConfigFile();

  // If no config file found, return undefined (will use defaults)
  if (!foundConfigPath) {
    return undefined;
  }

  // Load from found config file
  return loadConfigFromFile(foundConfigPath);
}

/**
 * Merges multiple configuration objects with priority (later overrides earlier)
 *
 * @param configs - Configuration objects to merge
 * @returns Merged configuration
 */
export function mergeConfigs(
  ...configs: Array<Partial<GeneratorConfig> | undefined>
): GeneratorConfig {
  const merged: Partial<GeneratorConfig> = {};

  for (const config of configs) {
    if (!config) continue;

    Object.assign(merged, config);

    // Special handling for arrays - concatenate unique values
    if (config.includePatterns && merged.includePatterns) {
      merged.includePatterns = [...new Set([...merged.includePatterns, ...config.includePatterns])];
    }

    if (config.excludePatterns && merged.excludePatterns) {
      merged.excludePatterns = [...new Set([...merged.excludePatterns, ...config.excludePatterns])];
    }
  }

  // Validate merged config
  return validateConfig(merged) as GeneratorConfig;
}

/**
 * Loads and merges configuration from file, defaults, and overrides
 *
 * @param options - Loading options
 * @returns Final merged configuration
 */
export function loadAndMergeConfig(options: {
  /** Path to config file (optional, will search if not provided) */
  configPath?: string;
  /** Default configuration */
  defaults?: Partial<GeneratorConfig>;
  /** Configuration overrides (e.g., from CLI arguments) */
  overrides?: Partial<GeneratorConfig>;
}): GeneratorConfig {
  const { configPath, defaults, overrides } = options;

  // Load from file (if exists)
  const fileConfig = loadConfig(configPath);

  // Merge: defaults < file config < overrides
  return mergeConfigs(defaults, fileConfig, overrides);
}

/**
 * Creates a sample configuration file
 *
 * @param outputPath - Path to write the configuration file
 */
export function createSampleConfig(outputPath: string = './velos.config.yaml'): void {
  const sampleConfig = `# Repository Generator Configuration
# This file configures how repositories are generated from your OpenAPI specification

# Path to your OpenAPI specification file (JSON or YAML)
openApiSpecPath: ./api-docs.json

# Output directory for generated repositories
outputDir: ./src/generated/repositories

# Path to your openapi-typescript generated types
# This should match the path used in your openapi-typescript command
apiSpecTypesPath: '@/api/api-spec'

# Whether to overwrite existing repository files
overwrite: true

# Whether to use enhanced features (adapters, convenience methods)
useEnhancements: true

# Endpoint patterns to include (whitelist)
# Only endpoints matching these patterns will be generated
# Supports wildcards: * (single segment), ** (multiple segments)
includePatterns:
  - /api/v1/product**
  - /api/v1/category**
  - /api/v1/order**
  - /api/auth**

# Endpoint patterns to exclude (blacklist)
# Endpoints matching these patterns will be skipped
excludePatterns:
  - /api/v1/admin/**
  - /api/v1/internal/**
  - /api/v1/test/**

# Whether to generate TypeScript interfaces for repositories
generateInterfaces: true

# Whether to generate type aliases for cleaner imports
generateTypeAliases: true

# Whether to generate JSDoc comments in the output
generateJSDocs: true

# Naming strategy (optional)
# namingStrategy:
#   repositoryClass: '{Resource}Repository'
#   repositoryInterface: 'I{Resource}Repository'
#   repositoryFile: '{resource}.repository.ts'
#   methodNaming: camelCase

# Custom template directory (optional)
# templateDir: ./templates
`;

  const resolvedPath = resolve(outputPath);
  const dir = dirname(resolvedPath);

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Write file
  writeFileSync(resolvedPath, sampleConfig, 'utf-8');

  console.log(`✅ Created sample configuration file: ${resolvedPath}`);
}

/**
 * Prints configuration to console for debugging
 *
 * @param config - Configuration to print
 */
export function printConfig(config: GeneratorConfig): void {
  console.log('Configuration:');
  console.log('==============');
  console.log(`  OpenAPI Spec: ${config.openApiSpecPath}`);
  console.log(`  Output Dir: ${config.outputDir}`);
  console.log(`  API Spec Types: ${config.apiSpecTypesPath}`);
  console.log(`  Overwrite: ${config.overwrite}`);
  console.log(`  Use Enhancements: ${config.useEnhancements}`);

  if (config.includePatterns && config.includePatterns.length > 0) {
    console.log(`  Include Patterns:`);
    config.includePatterns.forEach((p) => console.log(`    - ${p}`));
  }

  if (config.excludePatterns && config.excludePatterns.length > 0) {
    console.log(`  Exclude Patterns:`);
    config.excludePatterns.forEach((p) => console.log(`    - ${p}`));
  }

  console.log('');
}

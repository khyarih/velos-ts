/**
 * Default Configuration
 * Default values for generator configuration
 */

import type { GeneratorConfig } from '../types/config.types';

/**
 * Default configuration for the generator
 * These values are used when no configuration file is provided
 */
export const defaultConfig: Partial<GeneratorConfig> = {
  openApiSpecPath: './api-docs.json',
  outputDir: './src/generated/repositories',
  apiSpecTypesPath: '@/api/api-spec',
  overwrite: true,
  useEnhancements: true,
  generateInterfaces: true,
  generateTypeAliases: true,
  generateJSDocs: true,
  includePatterns: undefined, // Include all by default
  excludePatterns: undefined, // Exclude none by default
  namingStrategy: {
    repositoryClass: '{Resource}Repository',
    repositoryInterface: 'I{Resource}Repository',
    repositoryFile: '{resource}.repository.ts',
    methodNaming: 'camelCase',
  },
};

/**
 * Minimal required configuration fields
 * These must be provided either in config file or as overrides
 */
export const requiredConfigFields = ['openApiSpecPath', 'outputDir', 'apiSpecTypesPath'] as const;

/**
 * Gets the default configuration
 * Returns a fresh copy to avoid mutations
 */
export function getDefaultConfig(): Partial<GeneratorConfig> {
  return { ...defaultConfig };
}

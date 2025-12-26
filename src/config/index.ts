/**
 * Configuration Module
 * Exports configuration loading and validation functionality
 */

// Schema exports
export {
  generatorConfigSchema,
  namingStrategySchema,
  generatorHooksSchema,
  validateConfig,
  safeValidateConfig,
  getValidationErrors,
} from './config-schema';

export type { ValidatedConfig } from './config-schema';

// Loader exports
export {
  loadConfigFromFile,
  findConfigFile,
  loadConfig,
  mergeConfigs,
  loadAndMergeConfig,
  createSampleConfig,
  printConfig,
  ConfigLoadError,
} from './config-loader';

// Re-export config file names for reference
export const CONFIG_FILE_NAMES = [
  'velos.config.yaml',
  'velos.config.yml',
  '.velos.yaml',
  '.velos.yml',
  'velos.yaml',
  'velos.yml',
] as const;

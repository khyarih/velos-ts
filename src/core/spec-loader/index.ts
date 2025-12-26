/**
 * Spec Loader Module
 * Exports specification loading and normalization functionality
 */

// Loader exports
export {
  loadOpenAPISpec,
  loadOpenAPISpecFromString,
  getSpecInfo,
  isValidOpenAPISpec,
  SpecLoaderError,
} from './loader';

export type { SpecFormat, SpecLoaderOptions } from './loader';

// Normalizer exports
export {
  normalizeSpec,
  generateOperationId,
  extractOperations,
  filterOperationsByTag,
  filterOperationsByPath,
  groupOperationsByTag,
  groupOperationsByBasePath,
  extractBasePath,
  getUniqueTags,
  getSpecStatistics,
} from './normalizer';

export type { NormalizedOperation } from './normalizer';

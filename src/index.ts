/**
 * Repository Generator (Velos)
 * Main entry point for the package
 */

// Export core runtime (required by generated code)
export * from './core/runtime';

// Export types
export * from './types';

// Export utilities (useful for customization)
export * from './utils';

// Export core generation functionality
export * from './core';

// Export main generation function
export { generateRepositories, generate, generateWithConfig } from './core/generate';
export type { GenerationResult } from './core/generate';

// Export configuration functionality
export * from './config';
export { defaultConfig } from './config/defaults';

// Re-export commonly used items for convenience
export type { ApiClient, RequestOptions, Result, ErrorDetails } from './core/runtime';

export { BaseRepository, FetchApiClient, success, failure, errorToDetails } from './core/runtime';

export type { GeneratorConfig, OpenAPISpec, ResourceGroup } from './types';

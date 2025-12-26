/**
 * Example: Repository Generation
 *
 * This example shows how to use the refactored repository generator.
 * Run with: npx ts-node example.ts
 */

import { generate, createSampleConfig } from './src';

// ==============================================================================
// OPTION 1: Generate with config file (recommended)
// ==============================================================================
// First, create a sample config file if you don't have one:
// createSampleConfig('./velos.config.yaml');

// Then generate using the config file:
const result1 = generate();
// This will search for velos.config.yaml in current and parent directories

// ==============================================================================
// OPTION 2: Generate with specific config file
// ==============================================================================
const result2 = generate({
  configPath: './velos.config.yaml',
});

// ==============================================================================
// OPTION 3: Generate with overrides (merges with config file or defaults)
// ==============================================================================
const result3 = generate({
  overrides: {
    overwrite: true,
    outputDir: './src/custom-output',
  },
});

// ==============================================================================
// OPTION 4: Generate programmatically without config file
// ==============================================================================
const result4 = generate({
  overrides: {
    openApiSpecPath: './api-docs.json',
    outputDir: './src/generated/repositories',
    apiSpecTypesPath: '@/api/api-spec',
    overwrite: true,
    includePatterns: [
      '/api/v1/product**',
      '/api/v1/category**',
      '/api/v1/order**',
    ],
    excludePatterns: [
      '/api/v1/admin/**',
      '/api/v1/internal/**',
    ],
    useEnhancements: true,
  },
});

// ==============================================================================
// Display results
// ==============================================================================
console.log('\n✅ Generation Complete!');
console.log(`📁 Generated ${result4.filesWritten} files`);
console.log(`📦 Created ${result4.repositories.length} repositories`);

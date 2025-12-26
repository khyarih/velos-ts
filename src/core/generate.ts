/**
 * Main Generation Orchestrator
 * Coordinates the entire repository generation process
 */

import type { GeneratorConfig } from '../types/config.types';
import type { GeneratedRepository } from '../types/generator.types';
import { loadOpenAPISpec } from './spec-loader/loader';
import { normalizeSpec } from './spec-loader/normalizer';
import { extractResourceGroups } from './extractor/resource-extractor';
import { generateAllRepositories } from './generator/repository-generator';
import { generateIndexFile, generateReadme, generateSummary } from './generator/index-generator';
import { writeFileSync, ensureDirectorySync } from '../utils/file-utils';
import { loadAndMergeConfig, printConfig } from '../config/config-loader';
import { defaultConfig as configDefaults } from '../config/defaults';
import * as path from 'path';

/**
 * Generation result
 */
export interface GenerationResult {
  /** Generated repositories */
  repositories: GeneratedRepository[];
  /** Index file content */
  indexFile: string;
  /** README content */
  readme: string;
  /** Summary text */
  summary: string;
  /** Total files written */
  filesWritten: number;
}

/**
 * Generates repositories from OpenAPI specification
 *
 * @param config - Generator configuration
 * @returns Generation result
 *
 * @example
 * ```typescript
 * const result = await generateRepositories({
 *   openApiSpecPath: './api-docs.json',
 *   outputDir: './src/repositories',
 *   apiSpecTypesPath: '@/api/api-spec',
 *   overwrite: true,
 *   useEnhancements: true,
 * });
 *
 * console.log(result.summary);
 * ```
 */
export function generateRepositories(config: GeneratorConfig): GenerationResult {
  console.log('[INFO] Starting repository generation...');
  console.log('[INFO] Configuration:', {
    specPath: config.openApiSpecPath,
    outputDir: config.outputDir,
    overwrite: config.overwrite,
  });
  console.log('');

  // Step 1: Load OpenAPI specification
  console.log('[STEP 1/6] Loading OpenAPI specification...');
  const spec = loadOpenAPISpec(config.openApiSpecPath);
  console.log(`[LOADED] ${spec.info.title} v${spec.info.version}`);
  console.log('');

  // Step 2: Normalize specification
  console.log('[STEP 2/6] Normalizing specification...');
  const normalized = normalizeSpec(spec);
  const allOperations = normalized.operations;
  console.log(`[NORMALIZED] ${allOperations.length} operations found`);
  console.log('');

  // Step 3: Extract resource groups
  console.log('[STEP 3/6] Extracting resource groups...');
  const resources = extractResourceGroups(normalized.spec, {
    includePatterns: config.includePatterns,
    excludePatterns: config.excludePatterns,
    inferPrimaryEntityType: true,
  });
  console.log(`[EXTRACTED] ${resources.length} resources identified`);
  for (const resource of resources) {
    console.log(
      `  - ${resource.name} (${resource.operations.length} operations, base: ${resource.basePath})`
    );
  }
  console.log('');

  // Step 4: Generate repository files
  console.log('[STEP 4/6] Generating repository files...');
  const repositories = generateAllRepositories(resources, config, normalized.spec);
  console.log(`[GENERATED] ${repositories.length} repository files`);
  console.log('');

  // Step 5: Generate index and supporting files
  console.log('[STEP 5/6] Generating index and support files...');
  const indexFile = generateIndexFile(repositories);
  const readme = generateReadme(repositories);
  const summary = generateSummary(repositories);
  console.log('[GENERATED] Index and README files');
  console.log('');

  // Step 6: Write files to disk
  console.log('[STEP 6/6] Writing files to disk...');
  ensureDirectorySync(config.outputDir);

  let filesWritten = 0;

  // Write repository files
  for (const repo of repositories) {
    const filePath = path.join(config.outputDir, repo.fileName);

    if (!config.overwrite && fileExistsSync(filePath)) {
      console.log(`[SKIP] ${repo.fileName} (already exists)`);
      continue;
    }

    writeFileSync(filePath, repo.content);
    console.log(`[WRITE] ${repo.fileName}`);
    filesWritten++;
  }

  // Write index file
  const indexPath = path.join(config.outputDir, 'index.ts');
  writeFileSync(indexPath, indexFile);
  console.log('[WRITE] index.ts');
  filesWritten++;

  // Write README
  const readmePath = path.join(config.outputDir, 'README.md');
  writeFileSync(readmePath, readme);
  console.log('[WRITE] README.md');
  filesWritten++;

  console.log('');
  console.log('[SUCCESS] Generation complete!');
  console.log('');
  console.log(summary);

  return {
    repositories,
    indexFile,
    readme,
    summary,
    filesWritten,
  };
}

/**
 * Checks if a file exists synchronously
 * Helper to avoid importing from file-utils
 */
function fileExistsSync(filePath: string): boolean {
  try {
    const fs = require('fs');
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Generates repositories with configuration loaded from file or defaults
 *
 * @param options - Generation options
 * @returns Generation result
 *
 * @example
 * ```typescript
 * // Load from config file (searches for velos.config.yaml)
 * const result = generate();
 *
 * // Load from specific config file
 * const result = generate({ configPath: './my-config.yaml' });
 *
 * // Override specific options
 * const result = generate({
 *   overrides: { overwrite: true }
 * });
 * ```
 */
export function generate(
  options: {
    /** Path to configuration file (optional, will search if not provided) */
    configPath?: string;
    /** Configuration overrides */
    overrides?: Partial<GeneratorConfig>;
  } = {}
): GenerationResult {
  const { configPath, overrides } = options;

  // Load and merge configuration
  const config = loadAndMergeConfig({
    configPath,
    defaults: configDefaults,
    overrides,
  });

  // Print configuration for visibility
  printConfig(config);

  return generateRepositories(config);
}

/**
 * Generates repositories with direct configuration object
 * Use this when you want to programmatically provide full configuration
 *
 * @param config - Complete configuration object
 * @returns Generation result
 */
export function generateWithConfig(config: GeneratorConfig): GenerationResult {
  printConfig(config);
  return generateRepositories(config);
}

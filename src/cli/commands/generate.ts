/**
 * Generate Command
 * Generates repositories from OpenAPI specification
 */

import { Command } from 'commander';
import { generate } from '../../core/generate';
import { Logger } from '../utils/logger';
import { handleError } from '../utils/errors';
import { createSpinner } from '../utils/spinner';
import type { GeneratorConfig } from '../../types/config.types';

/**
 * Creates the generate command
 */
export function createGenerateCommand(): Command {
  const command = new Command('generate');

  command
    .description('Generate repositories from OpenAPI specification')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('-s, --spec <path>', 'Path to OpenAPI specification file')
    .option('-o, --output <dir>', 'Output directory for generated files')
    .option('-t, --types <path>', 'Import path for openapi-typescript types')
    .option('--overwrite', 'Overwrite existing files')
    .option('--no-overwrite', 'Do not overwrite existing files')
    .option('--include <patterns...>', 'Endpoint patterns to include')
    .option('--exclude <patterns...>', 'Endpoint patterns to exclude')
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--verbose', 'Show detailed logging', false)
    .action((options: unknown) => {
      try {
        runGenerate(
          options as {
            config?: string;
            spec?: string;
            output?: string;
            types?: string;
            overwrite?: boolean;
            include?: string[];
            exclude?: string[];
            dryRun: boolean;
            verbose: boolean;
          }
        );
      } catch (error) {
        handleError(error);
      }
    });

  return command;
}

/**
 * Runs the generate command
 */
function runGenerate(options: {
  config?: string;
  spec?: string;
  output?: string;
  types?: string;
  overwrite?: boolean;
  include?: string[];
  exclude?: string[];
  dryRun: boolean;
  verbose: boolean;
}): void {
  const { config, spec, output, types, overwrite, include, exclude, dryRun, verbose } = options;

  Logger.heading('Repository Generator');
  Logger.line();

  // Build overrides from CLI arguments
  const configOverrides: Partial<GeneratorConfig> = {};

  if (spec) configOverrides.openApiSpecPath = spec;
  if (output) configOverrides.outputDir = output;
  if (types) configOverrides.apiSpecTypesPath = types;
  if (overwrite !== undefined) configOverrides.overwrite = overwrite;
  if (include) configOverrides.includePatterns = include;
  if (exclude) configOverrides.excludePatterns = exclude;

  // Show dry run notice
  if (dryRun) {
    Logger.warn('DRY RUN MODE - No files will be written');
    Logger.line();
  }

  // Create spinner for loading
  const spinner = createSpinner('Loading configuration...');

  if (!verbose) {
    spinner.start();
  }

  try {
    // Generate repositories
    const result = generate({
      configPath: config,
      overrides: configOverrides,
    });

    if (!verbose) {
      spinner.stop();
    }

    // Display results
    Logger.line();
    Logger.success('Generation Complete!');
    Logger.line();

    // Show statistics
    Logger.subheading('Summary');
    Logger.line();
    Logger.table([
      ['Repositories Generated', result.repositories.length],
      ['Total Methods', result.repositories.reduce((sum, r) => sum + r.methods.length, 0)],
      ['Files Written', dryRun ? 0 : result.filesWritten],
    ]);

    // Show generated repositories
    Logger.line();
    Logger.subheading('Generated Repositories');
    Logger.line();
    result.repositories.forEach((repo) => {
      Logger.log(`  ${Logger.constructor.name === 'Logger' ? '•' : ''} ${repo.className}`);
      Logger.log(`    ${repo.methods.length} methods, ${repo.fileName}`);
    });

    Logger.line();

    // Show next steps
    if (!dryRun) {
      Logger.subheading('Next Steps');
      Logger.line();
      Logger.log('1. Import the generated repositories in your code:');
      Logger.log(
        `   import { ${result.repositories[0]?.className} } from '${configOverrides.outputDir || './repositories'}';`
      );
      Logger.line();
      Logger.log('2. Create an API client instance:');
      Logger.log(`   import { FetchApiClient } from 'velos-ts/runtime';`);
      Logger.log(
        `   const apiClient = new FetchApiClient({ baseUrl: 'https://api.example.com' });`
      );
      Logger.line();
      Logger.log('3. Use the repositories:');
      Logger.log(`   const repo = new ${result.repositories[0]?.className}(apiClient);`);
      Logger.log(`   const result = await repo.someMethod();`);
      Logger.line();
    }
  } catch (error) {
    if (!verbose) {
      spinner.fail('Generation failed');
    }
    throw error;
  }
}

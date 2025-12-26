/**
 * Init Command
 * Creates a sample configuration file
 */

import { Command } from 'commander';
import { createSampleConfig } from '../../config/config-loader';
import { Logger } from '../utils/logger';
import { handleError } from '../utils/errors';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Creates the init command
 */
export function createInitCommand(): Command {
  const command = new Command('init');

  command
    .description('Create a sample configuration file')
    .option('-o, --output <path>', 'Output path for config file', 'velos.config.yaml')
    .option('-f, --force', 'Overwrite existing config file', false)
    .action((options: unknown) => {
      try {
        runInit(options as { output: string; force: boolean });
      } catch (error) {
        handleError(error);
      }
    });

  return command;
}

/**
 * Runs the init command
 */
function runInit(options: { output: string; force: boolean }): void {
  const { output, force } = options;
  const outputPath = resolve(output);

  Logger.heading('Initialize Configuration');
  Logger.line();

  // Check if file already exists
  if (existsSync(outputPath) && !force) {
    Logger.warn(`Configuration file already exists: ${outputPath}`);
    Logger.info('Use --force to overwrite');
    Logger.line();
    return;
  }

  // Create config file
  Logger.info('Creating configuration file...');

  try {
    createSampleConfig(outputPath);

    Logger.line();
    Logger.success(`Created configuration file: ${outputPath}`);
    Logger.line();

    // Show next steps
    Logger.subheading('Next Steps');
    Logger.line();
    Logger.log('1. Edit the configuration file to match your project:');
    Logger.log(`   ${outputPath}`);
    Logger.line();
    Logger.log('2. Update the paths:');
    Logger.list([
      'openApiSpecPath - Path to your OpenAPI spec file',
      'outputDir - Where to generate repositories',
      'apiSpecTypesPath - Import path for openapi-typescript types',
    ]);
    Logger.line();
    Logger.log('3. Configure endpoint patterns:');
    Logger.list(['includePatterns - Endpoints to generate', 'excludePatterns - Endpoints to skip']);
    Logger.line();
    Logger.log('4. Generate repositories:');
    Logger.log('   npx velos generate');
    Logger.line();
  } catch (error) {
    Logger.line();
    Logger.error('Failed to create configuration file');
    throw error;
  }
}

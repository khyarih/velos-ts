/**
 * CLI Entry Point
 * Main command-line interface for velos-ts
 */

import { Command } from 'commander';
import { createGenerateCommand } from './commands/generate';
import { createInitCommand } from './commands/init';
import { Logger } from './utils/logger';

/**
 * Package version (will be replaced during build)
 */
const VERSION = '1.0.0';

/**
 * Creates and configures the CLI program
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('velos')
    .description('Generate type-safe TypeScript repositories from OpenAPI specifications')
    .version(VERSION, '-v, --version', 'Output the current version')
    .helpOption('-h, --help', 'Display help for command');

  // Add commands
  program.addCommand(createGenerateCommand());
  program.addCommand(createInitCommand());

  // Default command (generate)
  program.argument('[command]', 'Command to run (generate, init)', 'generate').action((command) => {
    if (command === 'generate') {
      // Run generate command by default
      const generateCommand = program.commands.find((cmd) => cmd.name() === 'generate');
      void generateCommand?.parseAsync(process.argv.slice(2));
    } else {
      program.outputHelp();
    }
  });

  // Custom help
  program.on('--help', () => {
    Logger.line();
    Logger.log('Examples:');
    Logger.line();
    Logger.log('  # Initialize a new configuration file');
    Logger.log('  $ velos init');
    Logger.line();
    Logger.log('  # Generate repositories using config file');
    Logger.log('  $ velos generate');
    Logger.line();
    Logger.log('  # Generate with custom config file');
    Logger.log('  $ velos generate --config ./my-config.yaml');
    Logger.line();
    Logger.log('  # Generate with CLI options');
    Logger.log('  $ velos generate --spec ./api-docs.json --output ./src/repos');
    Logger.line();
    Logger.log('  # Dry run to see what would be generated');
    Logger.log('  $ velos generate --dry-run');
    Logger.line();
    Logger.log('Documentation:');
    Logger.log('  https://github.com/khyarih/velos-ts#readme');
    Logger.line();
  });

  return program;
}

/**
 * Runs the CLI program
 */
export async function run(argv: string[] = process.argv): Promise<void> {
  const program = createProgram();

  try {
    await program.parseAsync(argv);
  } catch (error) {
    // Error handling is done in individual commands
    // This catch prevents unhandled promise rejections
  }
}

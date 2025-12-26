/**
 * Error Handling Utilities
 * Provides consistent error handling for CLI
 */

import { Logger } from './logger';
import { ConfigLoadError } from '../../config/config-loader';
import { SpecLoaderError } from '../../core/spec-loader/loader';
import { ZodError } from 'zod';
import { getValidationErrors } from '../../config/config-schema';

/**
 * Handles errors in CLI context
 * Formats and displays error messages appropriately
 *
 * @param error - The error to handle
 * @param exitProcess - Whether to exit the process (default: true)
 */
export function handleError(error: unknown, exitProcess: boolean = true): void {
  Logger.line();

  if (error instanceof ConfigLoadError) {
    handleConfigError(error);
  } else if (error instanceof SpecLoaderError) {
    handleSpecLoaderError(error);
  } else if (error instanceof ZodError) {
    handleValidationError(error);
  } else if (error instanceof Error) {
    handleGenericError(error);
  } else {
    handleUnknownError(error);
  }

  Logger.line();

  if (exitProcess) {
    process.exit(1);
  }
}

/**
 * Handles configuration loading errors
 */
function handleConfigError(error: ConfigLoadError): void {
  Logger.error('Configuration Error');
  Logger.log(`  ${error.message}`);

  if (error.code === 'CONFIG_NOT_FOUND') {
    Logger.line();
    Logger.info('Create a configuration file with:');
    Logger.log('  npx velos init');
  } else if (error.code === 'CONFIG_VALIDATION_ERROR') {
    Logger.line();
    Logger.info('Check your configuration file for the errors listed above.');
    Logger.info('See example: velos.config.example.yaml');
  }
}

/**
 * Handles OpenAPI spec loading errors
 */
function handleSpecLoaderError(error: SpecLoaderError): void {
  Logger.error('OpenAPI Specification Error');
  Logger.log(`  ${error.message}`);

  if (error.code === 'FILE_READ_ERROR') {
    Logger.line();
    Logger.info('Make sure the OpenAPI spec file exists and is readable.');
    Logger.info('Check the "openApiSpecPath" in your configuration.');
  } else if (error.code === 'PARSE_ERROR') {
    Logger.line();
    Logger.info('The OpenAPI spec file contains invalid JSON or YAML.');
    Logger.info('Validate your spec at: https://editor.swagger.io/');
  } else if (error.code === 'INVALID_SPEC_TYPE' || error.code.startsWith('MISSING_')) {
    Logger.line();
    Logger.info('The file is not a valid OpenAPI 3.x specification.');
    Logger.info('Required fields: openapi, info, paths');
  }
}

/**
 * Handles Zod validation errors
 */
function handleValidationError(error: ZodError): void {
  Logger.error('Validation Error');

  const errors = getValidationErrors(error);
  Logger.line();
  errors.forEach((err) => {
    Logger.log(`  • ${err}`);
  });
}

/**
 * Handles generic errors
 */
function handleGenericError(error: Error): void {
  Logger.error(`Error: ${error.message}`);

  if (error.stack && process.env.DEBUG) {
    Logger.line();
    Logger.log(error.stack);
  }
}

/**
 * Handles unknown errors
 */
function handleUnknownError(error: unknown): void {
  Logger.error('An unknown error occurred');
  Logger.log(`  ${String(error)}`);
}

/**
 * Wraps an async function with error handling
 *
 * @param fn - Async function to wrap
 * @returns Wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error);
    }
  }) as T;
}

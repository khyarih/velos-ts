/**
 * OpenAPI Specification Loader
 * Loads, parses, and validates OpenAPI specifications
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { OpenAPISpec } from '../../types/openapi.types';

/**
 * Supported specification file formats
 */
export type SpecFormat = 'json' | 'yaml' | 'auto';

/**
 * Spec loader options
 */
export interface SpecLoaderOptions {
  /** File format (auto-detects if not specified) */
  format?: SpecFormat;
  /** Whether to validate the spec structure */
  validate?: boolean;
  /** Base path for resolving relative paths */
  basePath?: string;
}

/**
 * Spec loader error
 */
export class SpecLoaderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'SpecLoaderError';
  }
}

/**
 * Loads an OpenAPI specification from a file
 *
 * @param specPath - Path to the OpenAPI specification file
 * @param options - Loader options
 * @returns Parsed OpenAPI specification
 * @throws SpecLoaderError if loading or parsing fails
 *
 * @example
 * ```typescript
 * const spec = loadOpenAPISpec('./api-docs.json');
 * console.log(spec.info.title);
 * ```
 */
export function loadOpenAPISpec(specPath: string, options: SpecLoaderOptions = {}): OpenAPISpec {
  const { format = 'auto', validate = true, basePath } = options;

  // Resolve path
  const resolvedPath = basePath ? resolve(basePath, specPath) : resolve(specPath);

  // Determine format
  const detectedFormat = format === 'auto' ? detectFormat(resolvedPath) : format;

  // Read file
  let content: string;
  try {
    content = readFileSync(resolvedPath, 'utf-8');
  } catch (error) {
    throw new SpecLoaderError(
      `Failed to read spec file: ${resolvedPath}`,
      'FILE_READ_ERROR',
      error
    );
  }

  // Parse content
  let spec: unknown;
  try {
    spec = parseContent(content, detectedFormat);
  } catch (error) {
    throw new SpecLoaderError(`Failed to parse spec file: ${resolvedPath}`, 'PARSE_ERROR', error);
  }

  // Validate structure
  if (validate) {
    validateSpec(spec, resolvedPath);
  }

  return spec as OpenAPISpec;
}

/**
 * Loads an OpenAPI specification from a string
 *
 * @param content - OpenAPI specification content
 * @param format - Content format
 * @param options - Loader options
 * @returns Parsed OpenAPI specification
 * @throws SpecLoaderError if parsing fails
 */
export function loadOpenAPISpecFromString(
  content: string,
  format: 'json' | 'yaml' = 'json',
  options: Pick<SpecLoaderOptions, 'validate'> = {}
): OpenAPISpec {
  const { validate = true } = options;

  let spec: unknown;
  try {
    spec = parseContent(content, format);
  } catch (error) {
    throw new SpecLoaderError('Failed to parse spec content', 'PARSE_ERROR', error);
  }

  if (validate) {
    validateSpec(spec, '<string>');
  }

  return spec as OpenAPISpec;
}

/**
 * Detects the format of a spec file from its extension
 *
 * @param filePath - File path
 * @returns Detected format
 */
function detectFormat(filePath: string): 'json' | 'yaml' {
  const ext = filePath.toLowerCase().split('.').pop();

  switch (ext) {
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      // Default to JSON for unknown extensions
      return 'json';
  }
}

/**
 * Parses spec content based on format
 *
 * @param content - Raw content
 * @param format - Content format
 * @returns Parsed object
 */
function parseContent(content: string, format: 'json' | 'yaml'): unknown {
  if (format === 'json') {
    return parseJSON(content);
  } else {
    return parseYAML(content);
  }
}

/**
 * Parses JSON content
 *
 * @param content - JSON content
 * @returns Parsed object
 */
function parseJSON(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parses YAML content
 *
 * @param content - YAML content
 * @returns Parsed object
 */
function parseYAML(content: string): unknown {
  try {
    const yaml = require('js-yaml');
    return yaml.load(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Validates the basic structure of an OpenAPI specification
 *
 * @param spec - Parsed spec object
 * @param source - Source identifier for error messages
 * @throws SpecLoaderError if validation fails
 */
function validateSpec(spec: unknown, source: string): void {
  // Check if spec is an object
  if (typeof spec !== 'object' || spec === null) {
    throw new SpecLoaderError(
      `Invalid OpenAPI spec: Expected object, got ${typeof spec}`,
      'INVALID_SPEC_TYPE',
      { source }
    );
  }

  const specObj = spec as Record<string, unknown>;

  // Check for openapi version
  if (!('openapi' in specObj)) {
    throw new SpecLoaderError(
      'Invalid OpenAPI spec: Missing "openapi" field',
      'MISSING_OPENAPI_VERSION',
      { source }
    );
  }

  if (typeof specObj.openapi !== 'string') {
    throw new SpecLoaderError(
      'Invalid OpenAPI spec: "openapi" field must be a string',
      'INVALID_OPENAPI_VERSION',
      { source }
    );
  }

  // Validate OpenAPI version (3.x)
  const version = specObj.openapi;
  if (!version.startsWith('3.')) {
    throw new SpecLoaderError(
      `Unsupported OpenAPI version: ${version}. Only OpenAPI 3.x is supported.`,
      'UNSUPPORTED_VERSION',
      { source, version }
    );
  }

  // Check for info object
  if (!('info' in specObj)) {
    throw new SpecLoaderError('Invalid OpenAPI spec: Missing "info" field', 'MISSING_INFO', {
      source,
    });
  }

  if (typeof specObj.info !== 'object' || specObj.info === null) {
    throw new SpecLoaderError(
      'Invalid OpenAPI spec: "info" field must be an object',
      'INVALID_INFO',
      { source }
    );
  }

  const info = specObj.info as Record<string, unknown>;

  // Check required info fields
  if (!('title' in info) || typeof info.title !== 'string') {
    throw new SpecLoaderError(
      'Invalid OpenAPI spec: "info.title" is required and must be a string',
      'MISSING_INFO_TITLE',
      { source }
    );
  }

  if (!('version' in info) || typeof info.version !== 'string') {
    throw new SpecLoaderError(
      'Invalid OpenAPI spec: "info.version" is required and must be a string',
      'MISSING_INFO_VERSION',
      { source }
    );
  }

  // Check for paths object
  if (!('paths' in specObj)) {
    throw new SpecLoaderError('Invalid OpenAPI spec: Missing "paths" field', 'MISSING_PATHS', {
      source,
    });
  }

  if (typeof specObj.paths !== 'object' || specObj.paths === null) {
    throw new SpecLoaderError(
      'Invalid OpenAPI spec: "paths" field must be an object',
      'INVALID_PATHS',
      { source }
    );
  }
}

/**
 * Gets information about an OpenAPI spec without loading the full spec
 *
 * @param specPath - Path to the spec file
 * @returns Basic spec information
 */
export function getSpecInfo(specPath: string): {
  title: string;
  version: string;
  openApiVersion: string;
  pathCount: number;
} {
  const spec = loadOpenAPISpec(specPath);

  return {
    title: spec.info.title,
    version: spec.info.version,
    openApiVersion: spec.openapi,
    pathCount: Object.keys(spec.paths).length,
  };
}

/**
 * Checks if a file appears to be a valid OpenAPI spec
 *
 * @param specPath - Path to check
 * @returns True if the file appears to be a valid OpenAPI spec
 */
export function isValidOpenAPISpec(specPath: string): boolean {
  try {
    loadOpenAPISpec(specPath, { validate: true });
    return true;
  } catch {
    return false;
  }
}

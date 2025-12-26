/**
 * Configuration Schema
 * Defines and validates configuration structure using Zod
 */

import { z } from 'zod';

/**
 * Naming strategy schema
 */
export const namingStrategySchema = z
  .object({
    /** Repository class name pattern (default: '{Resource}Repository') */
    repositoryClass: z.string().optional(),
    /** Repository interface name pattern (default: 'I{Resource}Repository') */
    repositoryInterface: z.string().optional(),
    /** Repository file name pattern (default: '{resource}.repository.ts') */
    repositoryFile: z.string().optional(),
    /** Method naming convention */
    methodNaming: z.enum(['camelCase', 'snake_case', 'kebab-case']).optional(),
    /** Type alias naming pattern */
    typeAlias: z.string().optional(),
  })
  .optional();

/**
 * Generator hooks schema
 */
export const generatorHooksSchema = z
  .object({
    /** Hook called before generation starts */
    beforeGenerate: z.function().optional(),
    /** Hook called after generation completes */
    afterGenerate: z.function().optional(),
    /** Hook called for each generated file */
    onFileGenerated: z.function().optional(),
    /** Hook called when an error occurs */
    onError: z.function().optional(),
  })
  .optional();

/**
 * Main generator configuration schema
 */
export const generatorConfigSchema = z.object({
  /** Path to the OpenAPI specification file (JSON or YAML) */
  openApiSpecPath: z.string().min(1, 'OpenAPI spec path is required'),

  /** Output directory for generated repositories */
  outputDir: z.string().min(1, 'Output directory is required'),

  /** Path to the TypeScript types generated from OpenAPI spec */
  apiSpecTypesPath: z.string().min(1, 'API spec types path is required'),

  /** Whether to overwrite existing files */
  overwrite: z.boolean().default(true),

  /** Whether to use enhanced features */
  useEnhancements: z.boolean().default(true),

  /** Endpoint patterns to include (whitelist) */
  includePatterns: z.array(z.string()).optional(),

  /** Endpoint patterns to exclude (blacklist) */
  excludePatterns: z.array(z.string()).optional(),

  /** Whether to generate TypeScript interfaces */
  generateInterfaces: z.boolean().default(true),

  /** Whether to generate type aliases */
  generateTypeAliases: z.boolean().default(true),

  /** Whether to generate JSDoc comments */
  generateJSDocs: z.boolean().default(true),

  /** Custom naming strategy */
  namingStrategy: namingStrategySchema,

  /** Custom template directory */
  templateDir: z.string().optional(),

  /** Hooks for pre/post generation */
  hooks: generatorHooksSchema,
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ValidatedConfig = z.infer<typeof generatorConfigSchema>;

/**
 * Validates a configuration object
 *
 * @param config - Configuration to validate
 * @returns Validated configuration
 * @throws ZodError if validation fails
 */
export function validateConfig(config: unknown): ValidatedConfig {
  return generatorConfigSchema.parse(config);
}

/**
 * Validates a configuration object and returns result with errors
 *
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function safeValidateConfig(config: unknown): {
  success: boolean;
  data?: ValidatedConfig;
  error?: z.ZodError;
} {
  const result = generatorConfigSchema.safeParse(config);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}

/**
 * Gets user-friendly error messages from Zod validation errors
 *
 * @param error - Zod error
 * @returns Array of error messages
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}

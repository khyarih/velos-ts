/**
 * Type Definitions Module
 * Central export for all type definitions
 */

// Configuration types
export type {
  GeneratorConfig,
  NamingStrategy,
  GeneratorHooks,
  GeneratedFile,
  RepositoryConfig,
  CustomMethod,
  MethodParameter,
} from './config.types';

// OpenAPI types
export type {
  OpenAPISpec,
  OpenAPIInfo,
  OpenAPIServer,
  OpenAPIServerVariable,
  OpenAPIPathItem,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIRequestBody,
  OpenAPIResponse,
  OpenAPIMediaType,
  OpenAPISchema,
  OpenAPIHeader,
  OpenAPIExample,
  OpenAPIEncoding,
  OpenAPIComponents,
  OpenAPISecurityScheme,
  OpenAPIOAuthFlows,
  OpenAPIOAuthFlow,
  OpenAPILink,
  OpenAPITag,
} from './openapi.types';

// Generator types
export type {
  ResourceGroup,
  ResourceInfo,
  MethodSignature,
  MethodParameter as GeneratorMethodParameter,
  ReturnTypeInfo,
  SchemaUsage,
  QueryParamType,
  QueryParameter,
  ImportStatement,
  TypeAlias,
  CodeBlock,
  GeneratedRepository,
  GeneratedMethod,
  GenerationContext,
  TemplateData,
} from './generator.types';

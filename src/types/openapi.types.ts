/**
 * OpenAPI Type Definitions
 * Types representing OpenAPI specification structures
 */

/**
 * Represents an OpenAPI operation (GET, POST, PUT, DELETE, etc.)
 */
export interface OpenAPIOperation {
  /** Unique operation identifier */
  operationId: string;

  /** HTTP method (get, post, put, delete, patch) */
  method: string;

  /** API endpoint path */
  path: string;

  /** Operation summary */
  summary?: string;

  /** Operation description */
  description?: string;

  /** Tags categorizing this operation */
  tags?: string[];

  /** Security requirements for this operation */
  security?: Array<Record<string, string[]>>;

  /** Request parameters */
  parameters?: OpenAPIParameter[];

  /** Request body specification */
  requestBody?: OpenAPIRequestBody;

  /** Response specifications */
  responses?: Record<string, OpenAPIResponse>;

  /** Whether this operation is deprecated */
  deprecated?: boolean;

  /** External documentation */
  externalDocs?: {
    description?: string;
    url: string;
  };
}

/**
 * OpenAPI parameter definition
 */
export interface OpenAPIParameter {
  /** Parameter name */
  name: string;

  /** Parameter location */
  in: 'path' | 'query' | 'header' | 'cookie';

  /** Parameter description */
  description?: string;

  /** Whether parameter is required */
  required?: boolean;

  /** Whether parameter is deprecated */
  deprecated?: boolean;

  /** Parameter schema */
  schema?: OpenAPISchema;

  /** Parameter style */
  style?: string;

  /** Whether to explode arrays/objects */
  explode?: boolean;
}

/**
 * OpenAPI request body definition
 */
export interface OpenAPIRequestBody {
  /** Request body description */
  description?: string;

  /** Content types and their schemas */
  content?: Record<string, OpenAPIMediaType>;

  /** Whether request body is required */
  required?: boolean;
}

/**
 * OpenAPI response definition
 */
export interface OpenAPIResponse {
  /** Response description */
  description?: string;

  /** Response content types and schemas */
  content?: Record<string, OpenAPIMediaType>;

  /** Response headers */
  headers?: Record<string, OpenAPIHeader>;
}

/**
 * OpenAPI media type definition
 */
export interface OpenAPIMediaType {
  /** Media type schema */
  schema?: OpenAPISchema;

  /** Example value */
  example?: unknown;

  /** Multiple examples */
  examples?: Record<string, OpenAPIExample>;

  /** Encoding information */
  encoding?: Record<string, OpenAPIEncoding>;
}

/**
 * OpenAPI schema definition
 */
export interface OpenAPISchema {
  /** Schema reference */
  $ref?: string;

  /** Schema type */
  type?: string;

  /** Schema format */
  format?: string;

  /** Schema title */
  title?: string;

  /** Schema description */
  description?: string;

  /** Default value */
  default?: unknown;

  /** Enum values */
  enum?: unknown[];

  /** Array items schema */
  items?: OpenAPISchema;

  /** Object properties */
  properties?: Record<string, OpenAPISchema>;

  /** Required properties */
  required?: string[];

  /** Additional properties */
  additionalProperties?: boolean | OpenAPISchema;

  /** Nullable */
  nullable?: boolean;

  /** Read-only */
  readOnly?: boolean;

  /** Write-only */
  writeOnly?: boolean;

  /** Deprecated */
  deprecated?: boolean;

  /** AllOf schemas */
  allOf?: OpenAPISchema[];

  /** AnyOf schemas */
  anyOf?: OpenAPISchema[];

  /** OneOf schemas */
  oneOf?: OpenAPISchema[];

  /** Not schema */
  not?: OpenAPISchema;

  /** Minimum value */
  minimum?: number;

  /** Maximum value */
  maximum?: number;

  /** Minimum length */
  minLength?: number;

  /** Maximum length */
  maxLength?: number;

  /** Pattern */
  pattern?: string;

  /** Minimum items */
  minItems?: number;

  /** Maximum items */
  maxItems?: number;

  /** Unique items */
  uniqueItems?: boolean;
}

/**
 * OpenAPI header definition
 */
export interface OpenAPIHeader {
  /** Header description */
  description?: string;

  /** Whether header is required */
  required?: boolean;

  /** Header schema */
  schema?: OpenAPISchema;

  /** Header deprecated */
  deprecated?: boolean;
}

/**
 * OpenAPI example definition
 */
export interface OpenAPIExample {
  /** Example summary */
  summary?: string;

  /** Example description */
  description?: string;

  /** Example value */
  value?: unknown;

  /** External example reference */
  externalValue?: string;
}

/**
 * OpenAPI encoding definition
 */
export interface OpenAPIEncoding {
  /** Content type */
  contentType?: string;

  /** Headers */
  headers?: Record<string, OpenAPIHeader>;

  /** Style */
  style?: string;

  /** Explode */
  explode?: boolean;

  /** Allow reserved */
  allowReserved?: boolean;
}

/**
 * OpenAPI specification root object
 */
export interface OpenAPISpec {
  /** OpenAPI version */
  openapi: string;

  /** API metadata */
  info: OpenAPIInfo;

  /** API servers */
  servers?: OpenAPIServer[];

  /** API paths */
  paths: Record<string, OpenAPIPathItem>;

  /** Reusable components */
  components?: OpenAPIComponents;

  /** Security requirements */
  security?: Array<Record<string, string[]>>;

  /** Tags */
  tags?: OpenAPITag[];

  /** External documentation */
  externalDocs?: {
    description?: string;
    url: string;
  };
}

/**
 * OpenAPI info object
 */
export interface OpenAPIInfo {
  /** API title */
  title: string;

  /** API description */
  description?: string;

  /** API version */
  version: string;

  /** Terms of service */
  termsOfService?: string;

  /** Contact information */
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };

  /** License information */
  license?: {
    name: string;
    url?: string;
  };
}

/**
 * OpenAPI server object
 */
export interface OpenAPIServer {
  /** Server URL */
  url: string;

  /** Server description */
  description?: string;

  /** Server variables */
  variables?: Record<string, OpenAPIServerVariable>;
}

/**
 * OpenAPI server variable
 */
export interface OpenAPIServerVariable {
  /** Enum values */
  enum?: string[];

  /** Default value */
  default: string;

  /** Description */
  description?: string;
}

/**
 * OpenAPI path item object
 */
export interface OpenAPIPathItem {
  /** GET operation */
  get?: OpenAPIOperation;

  /** PUT operation */
  put?: OpenAPIOperation;

  /** POST operation */
  post?: OpenAPIOperation;

  /** DELETE operation */
  delete?: OpenAPIOperation;

  /** OPTIONS operation */
  options?: OpenAPIOperation;

  /** HEAD operation */
  head?: OpenAPIOperation;

  /** PATCH operation */
  patch?: OpenAPIOperation;

  /** TRACE operation */
  trace?: OpenAPIOperation;

  /** Common parameters for all operations */
  parameters?: OpenAPIParameter[];
}

/**
 * OpenAPI components object
 */
export interface OpenAPIComponents {
  /** Reusable schemas */
  schemas?: Record<string, OpenAPISchema>;

  /** Reusable responses */
  responses?: Record<string, OpenAPIResponse>;

  /** Reusable parameters */
  parameters?: Record<string, OpenAPIParameter>;

  /** Reusable examples */
  examples?: Record<string, OpenAPIExample>;

  /** Reusable request bodies */
  requestBodies?: Record<string, OpenAPIRequestBody>;

  /** Reusable headers */
  headers?: Record<string, OpenAPIHeader>;

  /** Security schemes */
  securitySchemes?: Record<string, OpenAPISecurityScheme>;

  /** Links */
  links?: Record<string, OpenAPILink>;

  /** Callbacks */
  callbacks?: Record<string, Record<string, OpenAPIPathItem>>;
}

/**
 * OpenAPI security scheme
 */
export interface OpenAPISecurityScheme {
  /** Security scheme type */
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';

  /** Description */
  description?: string;

  /** API key name (for apiKey type) */
  name?: string;

  /** API key location (for apiKey type) */
  in?: 'query' | 'header' | 'cookie';

  /** HTTP authentication scheme (for http type) */
  scheme?: string;

  /** Bearer format (for http type) */
  bearerFormat?: string;

  /** OAuth2 flows (for oauth2 type) */
  flows?: OpenAPIOAuthFlows;

  /** OpenID Connect URL (for openIdConnect type) */
  openIdConnectUrl?: string;
}

/**
 * OpenAPI OAuth flows
 */
export interface OpenAPIOAuthFlows {
  /** Implicit flow */
  implicit?: OpenAPIOAuthFlow;

  /** Password flow */
  password?: OpenAPIOAuthFlow;

  /** Client credentials flow */
  clientCredentials?: OpenAPIOAuthFlow;

  /** Authorization code flow */
  authorizationCode?: OpenAPIOAuthFlow;
}

/**
 * OpenAPI OAuth flow
 */
export interface OpenAPIOAuthFlow {
  /** Authorization URL */
  authorizationUrl?: string;

  /** Token URL */
  tokenUrl?: string;

  /** Refresh URL */
  refreshUrl?: string;

  /** Scopes */
  scopes: Record<string, string>;
}

/**
 * OpenAPI link
 */
export interface OpenAPILink {
  /** Operation reference */
  operationRef?: string;

  /** Operation ID */
  operationId?: string;

  /** Parameters */
  parameters?: Record<string, unknown>;

  /** Request body */
  requestBody?: unknown;

  /** Description */
  description?: string;

  /** Server */
  server?: OpenAPIServer;
}

/**
 * OpenAPI tag
 */
export interface OpenAPITag {
  /** Tag name */
  name: string;

  /** Tag description */
  description?: string;

  /** External documentation */
  externalDocs?: {
    description?: string;
    url: string;
  };
}

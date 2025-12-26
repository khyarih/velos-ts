# Velos-TS Specification

**Version:** 2.0
**Status:** Refactoring & Enhancement Phase
**Last Updated:** 2025-12-26

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Goals & Objectives](#goals--objectives)
3. [Scope](#scope)
4. [Architecture](#architecture)
5. [Design Principles](#design-principles)
6. [Current Implementation Analysis](#current-implementation-analysis)
7. [Refactoring Plan](#refactoring-plan)
8. [Enhancement Roadmap](#enhancement-roadmap)
9. [Package Structure](#package-structure)
10. [Usage & Integration](#usage--integration)
11. [Testing Strategy](#testing-strategy)
12. [Future Considerations](#future-considerations)

---

## Project Overview

**Velos-TS** (`velos`) is a TypeScript code generation tool built on top of `openapi-typescript` that automatically generates type-safe repository classes from OpenAPI specifications. It eliminates manual API client boilerplate by creating fully-typed, production-ready repository layers with comprehensive error handling.

### Key Value Proposition

- **Zero Manual Type Definitions**: All types derived from OpenAPI spec
- **Type-Safe API Interactions**: Full TypeScript type safety from request to response
- **Consistent Error Handling**: Result pattern for predictable error management
- **Automated Boilerplate**: Generates repositories, interfaces, and type aliases
- **Seamless Integration**: Works as a dev dependency in any TypeScript project

---

## Goals & Objectives

### Primary Goals

1. **Automate API Repository Generation**
   - Generate complete repository layer from OpenAPI spec
   - Eliminate manual API client code writing
   - Reduce human error in API integration

2. **Type Safety at Every Level**
   - Request parameters (path, query, body)
   - Response types
   - Error handling
   - No `any` types in generated code

3. **Production-Ready Code**
   - Clean, readable, maintainable output
   - Follows TypeScript best practices
   - Includes documentation comments
   - Error handling with Result pattern

4. **Developer Experience**
   - Simple CLI interface
   - Configurable generation options
   - Clear error messages
   - Watch mode for development

5. **Package Distribution**
   - Publishable npm package
   - Usable as dev dependency
   - Minimal runtime dependencies
   - Clear versioning and updates

### Secondary Goals

- Support multiple OpenAPI spec versions (3.0, 3.1)
- Customizable code generation templates
- Plugin system for extending functionality
- Integration with popular frameworks (Next.js, Nest.js, etc.)

---

## Scope

### In Scope

#### Core Functionality
- ✅ Parse OpenAPI 3.x specifications (JSON/YAML)
- ✅ Generate TypeScript repository classes
- ✅ Generate repository interfaces
- ✅ Generate type aliases from schemas
- ✅ Generate query parameter types
- ✅ Support all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ✅ Path parameter handling
- ✅ Query parameter handling
- ✅ Request body handling
- ✅ Response type handling
- ✅ Result pattern for error handling

#### Configuration
- ✅ Configurable output directory
- ✅ Endpoint filtering (include/exclude patterns)
- ✅ Custom resource grouping
- ✅ Overwrite protection
- 🔲 Configuration file support (velos.config.ts)
- 🔲 Multiple config profiles

#### Code Generation
- ✅ Repository class generation
- ✅ Repository interface generation
- ✅ Type alias generation
- ✅ Index file generation (barrel exports)
- 🔲 JSDoc documentation generation
- 🔲 Custom template support

#### CLI
- 🔲 Command-line interface
- 🔲 Generate command
- 🔲 Init command (create config)
- 🔲 Watch mode
- 🔲 Dry-run mode
- 🔲 Verbose logging

#### Package Management
- 🔲 NPM package publishing
- 🔲 Versioning strategy
- 🔲 Changelog generation
- 🔲 Documentation site

### Out of Scope (V1)

- GraphQL support
- REST client generation (only repository layer)
- OpenAPI spec validation (assumes valid spec)
- API mocking/stubbing
- Code generation for other languages
- Runtime API client (requires separate library)
- Authentication implementation (delegates to ApiClient)

### Dependencies Required by Generated Code

The generated repositories depend on runtime implementations:
- `ApiClient` interface/class
- `BaseRepository<T>` abstract class
- `Result<T>` type and utility functions
- `RequestOptions` type

**Note:** These are expected to be provided by the consuming project, not included in this package.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   OpenAPI Specification                  │
│                    (JSON/YAML File)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  openapi-typescript                      │
│              (Type Generation Layer)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │   api-spec.ts       │
           │ (Generated Types)   │
           └──────────┬──────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Velos-TS (velos-ts)              │
│  ┌────────────────────────────────────────────────┐    │
│  │  1. Spec Loader                                │    │
│  │  2. Resource Extractor                         │    │
│  │  3. Type Analyzer                              │    │
│  │  4. Code Generator                             │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Generated Repository Files                  │
│  ┌──────────────────────────────────────────────┐      │
│  │  product.repository.ts                       │      │
│  │  category.repository.ts                      │      │
│  │  order.repository.ts                         │      │
│  │  index.ts                                    │      │
│  └──────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Application Layer                           │
│  (Services use generated repositories)                   │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

```
velos-ts/
├── cli/                          # Command-line interface
│   ├── index.ts                  # CLI entry point
│   ├── commands/
│   │   ├── generate.ts           # Generate command
│   │   ├── init.ts               # Init command
│   │   └── watch.ts              # Watch command
│   └── utils/
│       ├── logger.ts             # Logging utilities
│       └── validators.ts         # Input validation
│
├── core/                         # Core generation logic
│   ├── spec-loader/
│   │   ├── loader.ts             # Load OpenAPI spec
│   │   ├── validator.ts          # Basic validation
│   │   └── normalizer.ts         # Normalize spec format
│   │
│   ├── extractor/
│   │   ├── resource-extractor.ts # Group endpoints by resource
│   │   ├── operation-extractor.ts# Extract operation details
│   │   ├── type-extractor.ts     # Extract type information
│   │   └── parameter-extractor.ts# Extract parameters
│   │
│   ├── analyzer/
│   │   ├── resource-analyzer.ts  # Analyze resource patterns
│   │   ├── type-analyzer.ts      # Analyze type usage
│   │   └── dependency-analyzer.ts# Analyze type dependencies
│   │
│   └── generator/
│       ├── repository-generator.ts    # Generate repository files
│       ├── interface-generator.ts     # Generate interfaces
│       ├── type-alias-generator.ts    # Generate type aliases
│       ├── method-generator.ts        # Generate methods
│       ├── import-generator.ts        # Generate imports
│       └── index-generator.ts         # Generate index files
│
├── config/                       # Configuration management
│   ├── config-loader.ts          # Load configuration
│   ├── config-schema.ts          # Configuration schema
│   └── default-config.ts         # Default configuration
│
├── templates/                    # Code generation templates
│   ├── repository.template.ts    # Repository template
│   ├── interface.template.ts     # Interface template
│   └── custom/                   # User custom templates
│
├── utils/                        # Shared utilities
│   ├── string-utils.ts           # String manipulation
│   ├── path-utils.ts             # Path handling
│   ├── file-utils.ts             # File operations
│   └── type-utils.ts             # Type utilities
│
└── types/                        # TypeScript type definitions
    ├── config.types.ts           # Configuration types
    ├── openapi.types.ts          # OpenAPI types
    ├── generator.types.ts        # Generator types
    └── index.ts                  # Type exports
```

### Data Flow

```
1. Configuration Loading
   ├── Load velos.config.ts
   ├── Merge with defaults
   └── Validate configuration

2. Spec Loading & Normalization
   ├── Read OpenAPI spec file (JSON/YAML)
   ├── Parse and validate
   └── Normalize to internal format

3. Resource Extraction
   ├── Parse all paths and operations
   ├── Filter by include/exclude patterns
   ├── Group operations by resource
   └── Identify primary entity types

4. Type Analysis
   ├── Collect all used schemas
   ├── Extract query parameter types
   ├── Analyze type dependencies
   └── Build type usage map

5. Code Generation
   ├── For each resource:
   │   ├── Generate imports
   │   ├── Generate type aliases
   │   ├── Generate query param interfaces
   │   ├── Generate repository interface
   │   └── Generate repository class
   └── Generate index file

6. File Writing
   ├── Create output directory
   ├── Write repository files
   ├── Write index file
   └── Format with prettier (if available)
```

---

## Design Principles

### 1. Convention Over Configuration

**Principle:** Sensible defaults for 80% use cases, configurability for the rest.

**Application:**
- Default output directory: `./src/generated/repositories`
- Default naming conventions: PascalCase for classes, camelCase for methods
- Automatic resource grouping by path patterns
- Override via configuration when needed

### 2. Type Safety First

**Principle:** Generate code that is impossible to use incorrectly.

**Application:**
- All parameters strongly typed
- No `any` types in generated code
- Result pattern prevents uncaught exceptions
- TypeScript strict mode compatible

### 3. Single Source of Truth

**Principle:** OpenAPI spec is the only source of API contract.

**Application:**
- No manual type definitions
- No hardcoded endpoints
- No duplicate API documentation
- Types auto-update when spec changes

### 4. Separation of Concerns

**Principle:** Each module has a single, well-defined responsibility.

**Application:**
- Spec loading separate from parsing
- Extraction separate from generation
- Configuration separate from logic
- Templates separate from generators

### 5. Extensibility

**Principle:** Easy to extend without modifying core code.

**Application:**
- Plugin system for custom generators
- Template override system
- Custom naming strategies
- Pre/post generation hooks

### 6. Developer Experience

**Principle:** Tool should be intuitive and provide helpful feedback.

**Application:**
- Clear error messages with context
- Progress logging during generation
- Dry-run mode to preview changes
- Watch mode for development workflow

### 7. Zero Runtime Overhead

**Principle:** Generated code should be as efficient as hand-written code.

**Application:**
- No reflection or dynamic lookups
- Direct API client calls
- Tree-shakeable exports
- Minimal abstraction layers

---

## Current Implementation Analysis

### Strengths

1. **Comprehensive Type Coverage**
   - Full integration with openapi-typescript
   - Type aliases for cleaner imports
   - Query parameter type generation
   - Proper generic handling (Page<T>)

2. **Result Pattern Implementation**
   - Consistent error handling
   - Type-safe error responses
   - Try-catch wrapping in all methods

3. **Resource Organization**
   - Smart resource grouping by path
   - Support for nested resources (admin.product)
   - Configurable endpoint filtering

4. **Production-Ready Output**
   - Clean, readable code
   - Proper imports and exports
   - Interface/implementation separation

### Weaknesses & Areas for Improvement

1. **Monolithic Structure**
   - Single 1530-line file (generate-repositories.ts)
   - Tight coupling between concerns
   - Difficult to test individual components
   - Hard to extend functionality

2. **Configuration Management**
   - Hardcoded config in script
   - No external config file support
   - Limited customization options
   - No config validation

3. **No CLI**
   - Must be run via ts-node
   - No command-line arguments
   - No interactive mode
   - Poor developer experience

4. **Limited Modularity**
   - Functions not easily reusable
   - No plugin system
   - No template customization
   - Hard to add new features

5. **Error Handling**
   - Basic error messages
   - No validation of OpenAPI spec
   - Silent failures in some cases
   - No debugging mode

6. **Documentation**
   - Limited inline documentation
   - No JSDoc generation
   - No usage examples in output
   - README needs expansion

7. **Testing**
   - No unit tests
   - No integration tests
   - No test fixtures
   - No CI/CD setup

8. **Package Distribution**
   - Not set up as npm package
   - No build process
   - No version management
   - No published artifacts

---

## Refactoring Plan

### Phase 1: Code Organization (Week 1-2)

**Objective:** Break monolithic structure into modular components.

#### Tasks:
1. **Extract Spec Loader Module**
   - Create `core/spec-loader/loader.ts`
   - Move spec loading logic
   - Add validation
   - Add normalization

2. **Extract Resource Extractor Module**
   - Create `core/extractor/resource-extractor.ts`
   - Move resource grouping logic
   - Separate concerns (extraction vs analysis)

3. **Extract Type System Module**
   - Create `core/analyzer/type-analyzer.ts`
   - Move schema collection logic
   - Move query param type logic
   - Add dependency analysis

4. **Extract Code Generators**
   - Create `core/generator/repository-generator.ts`
   - Create `core/generator/interface-generator.ts`
   - Create `core/generator/method-generator.ts`
   - Create `core/generator/import-generator.ts`

5. **Create Shared Types**
   - Move all interfaces to `types/`
   - Create barrel exports
   - Document types with JSDoc

6. **Create Utilities Module**
   - Move string utils to `utils/string-utils.ts`
   - Move path matching to `utils/path-utils.ts`
   - Add file operation utils

**Success Criteria:**
- No file over 300 lines
- Each module has single responsibility
- All modules independently testable
- Type definitions centralized

### Phase 2: Configuration System (Week 2-3)

**Objective:** Implement robust configuration management.

#### Tasks:
1. **Define Configuration Schema**
   - Create `config/config-schema.ts`
   - Use Zod for validation
   - Document all options

2. **Implement Config Loader**
   - Support `velos.config.ts`
   - Support `velos.config.json`
   - Support CLI arguments
   - Merge strategies (CLI > file > defaults)

3. **Create Default Config**
   - Sensible defaults
   - Well-documented
   - Easy to override

4. **Add Config Validation**
   - Validate on load
   - Helpful error messages
   - Type-safe config access

**Configuration Options:**
```typescript
interface velosConfig {
  // Input
  openApiSpec: string;                    // Path to OpenAPI spec

  // Output
  outputDir: string;                      // Output directory
  apiSpecTypesPath: string;               // Path to api-spec types

  // Generation Options
  overwrite: boolean;                     // Overwrite existing files
  generateInterfaces: boolean;            // Generate interfaces
  generateTypeAliases: boolean;           // Generate type aliases
  generateJSDocs: boolean;                // Generate JSDoc comments

  // Filtering
  includePatterns: string[];              // Endpoint patterns to include
  excludePatterns: string[];              // Endpoint patterns to exclude

  // Naming
  namingStrategy: 'default' | 'custom';   // Naming strategy
  customNaming?: NamingConfig;            // Custom naming rules

  // Templates
  templateDir?: string;                   // Custom template directory

  // Hooks
  beforeGenerate?: (config) => void;      // Pre-generation hook
  afterGenerate?: (files) => void;        // Post-generation hook
}
```

**Success Criteria:**
- Config file supported
- CLI arguments override config
- Validation with clear errors
- Type-safe config access

### Phase 3: CLI Implementation (Week 3-4)

**Objective:** Create professional CLI interface.

#### Tasks:
1. **Setup CLI Framework**
   - Use `commander` or `yargs`
   - Create `cli/index.ts`
   - Setup command structure

2. **Implement Generate Command**
   ```bash
   velos generate [options]
   velos generate --config velos.config.ts
   velos generate --spec api-docs.json --output ./src/repos
   ```

3. **Implement Init Command**
   ```bash
   velos init
   # Creates velos.config.ts with defaults
   ```

4. **Implement Watch Mode**
   ```bash
   velos generate --watch
   # Regenerates on spec changes
   ```

5. **Add Dry Run Mode**
   ```bash
   velos generate --dry-run
   # Shows what would be generated
   ```

6. **Implement Logging**
   - Progress indicators
   - Verbose mode
   - Error reporting
   - Success summaries

**Success Criteria:**
- Intuitive command structure
- Helpful error messages
- Progress feedback
- Watch mode functional

### Phase 4: Testing Infrastructure (Week 4-5)

**Objective:** Comprehensive test coverage.

#### Tasks:
1. **Setup Testing Framework**
   - Vitest or Jest
   - Test fixtures
   - Mock utilities

2. **Unit Tests**
   - Test each module independently
   - Mock dependencies
   - Edge case coverage
   - 80%+ coverage

3. **Integration Tests**
   - End-to-end generation
   - Multiple spec formats
   - Error scenarios

4. **Test Fixtures**
   - Sample OpenAPI specs
   - Expected output files
   - Error cases

**Success Criteria:**
- 80%+ code coverage
- All modules tested
- CI/CD integration
- Automated testing

### Phase 5: Package Setup (Week 5-6)

**Objective:** Prepare for npm publishing.

#### Tasks:
1. **Build Configuration**
   - TypeScript build setup
   - ESM + CJS outputs
   - Source maps
   - Type declarations

2. **Package.json Configuration**
   - Proper exports
   - Bin entry point
   - Peer dependencies
   - Keywords and metadata

3. **Documentation**
   - Comprehensive README
   - API documentation
   - Usage examples
   - Migration guide

4. **Publishing Setup**
   - Version strategy
   - Changelog automation
   - Release workflow
   - NPM organization

**Success Criteria:**
- Package installable via npm
- Works as dev dependency
- Type definitions included
- Documentation complete

---

## Enhancement Roadmap

### Version 2.0 (Core Refactor) - Q1 2025

**Focus:** Modular architecture, configuration system, CLI

- ✅ Break monolithic code into modules
- ✅ Configuration file support
- ✅ CLI implementation
- ✅ Basic testing
- ✅ Package publishing

### Version 2.1 (Developer Experience) - Q2 2025

**Focus:** Better DX, more flexibility

- 🔲 Watch mode improvements
- 🔲 Interactive init command
- 🔲 Better error messages
- 🔲 Dry-run visualization
- 🔲 Configuration presets (Next.js, Nest.js, etc.)

### Version 2.2 (Customization) - Q2 2025

**Focus:** Templates and extensibility

- 🔲 Custom template support
- 🔲 Template inheritance
- 🔲 Plugin system
- 🔲 Custom naming strategies
- 🔲 Pre/post generation hooks

### Version 2.3 (Advanced Features) - Q3 2025

**Focus:** Advanced API patterns

- 🔲 Pagination helper generation
- 🔲 Filter builder generation
- 🔲 Request/response interceptors
- 🔲 Retry logic generation
- 🔲 Cache integration

### Version 3.0 (Framework Integration) - Q4 2025

**Focus:** Framework-specific optimizations

- 🔲 Next.js integration (server actions)
- 🔲 React Query integration
- 🔲 SWR integration
- 🔲 Nest.js integration
- 🔲 tRPC-style type inference

---

## Package Structure

### Published Package Layout

```
velos-ts/
├── dist/                     # Compiled output
│   ├── cli/                  # CLI compiled code
│   ├── core/                 # Core compiled code
│   ├── config/               # Config compiled code
│   ├── utils/                # Utils compiled code
│   └── types/                # Type definitions
│
├── templates/                # Default templates
│   ├── repository.template.ts
│   ├── interface.template.ts
│   └── method.template.ts
│
├── bin/                      # Executable entry
│   └── velos-ts.js
│
├── src/                      # Source code (not published)
│   └── ...
│
├── package.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### Package.json

```json
{
  "name": "velos-ts",
  "version": "2.0.0",
  "description": "Generate type-safe TypeScript repositories from OpenAPI specifications",
  "keywords": [
    "openapi",
    "typescript",
    "code-generator",
    "repository",
    "api-client",
    "codegen"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/khyarih/velos-ts"
  },
  "bin": {
    "velos-ts": "./bin/velos-ts.js"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    },
    "./config": {
      "require": "./dist/config/index.js",
      "import": "./dist/config/index.mjs",
      "types": "./dist/config/index.d.ts"
    }
  },
  "files": [
    "dist",
    "templates",
    "bin",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src",
    "format": "prettier --write src",
    "prepublishOnly": "npm run build && npm test"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "zod": "^3.22.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0"
  },
  "peerDependencies": {
    "openapi-typescript": "^6.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "openapi-typescript": "^6.0.0",
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Build Configuration (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
});
```

---

## Usage & Integration

### Installation

```bash
npm install --save-dev velos openapi-typescript
```

### Basic Usage

#### 1. Generate OpenAPI Types

```bash
npx openapi-typescript ./api-docs.json -o ./src/api/api-spec.ts
```

#### 2. Create Configuration

```bash
npx velos init
```

This creates `velos.config.ts`:

```typescript
import { defineConfig } from 'velos-ts/config';

export default defineConfig({
  openApiSpec: './api-docs.json',
  outputDir: './src/repositories',
  apiSpecTypesPath: '@/api/api-spec',
  includePatterns: [
    '/api/v1/product**',
    '/api/v1/category**',
    '/api/v1/order**',
  ],
  excludePatterns: [
    '/api/v1/admin/**',
    '/api/v1/internal/**',
  ],
});
```

#### 3. Generate Repositories

```bash
npx velos generate
```

Or with watch mode:

```bash
npx velos generate --watch
```

### Package Scripts Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:types": "openapi-typescript ./api-docs.json -o ./src/api/api-spec.ts",
    "generate:repos": "velos-ts generate",
    "generate": "npm run generate:types && npm run generate:repos",
    "dev": "npm run generate && next dev"
  }
}
```

### Using Generated Repositories

```typescript
import { ProductRepository } from './repositories';
import { apiClient } from './api/client';

// Initialize repository
const productRepo = new ProductRepository(apiClient);

// Use type-safe methods
const result = await productRepo.getProductByIdFull(123);

if (result.success) {
  console.log(result.data); // Fully typed ProductDTO
} else {
  console.error(result.error); // Typed error details
}

// Query parameters are typed
const listResult = await productRepo.getAllProductsFull({
  page: 0,
  size: 10,
  sort: 'name,asc',
});
```

### Required Dependencies in Consuming Project

The consuming project must provide:

#### 1. ApiClient Implementation

```typescript
// src/api/client.ts
export interface ApiClient {
  get<T>(path: string, data?: any, headers?: any, options?: RequestOptions): Promise<T>;
  post<T>(path: string, data?: any, headers?: any, options?: RequestOptions): Promise<T>;
  put<T>(path: string, data?: any, headers?: any, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, data?: any, headers?: any, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, data?: any, headers?: any, options?: RequestOptions): Promise<T>;
}

export interface RequestOptions {
  requiresAuth?: boolean;
  // ... other options
}

// Implementation example
class HttpClient implements ApiClient {
  async get<T>(path: string, data?: any, headers?: any, options?: RequestOptions): Promise<T> {
    // Implement HTTP GET
  }
  // ... other methods
}

export const apiClient = new HttpClient();
```

#### 2. BaseRepository

```typescript
// src/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  protected abstract readonly endpoint: string;

  constructor(protected readonly apiClient: ApiClient) {}

  // Common methods can go here
}
```

#### 3. Result Type

```typescript
// src/types/result.ts
export type Result<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: ErrorDetails };

export interface ErrorDetails {
  code: string;
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

export function success<T>(data: T, message?: string): Result<T> {
  return { success: true, data, message };
}

export function failure(error: ErrorDetails): Result<never> {
  return { success: false, error };
}

export function errorToDetails(error: unknown, defaultCode: string): ErrorDetails {
  // Convert error to ErrorDetails
}
```

---

## Testing Strategy

### Unit Testing

**Target Coverage:** 80%+

#### Modules to Test:

1. **String Utilities**
   - `singularize()` - plural to singular conversion
   - `toPascalCase()` - case conversion
   - `toCamelCase()` - case conversion
   - Edge cases: empty strings, special characters, numbers

2. **Path Utilities**
   - `matchesPattern()` - wildcard matching
   - Pattern extraction
   - Edge cases: malformed patterns, edge wildcards

3. **Resource Extraction**
   - `inferResourceInfo()` - resource identification
   - Grouping logic
   - Nested resources
   - Edge cases: single-segment paths, deep nesting

4. **Type Extraction**
   - Schema collection
   - Query param type generation
   - Dependency analysis
   - Generic type handling (Page<T>)

5. **Code Generation**
   - Import generation
   - Type alias generation
   - Interface generation
   - Class generation
   - Method generation

#### Test Structure:

```typescript
// tests/unit/utils/string-utils.test.ts
describe('singularize', () => {
  it('should convert plural to singular', () => {
    expect(singularize('categories')).toBe('category');
    expect(singularize('products')).toBe('product');
  });

  it('should handle irregular plurals', () => {
    expect(singularize('children')).toBe('child');
  });

  it('should return singular if already singular', () => {
    expect(singularize('product')).toBe('product');
  });
});
```

### Integration Testing

**Objective:** Test full generation workflow

#### Test Scenarios:

1. **Basic Generation**
   - Input: Simple OpenAPI spec
   - Expected: Correct repository files generated
   - Validation: Files exist, compile, types correct

2. **Complex Spec**
   - Input: OpenAPI spec with nested resources, generics
   - Expected: All resources generated correctly
   - Validation: All types resolved, no errors

3. **Filtering**
   - Input: Spec with include/exclude patterns
   - Expected: Only matching endpoints generated
   - Validation: Correct files created, others excluded

4. **Error Handling**
   - Input: Invalid OpenAPI spec
   - Expected: Clear error message
   - Validation: Graceful failure, no partial generation

5. **Watch Mode**
   - Input: Spec file changes
   - Expected: Automatic regeneration
   - Validation: Files updated, no stale output

#### Test Fixtures:

```
tests/fixtures/
├── openapi-specs/
│   ├── simple-api.json
│   ├── complex-api.json
│   ├── nested-resources.json
│   └── invalid-spec.json
│
├── expected-output/
│   ├── simple-api/
│   │   ├── product.repository.ts
│   │   └── index.ts
│   └── complex-api/
│       └── ...
│
└── configs/
    ├── default.config.ts
    └── custom.config.ts
```

### End-to-End Testing

**Objective:** Test in real project context

1. Create test project
2. Install velos as dev dependency
3. Generate repositories
4. Import and use in TypeScript
5. Verify compilation
6. Verify runtime behavior

### Test Automation

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## Future Considerations

### Version 3.0+ Features

1. **Multi-Spec Support**
   - Combine multiple OpenAPI specs
   - Shared type resolution
   - Namespace separation

2. **Advanced Type Features**
   - Discriminated unions
   - Conditional types
   - Template literal types
   - Branded types for IDs

3. **React Query Integration**
   ```typescript
   // Generated hook
   export function useGetProduct(id: number, options?: UseQueryOptions) {
     return useQuery({
       queryKey: ['product', id],
       queryFn: () => productRepo.getProductByIdFull(id),
       ...options,
     });
   }
   ```

4. **GraphQL Code Generation**
   - Similar approach for GraphQL schemas
   - Type-safe query builders
   - Fragment support

5. **Mock Server Generation**
   - Generate MSW handlers
   - Type-safe mocks
   - Development mode support

6. **Documentation Generation**
   - API documentation from repositories
   - Interactive API explorer
   - Postman collection generation

7. **Validation Integration**
   - Zod schema generation
   - Runtime validation
   - Form validation helpers

8. **Optimization Features**
   - Request deduplication
   - Automatic retry logic
   - Response caching strategies
   - Optimistic updates

---

## Success Metrics

### Code Quality
- ✅ No file over 300 lines
- ✅ 80%+ test coverage
- ✅ Zero TypeScript errors
- ✅ ESLint passing
- ✅ Prettier formatted

### Developer Experience
- ✅ < 5 minutes from install to first generation
- ✅ Clear error messages (user testing)
- ✅ Comprehensive documentation
- ✅ Active issue response (< 48h)

### Package Health
- ✅ < 1MB package size
- ✅ Peer dependency only on openapi-typescript
- ✅ Works on Node 18+
- ✅ TypeScript 5+ compatible

### Adoption
- 🎯 100 npm downloads/week
- 🎯 10 GitHub stars
- 🎯 5 community contributions
- 🎯 Used in 3+ production projects

---

## Contributing Guidelines

### Development Setup

```bash
git clone https://github.com/khyarih/velos-ts
cd velos-ts
npm install
npm run build
npm link
```

### Development Workflow

1. Create feature branch
2. Make changes
3. Add tests
4. Run `npm test`
5. Run `npm run lint`
6. Commit with conventional commits
7. Create PR

### Commit Convention

```
feat: Add custom template support
fix: Resolve path resolution on Windows
docs: Update configuration examples
test: Add tests for type analyzer
refactor: Extract method generator
chore: Update dependencies
```

### Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review

---

## License

MIT License - See LICENSE file for details

---

## Appendix

### A. Glossary

- **OpenAPI**: Specification format for describing RESTful APIs
- **Repository Pattern**: Design pattern that encapsulates data access logic
- **Result Pattern**: Error handling pattern that avoids exceptions
- **Type Alias**: TypeScript feature to create shorter names for types
- **Barrel Export**: Re-exporting from index.ts for cleaner imports

### B. References

- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

### C. Migration Guide (V1 to V2)

**Breaking Changes:**
- Configuration now required (create with `velos-ts init`)
- CLI required (was script-based)
- Output structure changed (added index.ts)

**Migration Steps:**
1. Install velos-ts@2.0.0
2. Run `npx velos init`
3. Update config with your settings
4. Run `npx velos generate`
5. Update imports if needed

---

**Document Version:** 2.0
**Last Updated:** 2025-12-26
**Status:** Living Document - Updates as project evolves

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional code generators (DTOs, interfaces, custom templates)
- Support for OpenAPI 3.1.x specification
- Watch mode for continuous generation on spec changes
- Plugin system for custom generators
- CLI interactive mode for scaffolding projects

---

## [1.0.1] - TBD

### Added
- **Resource Grouping Configuration**: Flexible control over how endpoints are grouped into repositories
  - **Strategy Options**:
    - `auto` (default): Intelligently groups sub-resources under root based on path parameters
    - `root`: Always uses only the first segment for maximum grouping
    - `full`: Creates separate repositories for all path segments
  - **Depth Control**: Configure how many path segments to use for grouping (1-3)
  - **Use Cases**:
    - Group `/api/v1/orders/{id}/items` under `OrderRepository` (auto strategy)
    - Create `AdminProductRepository` for `/api/v1/admin/products` (depth: 2)
    - Separate `OrderItemRepository` for nested resources (full strategy)
  - See [Resource Grouping Documentation](./docs/RESOURCE_GROUPING.md) for details
- **New Examples Directory**: Comprehensive examples for common authentication patterns
  - Server-side cookie authentication with CSRF protection
  - Request/response interceptor patterns
  - Error handling strategies
  - React integration examples
  - Backend configuration guidelines
- **Response Code Documentation**: Generated methods now include HTTP status codes in JSDoc comments
  - Each method documents all declared response codes from the OpenAPI spec
  - Frontend developers can see what status codes to expect for each endpoint
  - Example:
    ```typescript
    /**
     * Create a new order
     *
     * **Response Codes:**
     * - `201`: Order created successfully
     * - `400`: Invalid request data
     * - `401`: Authentication required
     * - `409`: Order already exists
     *
     * @async
     */
    async createOrder(data: CreateOrderRequest, options?: RequestOptions): Promise<Result<OrderDTO>>
    ```

### Changed
- **Breaking improvement**: Generated repository methods now use type aliases instead of full schema paths
  - **Before**: `Promise<Result<components['schemas']['OrderDTO']>>`
  - **After**: `Promise<Result<OrderDTO>>`
  - This makes generated code more readable and cleaner
  - Type aliases are still generated at the top of repository files
- Updated main README to reference examples directory
- Enhanced JSDoc generation to include response codes and descriptions
- **Code Quality**: Prettier formatting now enforced across the codebase
  - Added `.prettierrc.json` and `.prettierignore` configuration
  - Ensures consistent code style in generated and source files

### Fixed
- **Dynamic Path Structure Support**: Resource grouping now works with any API path structure
  - Previously hardcoded for `/api/vX/` patterns
  - Now supports `/api/products`, `/products`, and custom prefixes
  - `resourceStartIndex` dynamically calculated based on actual path structure
- **Pattern Matching for Base Paths**: `/**` wildcard patterns now correctly match base paths
  - **Before**: `/api/v1/product/**` only matched nested paths like `/api/v1/product/{id}`
  - **After**: `/api/v1/product/**` matches both `/api/v1/product` AND nested paths
  - Fixes issue where endpoints without path parameters were excluded from generation
  - Example: `GET /api/v1/product` (list all) is now included alongside `GET /api/v1/product/{id}`
- **Query Parameter Type Naming**: Fixed inconsistency between type definition and usage
  - Type interfaces now consistently use PascalCase (e.g., `GetOrdersByDateRangeQueryParams`)
  - Previously defined with PascalCase but referenced with camelCase, causing TypeScript errors
- **Type Alias Generation**: All used schemas now get type aliases created
  - Removed incorrect skip logic that prevented aliases for certain schemas (e.g., `Page`)
  - All schemas referenced in the OpenAPI spec are now properly aliased
  - Ensures all types used in method signatures are declared

### Technical Details
- Added `resourceGrouping` configuration schema with `depth` and `strategy` options
- Updated `inferResourceInfo()` to support configurable grouping strategies
- Introduced dynamic `resourceStartIndex` calculation for flexible path structure support
- Enhanced `matchesAnyPattern()` to properly handle `/**` wildcard patterns with base path matching
- Updated `extractResources()` and `extractResourceGroups()` to accept grouping configuration
- Fixed `extractMethodSignature()` to use `toPascalCase` for query parameter type names
- Removed skip logic in `generateTypeAliases()` to create aliases for all used schemas
- Added comprehensive tests for all grouping strategies and depth configurations
- Added test for base path matching with `/**` patterns
- Updated `mapSchemaToTypeString()` to return schema names directly instead of full paths
- Updated `mapSchemaTypeToTypeScript()` for consistent type alias usage
- Added `generateJSDoc()` function in method-generator.ts to extract and document response codes
- Response codes extracted from `operation.responses` and sorted numerically
- Created `/examples` directory with comprehensive documentation
- Created `/docs/RESOURCE_GROUPING.md` with detailed configuration guide
- Added `generated-code-example.ts` showing practical usage of response code documentation
- All 186 tests passing (added 3 new tests)

---

## [1.0.0] - 2025-12-26

### Fixed
- Fixed CI/CD pipeline failures in GitHub Actions workflows
- Fixed ESLint configuration and resolved all linting errors
- Fixed package bin entry point to use `.cjs` extension for proper ES module compatibility
- Resolved test coverage issues to meet quality thresholds:
  - Lines: 70%
  - Functions: 74%
  - Branches: 66%
  - Statements: 69%

### Changed
- Updated ESLint configuration for stricter code quality standards
- Improved test coverage across core modules
- Enhanced CI/CD pipeline reliability

### Technical Details
- **Node.js**: 18+ required
- **TypeScript**: 5.3+ with strict mode
- **Module Formats**: CommonJS and ESM
- **Test Coverage**: Lines 70%, Functions 74%, Branches 66%, Statements 69%
- **Dependencies**: commander, chalk, ora, js-yaml, zod
- **Dev Dependencies**: vitest, tsup, @vitest/ui, @vitest/coverage-v8


---

## Acknowledgments

Built on top of:
- [openapi-typescript](https://github.com/drwpow/openapi-typescript) - TypeScript types from OpenAPI
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [Vitest](https://vitest.dev/) - Testing framework
- [tsup](https://github.com/egoist/tsup) - TypeScript bundler

---

## Links

- [GitHub Repository](https://github.com/khyarih/velos-ts)
- [npm Package](https://www.npmjs.com/package/velos-ts)
- [Documentation](./docs/)
- [Issues](https://github.com/khyarih/velos-ts/issues)
- [Changelog](./CHANGELOG.md)

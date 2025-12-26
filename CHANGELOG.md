# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- ESLint configuration
- Prettier formatting
- Additional code generators (DTOs, interfaces)
- Support for OpenAPI 3.1.x
- Watch mode for continuous generation

---

## [1.0.1] - TBD

### Added
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

### Technical Details
- Updated `mapSchemaToTypeString()` to return schema names directly instead of full paths
- Updated `mapSchemaTypeToTypeScript()` for consistent type alias usage
- Added `generateJSDoc()` function in method-generator.ts to extract and document response codes
- Response codes extracted from `operation.responses` and sorted numerically
- All existing tests pass with the new type resolution
- Created `/examples` directory with comprehensive documentation
- Added `generated-code-example.ts` showing practical usage of response code documentation

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

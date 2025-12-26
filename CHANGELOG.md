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

## [2.0.0] - 2025-12-26

### Added

**Phase 1: Code Organization**
- Modular architecture with clear separation of concerns
- Core runtime dependencies (Result pattern, ApiClient, BaseRepository)
- Comprehensive utility modules (string, path, schema, file)
- Spec loader with validation and normalization
- Resource extractor for grouping operations
- Type analyzer for schema analysis
- Code generators for repositories, interfaces, and type aliases
- Main orchestrator (generate.ts)

**Phase 2: Configuration System**
- YAML-based configuration with js-yaml
- Zod schema validation
- Configuration loader with auto-discovery
- Config merging strategy (defaults < file < overrides)
- Example configuration files
- Comprehensive configuration documentation

**Phase 3: CLI Implementation**
- Commander.js CLI framework
- Beautiful colored output with chalk
- Progress indicators with ora
- Generate command with extensive options
- Init command for configuration setup
- Error handling with helpful messages
- CLI documentation

**Phase 4: Testing Infrastructure**
- Vitest testing framework
- 100+ unit and integration tests
- Test fixtures (simple and complex OpenAPI specs)
- Test utilities and helpers
- 80%+ code coverage target
- GitHub Actions CI/CD workflows
- Automated npm publishing
- Scheduled testing
- Comprehensive testing documentation

**Phase 5: Package Setup**
- Dual build support (CommonJS + ESM) via tsup
- Optimized package configuration
- npm publishing setup with provenance
- Release documentation and guides
- Package validation scripts
- .npmignore for clean published package

### Changed
- Complete rewrite from monolithic script to modular architecture
- Improved type safety with strict TypeScript configuration
- Enhanced error messages and handling
- Better code organization and maintainability

### Technical Details
- **Node.js**: 18+ required
- **TypeScript**: 5.3+ with strict mode
- **Module Formats**: CommonJS and ESM
- **Dependencies**: commander, chalk, ora, js-yaml, zod
- **Dev Dependencies**: vitest, tsup, @vitest/ui, @vitest/coverage-v8

---

## [1.0.0] - Previous Version

Initial release (monolithic script under `scripts/`)

### Features
- Basic OpenAPI to repository generation
- TypeScript type inference
- Simple CLI
- Manual configuration

---

## Version Comparison

| Feature | v1.0.0 | v2.0.0 |
|---------|--------|--------|
| Architecture | Monolithic | Modular |
| Lines of Code | 1530 (1 file) | ~5000 (50+ files) |
| Configuration | Hardcoded | YAML-based |
| CLI | Basic | Full-featured |
| Tests | None | 100+ |
| Coverage | 0% | 80%+ |
| Build | Basic | Dual (CJS+ESM) |
| Documentation | Minimal | Comprehensive |
| CI/CD | None | GitHub Actions |
| Dependencies | Few | Optimized |

---

## Upgrade Guide

### Migrating from v1.x to v2.x

#### Breaking Changes

1. **Configuration Format**
   - **Before (v1.x):** Hardcoded configuration in script
   - **After (v2.x):** YAML configuration file

   ```yaml
   # velos.config.yaml
   openApiSpecPath: ./api-docs.json
   outputDir: ./src/repositories
   apiSpecTypesPath: '@/api/api-spec'
   ```

2. **CLI Usage**
   - **Before (v1.x):** `ts-node scripts/generate-repositories.ts`
   - **After (v2.x):** `npx velos generate`

3. **Imports**
   - **Before (v1.x):** Runtime dependencies expected in user code
   - **After (v2.x):** Import from package

   ```typescript
   // v2.x
   import { FetchApiClient, BaseRepository } from 'velos-ts/runtime';
   ```

4. **Generated Code Structure**
   - **Before (v1.x):** All in one file
   - **After (v2.x):** Separate files per repository + index

#### Migration Steps

1. **Install v2.x**
   ```bash
   npm install --save-dev velos-ts@2
   ```

2. **Create Configuration**
   ```bash
   npx velos init
   ```

3. **Update Configuration**
   Edit `velos.config.yaml` to match your project

4. **Generate Repositories**
   ```bash
   npx velos generate
   ```

5. **Update Imports**
   Update your code to import runtime dependencies from `velos/runtime`

6. **Add to Scripts**
   ```json
   {
     "scripts": {
       "generate:repos": "velos generate"
     }
   }
   ```

---

## Deprecations

### v2.0.0

- Removed manual script execution (`ts-node scripts/...`)
- Removed hardcoded configuration
- Removed single-file output option

---

## Security

### v2.0.0

- Added npm provenance for supply chain security
- Automated security testing in CI
- Dependency vulnerability scanning
- Strict TypeScript mode for type safety

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

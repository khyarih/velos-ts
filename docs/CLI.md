

# CLI Reference

Complete reference for the `velos` command-line interface.

## Installation

```bash
# Install globally
npm install --save-dev velos-ts

# Or use with npx (no installation needed)
npx velos <command>
```

## Commands

### `velos generate`

Generates repository files from an OpenAPI specification.

#### Usage

```bash
velos generate [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --config <path>` | Path to configuration file | Auto-discovered |
| `-s, --spec <path>` | Path to OpenAPI specification file | From config |
| `-o, --output <dir>` | Output directory for generated files | From config |
| `-t, --types <path>` | Import path for openapi-typescript types | From config |
| `--overwrite` | Overwrite existing files | From config |
| `--no-overwrite` | Do not overwrite existing files | - |
| `--include <patterns...>` | Endpoint patterns to include | From config |
| `--exclude <patterns...>` | Endpoint patterns to exclude | From config |
| `--dry-run` | Show what would be generated without writing files | `false` |
| `--verbose` | Show detailed logging | `false` |
| `-h, --help` | Display help for command | - |

#### Examples

**Basic usage with config file:**
```bash
# Uses velos.config.yaml from current directory or parent
velos generate
```

**With custom config file:**
```bash
velos generate --config ./my-config.yaml
```

**Override config with CLI options:**
```bash
velos generate --spec ./api-docs.json --output ./src/repos --overwrite
```

**Filter endpoints:**
```bash
velos generate --include "/api/v1/**" --exclude "/api/v1/admin/**"
```

**Dry run to preview:**
```bash
velos generate --dry-run
```

**Verbose output:**
```bash
velos generate --verbose
```

---

### `velos init`

Creates a sample configuration file.

#### Usage

```bash
velos init [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output path for config file | `velos.config.yaml` |
| `-f, --force` | Overwrite existing config file | `false` |
| `-h, --help` | Display help for command | - |

#### Examples

**Create default config:**
```bash
velos init
# Creates velos.config.yaml
```

**Custom output path:**
```bash
velos init --output ./config/velos.yaml
```

**Overwrite existing config:**
```bash
velos init --force
```

---

### `velos --version`

Displays the current version of velos.

```bash
velos --version
# or
velos -v
```

---

### `velos --help`

Displays help information.

```bash
velos --help
# or
velos -h
```

---

## Configuration

The CLI can be configured through:

1. **Configuration file** (recommended)
2. **CLI arguments** (overrides config file)
3. **Environment variables** (future feature)

### Configuration Priority

When multiple configuration sources are provided:

```
CLI Arguments > Config File > Defaults
```

### Auto-Discovery

The CLI automatically searches for configuration files in this order:

1. `velos.config.yaml`
2. `velos.config.yml`
3. `.velos.yaml`
4. `.velos.yml`
5. `velos.yaml`
6. `velos.yml`

The search starts in the current directory and walks up through parent directories.

---

## Workflow Examples

### First-Time Setup

```bash
# 1. Initialize configuration
velos init

# 2. Edit velos.config.yaml to match your project

# 3. Generate repositories
velos generate
```

### Typical Development Workflow

```bash
# Make changes to OpenAPI spec
# ...

# Regenerate repositories
velos generate

# Review changes
git diff src/generated/repositories/
```

### CI/CD Integration

```bash
# In your CI pipeline
npm install --save-dev velos-ts

# Generate repositories (ensure config is in repo)
velos generate --overwrite

# Verify TypeScript compilation
tsc --noEmit
```

### Multiple Environments

```bash
# Development
velos generate --config velos.config.dev.yaml

# Production
velos generate --config velos.config.prod.yaml

# Testing
velos generate --config velos.config.test.yaml
```

---

## Pattern Syntax

Endpoint patterns support wildcards:

| Pattern | Matches |
|---------|---------|
| `/api/v1/product` | Exact path only |
| `/api/v1/product*` | Paths starting with `/api/v1/product` (same segment) |
| `/api/v1/product/*` | Direct children of `/api/v1/product` |
| `/api/v1/product/**` | All paths under `/api/v1/product` (recursive) |
| `/api/*/product` | `/api/v1/product`, `/api/v2/product`, etc. |
| `/api/**/product` | Any path ending with `/product` under `/api` |

### Pattern Examples

```bash
# Include specific resources
velos generate --include "/api/v1/users/**" "/api/v1/posts/**"

# Exclude admin endpoints
velos generate --exclude "/api/v1/admin/**"

# Include v1 and v2, exclude internal
velos generate \
  --include "/api/v1/**" "/api/v2/**" \
  --exclude "**/internal/**" "**/test/**"
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (configuration, spec loading, generation failure) |

---

## Output

### Success Output

```
Repository Generator
====================

Configuration:
==============
  OpenAPI Spec: ./api-docs.json
  Output Dir: ./src/generated/repositories
  ...

[1/6] Loading OpenAPI specification...
[LOADED] My API v1.0.0

[2/6] Normalizing specification...
[NORMALIZED] 45 operations found

[3/6] Extracting resource groups...
[EXTRACTED] 5 resources identified
  - Product (12 operations, base: /api/v1/product)
  - Category (8 operations, base: /api/v1/category)
  ...

[4/6] Generating repository files...
[GENERATED] 5 repository files

[5/6] Generating index and support files...
[GENERATED] Index and README files

[6/6] Writing files to disk...
[WRITE] product.repository.ts
[WRITE] category.repository.ts
...

✓ Generation Complete!

Summary
-------
  Repositories Generated  5
  Total Methods          45
  Files Written          7

Generated Repositories
---------------------
  • ProductRepository
    12 methods, product.repository.ts
  • CategoryRepository
    8 methods, category.repository.ts
  ...
```

### Error Output

```
✖ Configuration Error
  Configuration file not found: ./velos.config.yaml

ℹ Create a configuration file with:
  npx velos init
```

---

## Environment Variables

Currently, velos uses these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug output (stack traces) | `false` |
| `NODE_ENV` | Environment (can be used for config selection) | - |

### Future Environment Variables

Planned for future releases:

- `velos_CONFIG` - Path to config file
- `velos_OUTPUT` - Output directory
- `velos_SPEC` - OpenAPI spec path

---

## Debugging

### Enable Verbose Logging

```bash
velos generate --verbose
```

### Enable Debug Mode

```bash
DEBUG=1 velos generate
```

This shows stack traces for errors.

### Dry Run

```bash
velos generate --dry-run
```

See what would be generated without writing files.

---

## Troubleshooting

### Command Not Found

```bash
velos: command not found
```

**Solution:**
```bash
# Use npx
npx velos generate

# Or install globally
npm install --save-dev velos-ts
```

### Permission Denied

```bash
Error: EACCES: permission denied
```

**Solution:**
```bash
# Check output directory permissions
ls -la ./src/generated/

# Fix permissions
chmod 755 ./src/generated/
```

### Configuration Not Found

```bash
Configuration file not found
```

**Solution:**
```bash
# Create configuration file
velos init

# Or specify path explicitly
velos generate --config ./path/to/config.yaml
```

### Spec Loading Failed

```bash
Failed to load OpenAPI spec
```

**Solutions:**
1. Check file path: `--spec ./correct/path/api-docs.json`
2. Validate spec: https://editor.swagger.io/
3. Check file permissions: `ls -la api-docs.json`

---

## Advanced Usage

### Programmatic Usage

You can also use velos programmatically:

```typescript
import { generate } from 'velos-ts';

const result = await generate({
  configPath: './velos.config.yaml',
  overrides: {
    overwrite: true,
  },
});

console.log(`Generated ${result.repositories.length} repositories`);
```

See [API Reference](./API.md) for details.

### Custom Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:types": "openapi-typescript ./api-docs.json -o ./src/api/api-spec.ts",
    "generate:repos": "velos generate",
    "generate": "npm run generate:types && npx velos generate",
    "predev": "npm run generate",
    "prebuild": "npm run generate"
  }
}
```

Then:

```bash
# Generate types and repositories
npm run generate

# Start dev server (regenerates first)
npm run dev
```

---

## See Also

- [Configuration Guide](./CONFIGURATION.md)
- [Getting Started](./GETTING_STARTED.md)
- [API Reference](./API.md)

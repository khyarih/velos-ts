# Configuration Guide

This guide explains how to configure the Repository Generator (velos).

## Configuration File

The generator supports YAML-based configuration files. By default, it searches for configuration in the following order:

1. `velos.config.yaml`
2. `velos.config.yml`
3. `.velos.yaml`
4. `.velos.yml`
5. `velos.yaml`
6. `velos.yml`

The search starts in the current directory and walks up through parent directories until a config file is found or the root is reached.

## Creating a Configuration File

### Quick Start

Generate a sample configuration file:

```bash
npx velos init
```

This creates a `velos.config.yaml` file in your current directory with sensible defaults and comments.

### Manual Creation

Create a `velos.config.yaml` file:

```yaml
# Path to your OpenAPI specification file (JSON or YAML)
openApiSpecPath: ./api-docs.json

# Output directory for generated repositories
outputDir: ./src/generated/repositories

# Path to your openapi-typescript generated types
apiSpecTypesPath: '@/api/api-spec'

# Whether to overwrite existing repository files
overwrite: true

# Whether to use enhanced features
useEnhancements: true

# Endpoint patterns to include (optional)
includePatterns:
  - /api/v1/product**
  - /api/v1/category**
  - /api/v1/order**

# Endpoint patterns to exclude (optional)
excludePatterns:
  - /api/v1/admin/**
  - /api/v1/internal/**

# Whether to generate TypeScript interfaces
generateInterfaces: true

# Whether to generate type aliases
generateTypeAliases: true

# Whether to generate JSDoc comments
generateJSDocs: true
```

## Configuration Options

### Required Options

- **`openApiSpecPath`** (string): Path to your OpenAPI specification file (JSON or YAML)
- **`outputDir`** (string): Directory where generated repositories will be written
- **`apiSpecTypesPath`** (string): Import path to your `openapi-typescript` generated types

### Optional Options

- **`overwrite`** (boolean, default: `true`): Whether to overwrite existing files
- **`useEnhancements`** (boolean, default: `true`): Enable enhanced features
- **`generateInterfaces`** (boolean, default: `true`): Generate TypeScript interfaces for repositories
- **`generateTypeAliases`** (boolean, default: `true`): Generate type aliases for cleaner imports
- **`generateJSDocs`** (boolean, default: `true`): Generate JSDoc comments

### Filtering Options

- **`includePatterns`** (array of strings): Whitelist of endpoint patterns to include
- **`excludePatterns`** (array of strings): Blacklist of endpoint patterns to exclude

#### Pattern Syntax

Patterns support wildcards:
- `*` - Matches any single path segment (e.g., `/api/*/product` matches `/api/v1/product`, `/api/v2/product`)
- `**` - Matches any number of path segments (e.g., `/api/v1/**` matches all paths under `/api/v1/`)

#### Examples

```yaml
# Include only specific API versions and resources
includePatterns:
  - /api/v1/product**
  - /api/v1/category**
  - /api/v2/**

# Exclude admin, internal, and test endpoints
excludePatterns:
  - /api/*/admin/**
  - /api/*/internal/**
  - /api/*/test/**
  - /**/__test__/**
```

### Advanced Options

#### Naming Strategy

Customize how files, classes, and methods are named:

```yaml
namingStrategy:
  repositoryClass: '{Resource}Repository'      # Class name pattern
  repositoryInterface: 'I{Resource}Repository' # Interface name pattern
  repositoryFile: '{resource}.repository.ts'   # File name pattern
  methodNaming: camelCase                      # camelCase, snake_case, or kebab-case
```

#### Custom Templates

Use custom templates for code generation:

```yaml
templateDir: ./templates
```

## Usage Examples

### Programmatic Usage

#### Option 1: Auto-discover Config File

```typescript
import { generate } from 'velos-ts';

// Searches for config file in current and parent directories
const result = generate();
```

#### Option 2: Specify Config File

```typescript
import { generate } from 'velos-ts';

const result = generate({
  configPath: './my-config.yaml',
});
```

#### Option 3: Override Specific Options

```typescript
import { generate } from 'velos-ts';

const result = generate({
  configPath: './velos.config.yaml',
  overrides: {
    overwrite: true,
    outputDir: './src/custom-output',
  },
});
```

#### Option 4: No Config File (All Programmatic)

```typescript
import { generate } from 'velos-ts';

const result = generate({
  overrides: {
    openApiSpecPath: './api-docs.json',
    outputDir: './src/generated/repositories',
    apiSpecTypesPath: '@/api/api-spec',
    includePatterns: ['/api/v1/**'],
  },
});
```

### CLI Usage

```bash
# Use auto-discovered config file
npx velos generate

# Use specific config file
npx velos generate --config ./my-config.yaml

# Override options via CLI
npx velos generate --overwrite --output-dir ./custom-output
```

## Configuration Merging

When multiple configuration sources are provided, they are merged in this order (later overrides earlier):

1. **Default configuration** (built-in defaults)
2. **Config file** (velos.config.yaml)
3. **CLI arguments / overrides**

### Example

**Config file** (`velos.config.yaml`):
```yaml
openApiSpecPath: ./api-docs.json
outputDir: ./src/repositories
overwrite: false
```

**Code**:
```typescript
generate({
  configPath: './velos.config.yaml',
  overrides: {
    overwrite: true, // This overrides the config file
    includePatterns: ['/api/v1/**'], // This is added
  },
});
```

**Final configuration**:
```yaml
openApiSpecPath: ./api-docs.json  # From config file
outputDir: ./src/repositories      # From config file
overwrite: true                    # From overrides (overridden)
includePatterns: ['/api/v1/**']    # From overrides (added)
```

## Validation

All configuration is validated using Zod schemas. If validation fails, you'll see detailed error messages:

```
Invalid configuration:
  openApiSpecPath: Required
  outputDir: String must contain at least 1 character(s)
  includePatterns.0: Expected string, received number
```

## Environment-Specific Configuration

You can maintain different configuration files for different environments:

```
velos.config.yaml          # Default / development
velos.config.prod.yaml     # Production
velos.config.test.yaml     # Testing
```

Then specify which to use:

```typescript
const env = process.env.NODE_ENV || 'development';
const configPath = `./velos.config.${env}.yaml`;

generate({ configPath });
```

## Best Practices

1. **Commit your config file**: Include `velos.config.yaml` in version control
2. **Use patterns wisely**: Prefer `includePatterns` over generating everything and filtering later
3. **Keep it simple**: Start with minimal configuration and add options as needed
4. **Document custom patterns**: Add comments to explain complex include/exclude patterns
5. **Version your config**: When making breaking changes, version your config files

## Troubleshooting

### Config file not found

```
Error: Configuration file not found: ./velos.config.yaml
```

**Solution**: Make sure the config file exists and the path is correct. Or let the generator auto-discover by not specifying a path.

### Validation errors

```
Invalid configuration:
  openApiSpecPath: Required
```

**Solution**: Check that all required fields are present and have valid values. Use the example config as a reference.

### Spec file not found

```
Error: Failed to load OpenAPI spec from ./api-docs.json
```

**Solution**: Verify the `openApiSpecPath` in your config points to a valid OpenAPI specification file.

## See Also

- [CLI Reference](./CLI.md)

# Testing Guide

Comprehensive testing guide for the velos project.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Coverage](#coverage)
- [CI/CD](#cicd)
- [Best Practices](#best-practices)

---

## Overview

velos uses **Vitest** as the testing framework. The test suite includes:

- **Unit Tests**: Test individual functions and modules in isolation
- **Integration Tests**: Test complete workflows from OpenAPI spec to code generation
- **Fixtures**: Sample OpenAPI specs for testing

### Test Coverage Goals

- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 80%+
- **Statements**: 80%+

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in `./coverage/`

### Run Tests with UI

```bash
npm run test:ui
```

Opens an interactive UI for viewing and running tests.

### Run Specific Tests

```bash
# Run single test file
npm test -- tests/unit/core/runtime/result.test.ts

# Run tests matching pattern
npm test -- tests/unit/utils

# Run only integration tests
npm test -- tests/integration
```

### Debug Mode

```bash
DEBUG=1 npm test
```

This shows console output during tests for debugging.

---

## Test Structure

```
tests/
├── fixtures/                      # Test data
│   └── openapi-specs/
│       ├── simple-api.json       # Simple API for basic tests
│       └── complex-api.yaml      # Complex API for advanced tests
│
├── helpers/                       # Test utilities
│   └── test-utils.ts             # Helper functions
│
├── setup.ts                       # Vitest setup
│
├── unit/                          # Unit tests
│   ├── core/
│   │   └── runtime/
│   │       └── result.test.ts    # Result pattern tests
│   ├── utils/
│   │   ├── string-utils.test.ts  # String utilities tests
│   │   └── path-utils.test.ts    # Path utilities tests
│   └── config/
│       └── config-loader.test.ts # Configuration tests
│
└── integration/                   # Integration tests
    └── generation.test.ts         # End-to-end generation tests
```

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { toPascalCase } from '@/utils/string-utils';

describe('String Utilities', () => {
  describe('toPascalCase()', () => {
    it('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('user_profile')).toBe('UserProfile');
    });

    it('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
    });
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadOpenAPISpec } from '@/core/spec-loader/loader';
import { normalizeSpec } from '@/core/spec-loader/normalizer';
import { createTempDir, cleanupTempDir } from '@tests/helpers/test-utils';

describe('OpenAPI Processing', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir('test-spec-loader');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should load and normalize spec', () => {
    const spec = loadOpenAPISpec('./fixtures/simple-api.json');
    const normalized = normalizeSpec(spec);

    expect(normalized.operations.length).toBeGreaterThan(0);
  });
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw error for invalid input', () => {
  expect(() => someFunction(invalidInput)).toThrow();
  expect(() => someFunction(invalidInput)).toThrow('Specific error message');
});
```

### Using Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';

it('should call callback', () => {
  const callback = vi.fn();
  someFunction(callback);

  expect(callback).toHaveBeenCalled();
  expect(callback).toHaveBeenCalledWith(expectedArg);
});
```

---

## Test Utilities

### Available Utilities

Located in `tests/helpers/test-utils.ts`:

#### File System Utilities

```typescript
// Create temporary directory for tests
const tempDir = createTempDir('my-test');

// Clean up after tests
cleanupTempDir(tempDir);

// Get fixture file path
const fixturePath = getFixturePath('openapi-specs/simple-api.json');

// Read fixture content
const content = readFixture('openapi-specs/simple-api.json');
```

#### Configuration Utilities

```typescript
// Create test configuration
const config = createTestConfig({
  outputDir: './test-output',
  overwrite: true,
});
```

#### Mock API Client

```typescript
const mockClient = new MockApiClient();

// Mock responses
mockClient.mockResponse('/users/1', { id: 1, name: 'Test User' });

// Mock errors
mockClient.mockResponse('/users/999', new Error('Not found'));

// Check calls
expect(mockClient.calls).toHaveLength(1);
expect(mockClient.calls[0]).toEqual({
  method: 'GET',
  path: '/users/1',
});
```

#### Assertion Helpers

```typescript
// Assert file exists
assertFileExists('./output/repository.ts');

// Assert file contains content
assertFileContains('./output/repository.ts', 'class ProductRepository');
```

#### String Utilities

```typescript
// Normalize line endings for cross-platform testing
const normalized = normalizeLineEndings(fileContent);

// Remove whitespace for comparison
const cleaned = removeWhitespace(generatedCode);
```

---

## Coverage

### Viewing Coverage Reports

After running `npm run test:coverage`:

1. **Terminal**: See summary in terminal
2. **HTML Report**: Open `coverage/index.html` in browser
3. **LCOV**: `coverage/lcov.info` for CI tools

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

Tests will fail if coverage drops below thresholds.

### Excluded from Coverage

- `node_modules/`
- `dist/`
- `**/*.d.ts` (type definition files)
- `**/*.config.*` (config files)
- `**/index.ts` (barrel exports)
- `bin/` (CLI executables)
- `tests/` (test files themselves)

---

## CI/CD

### GitHub Actions Workflows

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)

Runs on every push and pull request:

- Tests on Node.js 18, 20, 22
- Code coverage
- Type checking
- Linting

#### 2. **Publish Workflow** (`.github/workflows/publish.yml`)

Runs when a GitHub release is published:

- Runs full test suite
- Builds the package
- Publishes to npm

#### 3. **Scheduled Workflow** (`.github/workflows/scheduled.yml`)

Runs weekly:

- Full test suite
- Checks for outdated dependencies
- Creates issues on failure

### Running Tests Locally (CI Simulation)

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Check coverage
npm run test:coverage

# Type check
npx tsc --noEmit

# Build
npm run build
```

---

## Best Practices

### 1. Test Naming

Use descriptive test names:

```typescript
// ✅ Good
it('should convert snake_case to PascalCase', () => {});

// ❌ Bad
it('works', () => {});
```

### 2. Test Organization

Group related tests with `describe`:

```typescript
describe('String Utilities', () => {
  describe('toPascalCase()', () => {
    it('should handle snake_case', () => {});
    it('should handle kebab-case', () => {});
  });

  describe('toCamelCase()', () => {
    it('should handle PascalCase', () => {});
  });
});
```

### 3. Test Independence

Each test should be independent:

```typescript
// ✅ Good - each test is independent
it('should create user', () => {
  const user = createUser({ name: 'Test' });
  expect(user.name).toBe('Test');
});

it('should delete user', () => {
  const user = createUser({ name: 'Test' });
  deleteUser(user.id);
  expect(getUser(user.id)).toBeUndefined();
});
```

### 4. Cleanup

Always clean up after tests:

```typescript
describe('File Operations', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir('test');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should create file', () => {
    // Test uses tempDir
  });
});
```

### 5. Test Data

Use fixtures for complex test data:

```typescript
// ✅ Good - use fixture
const spec = loadFixture('openapi-specs/simple-api.json');

// ❌ Bad - inline large objects
const spec = { openapi: '3.0.0', paths: { /* ... */ } };
```

### 6. Assertions

Be specific with assertions:

```typescript
// ✅ Good
expect(result.name).toBe('John');
expect(result.age).toBe(30);

// ❌ Bad - too broad
expect(result).toBeTruthy();
```

### 7. Error Testing

Test both success and failure cases:

```typescript
describe('loadConfig()', () => {
  it('should load valid config', () => {
    const config = loadConfig('valid.yaml');
    expect(config).toBeDefined();
  });

  it('should throw error for invalid config', () => {
    expect(() => loadConfig('invalid.yaml')).toThrow();
  });
});
```

### 8. Coverage vs Quality

Don't chase 100% coverage at the expense of test quality:

- Focus on testing behavior, not implementation
- Test edge cases and error paths
- Avoid testing trivial code (getters/setters)

---

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check Node.js version matches CI
- Run `npm ci` instead of `npm install`
- Check for environment-specific issues

### Coverage Drops Unexpectedly

- Run `npm run test:coverage` to see what's not covered
- Check if new code was added without tests
- Review coverage HTML report for details

### Tests Are Slow

- Use `it.only()` to run single tests during development
- Check for unnecessary async operations
- Ensure proper cleanup in `afterEach`

### Flaky Tests

- Check for race conditions in async code
- Ensure tests are independent (no shared state)
- Add proper wait times for async operations

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm run test:coverage`
4. Add integration tests for user-facing features
5. Update this documentation if needed

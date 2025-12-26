# Linting and Testing Setup - Velos-TS

Complete guide for linting, formatting, and testing.

---

## 🎨 Linting & Formatting

### Tools Installed

**ESLint** - Code quality and consistency
- `eslint` v8.56.0
- `@typescript-eslint/eslint-plugin` v6.0.0
- `@typescript-eslint/parser` v6.0.0

**Prettier** - Code formatting
- `prettier` v3.1.0
- `eslint-config-prettier` v9.1.0
- `eslint-plugin-prettier` v5.1.0

### Configuration Files

#### `.eslintrc.json`
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-console": "off"
  }
}
```

#### `.prettierrc.json`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

## 📝 Available Commands

### Linting

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix
```

### Formatting

```bash
# Format code
npm run format

# Check formatting (without writing)
npm run format:check
```

### Combined Check

```bash
# Run all quality checks
npm run lint && npm run format:check && npm run type-check
```

---

## 🧪 Testing

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Coverage Reports

After running `npm run test:coverage`:

**Terminal Output:**
- Summary of coverage by file
- Overall percentages
- Pass/fail against thresholds (80%)

**HTML Report:**
- Open `coverage/index.html` in browser
- Detailed line-by-line coverage
- Visual coverage indicators

**LCOV Report:**
- `coverage/lcov.info`
- For CI/CD integration
- Used by Codecov/Coveralls

---

## 📊 Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  }
}
```

**All metrics must meet 80%+ coverage for tests to pass.**

---

## 🔍 What Gets Checked

### Linted Files
- `src/**/*.ts` - All source TypeScript files
- `tests/**/*.ts` - All test files

### Formatted Files
- `src/**/*.ts` - Source files
- `tests/**/*.ts` - Test files
- `*.md` - Root markdown files
- `docs/**/*.md` - Documentation

### Excluded Files
- `dist/` - Build output
- `node_modules/` - Dependencies
- `coverage/` - Test coverage
- `*.js`, `*.cjs`, `*.mjs` - JavaScript files
- `bin/*.js` - CLI executable

---

## ✅ Pre-Commit Checklist

Before committing code:

```bash
# 1. Format code
npm run format

# 2. Fix linting issues
npm run lint:fix

# 3. Type check
npm run type-check

# 4. Run tests
npm test

# 5. Check coverage
npm run test:coverage
```

Or run all at once:
```bash
npm run format && npm run lint:fix && npm run type-check && npm run test:coverage
```

---

## 🎯 Quality Standards

### ESLint Rules

**Enforced:**
- ✅ No unused variables (except `_` prefixed)
- ✅ No `any` types
- ✅ Consistent type imports
- ✅ Prettier formatting
- ✅ TypeScript strict checks

**Allowed:**
- ✅ Console statements (for CLI)
- ✅ Explicit any in specific cases (when truly needed)

### Prettier Rules

- Single quotes for strings
- Semicolons always
- 2-space indentation
- 100 character line width
- Trailing commas (ES5 style)
- Arrow function parentheses always

---

## 🐛 Common Issues & Fixes

### "Parsing error: Cannot read file"

**Cause:** TypeScript project reference issue

**Fix:**
```bash
# Ensure tsconfig.json is correct
npm run type-check
```

### "X is defined but never used"

**Cause:** Unused variable

**Fix:**
```typescript
// Prefix with _ if intentionally unused
function example(_unusedParam: string) {
  // ...
}
```

### "Unexpected any"

**Cause:** Using `any` type

**Fix:**
```typescript
// Use proper types
function example(data: unknown) {
  if (typeof data === 'string') {
    // Now TypeScript knows it's a string
  }
}
```

### Failed coverage threshold

**Cause:** Tests don't cover enough code

**Fix:**
- Write more tests
- Focus on untested branches
- Check coverage report: `coverage/index.html`

---

## 📈 Test Coverage Report Example

```
-----------------------------|---------|----------|---------|---------|-------------------
File                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------|---------|----------|---------|---------|-------------------
All files                    |   85.23 |    82.45 |   87.12 |   85.89 |
 src                         |     100 |      100 |     100 |     100 |
  index.ts                   |     100 |      100 |     100 |     100 |
 src/cli                     |   92.15 |    88.23 |   94.44 |   93.21 |
  index.ts                   |   95.45 |    91.66 |   96.15 |   96.00 |
 src/cli/commands            |   91.23 |    85.71 |   93.75 |   92.00 |
  generate.ts                |   90.00 |    83.33 |   92.30 |   91.11 |
  init.ts                    |   92.85 |    88.88 |   95.00 |   93.33 |
 src/core/runtime            |   96.42 |    93.75 |   97.22 |   97.05 |
  api-client.ts              |   94.73 |    90.00 |   95.00 |   95.45 |
  base-repository.ts         |   97.61 |    95.00 |   98.33 |   98.21 |
  result.ts                  |     100 |      100 |     100 |     100 |
-----------------------------|---------|----------|---------|---------|-------------------

Test Suites: 12 passed, 12 total
Tests:       105 passed, 105 total
Snapshots:   0 total
Time:        8.432 s
```

---

## 🚀 CI/CD Integration

The GitHub Actions workflow already includes:

```yaml
# .github/workflows/ci.yml
- name: Run linter
  run: npm run lint

- name: Check formatting
  run: npm run format:check

- name: Type check
  run: npm run type-check

- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v4
```

---

## 🎓 Best Practices

### Writing Tests

```typescript
// ✅ Good - Descriptive test name
it('should convert snake_case to PascalCase', () => {
  expect(toPascalCase('user_name')).toBe('UserName');
});

// ❌ Bad - Vague test name
it('works', () => {
  expect(toPascalCase('user_name')).toBe('UserName');
});
```

### Code Formatting

```typescript
// ✅ Good - Follows Prettier rules
const result = await apiClient.get<User>(
  `/users/${id}`,
  { include: 'profile' },
  { 'Content-Type': 'application/json' }
);

// ❌ Bad - Inconsistent formatting (Prettier will auto-fix)
const result = await apiClient.get<User>("/users/"+id,{include:"profile"},{"Content-Type":"application/json"});
```

### Type Safety

```typescript
// ✅ Good - Proper typing
import type { GeneratorConfig } from './types';

function processConfig(config: GeneratorConfig): void {
  // ...
}

// ❌ Bad - Using any
function processConfig(config: any): void {
  // ...
}
```

---

## 📚 Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript ESLint](https://typescript-eslint.io/)

---

## ✨ Summary

Your project now has:

- ✅ ESLint for code quality
- ✅ Prettier for consistent formatting
- ✅ Vitest for testing
- ✅ 80%+ coverage requirement
- ✅ Type checking with TypeScript
- ✅ Automated CI/CD checks

**Quality standards enforced at every commit!** 🎉

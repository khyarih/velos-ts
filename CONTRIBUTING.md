# Contributing to Velos-ts

Thank you for your interest in contributing to Velos-ts! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're here to build great software together.

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9.5.0 or higher
- **Git**
- **TypeScript** knowledge
- **OpenAPI 3.x** familiarity (helpful)

### Fork and Clone

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/velos-ts.git
cd velos-ts

# Add upstream remote
git remote add upstream https://github.com/khyarih/velos-ts.git
```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Start Development

```bash
# Watch mode (rebuilds on changes)
npm run dev

# In another terminal, link locally
npm link

# Test the CLI
velos --version
```

---

## Project Structure

```
velos-ts/
├── src/
│   ├── core/               # Core functionality
│   │   ├── runtime/        # Runtime dependencies (Result, ApiClient, BaseRepository)
│   │   ├── spec-loader/    # OpenAPI spec loading and validation
│   │   ├── extractor/      # Resource extraction
│   │   ├── analyzer/       # Type analysis
│   │   └── generator/      # Code generation
│   ├── config/             # Configuration system
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── cli/                # CLI implementation
│   └── index.ts            # Main entry point
│
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── fixtures/           # Test data
│   └── helpers/            # Test utilities
│
├── docs/                   # Documentation
├── bin/                    # CLI executable
└── templates/              # Code templates
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Update main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation
- Follow code style

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Type check
npm run type-check

# Build
npm run build

# Test CLI locally
npm link
velos --help
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"
```

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cli): add dry-run option to generate command
fix(generator): correct type inference for arrays
docs(readme): update installation instructions
test(utils): add tests for path matching
```

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template:
   - Description of changes
   - Related issues
   - Testing done
   - Screenshots (if applicable)

---

## Testing

### Writing Tests

#### Unit Tests

Place in `tests/unit/` mirroring source structure:

```typescript
// tests/unit/utils/string-utils.test.ts
import { describe, it, expect } from 'vitest';
import { toPascalCase } from '@/utils/string-utils';

describe('String Utils', () => {
  describe('toPascalCase()', () => {
    it('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('user_profile')).toBe('UserProfile');
    });
  });
});
```

#### Integration Tests

Place in `tests/integration/`:

```typescript
// tests/integration/generation.test.ts
import { describe, it, expect } from 'vitest';
import { loadOpenAPISpec } from '@/core/spec-loader/loader';
import { normalizeSpec } from '@/core/spec-loader/normalizer';

describe('Repository Generation', () => {
  it('should generate repositories from spec', () => {
    const spec = loadOpenAPISpec('./fixtures/simple-api.json');
    const normalized = normalizeSpec(spec);
    expect(normalized.operations).toBeDefined();
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage
npm run test:coverage

# Specific file
npm test -- tests/unit/utils/string-utils.test.ts
```

### Coverage Requirements

- Minimum 80% coverage for all metrics
- All new features must include tests
- Bug fixes should include regression tests

---

## Code Style

### TypeScript Guidelines

1. **Use strict mode**
   - All TypeScript strict checks enabled
   - No `any` types (use `unknown` or proper types)

2. **Type everything**
   ```typescript
   // ✅ Good
   function add(a: number, b: number): number {
     return a + b;
   }

   // ❌ Bad
   function add(a, b) {
     return a + b;
   }
   ```

3. **Use interfaces for objects**
   ```typescript
   interface User {
     id: number;
     name: string;
   }
   ```

4. **Prefer const and readonly**
   ```typescript
   const users: readonly User[] = [];
   ```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`

### Code Organization

1. **Keep files focused**
   - One concern per file
   - Max ~400 lines
   - Use barrel exports (index.ts)

2. **Group by feature**
   ```
   src/core/
   ├── spec-loader/
   │   ├── loader.ts
   │   ├── validator.ts
   │   ├── normalizer.ts
   │   └── index.ts
   ```

3. **Use meaningful names**
   ```typescript
   // ✅ Good
   function extractPathParameters(path: string): string[]

   // ❌ Bad
   function extract(p: string): string[]
   ```

### Documentation

1. **Add JSDoc comments**
   ```typescript
   /**
    * Converts a string to PascalCase
    * @param str - The string to convert
    * @returns The PascalCase string
    * @example
    * ```typescript
    * toPascalCase('user_profile') // 'UserProfile'
    * ```
    */
   export function toPascalCase(str: string): string {
     // ...
   }
   ```

2. **Document complex logic**
   ```typescript
   // Extract base path from operations by finding common prefix
   // and removing path parameters
   const basePath = findCommonPrefix(paths);
   ```

3. **Keep README up to date**
   - Update examples if API changes
   - Add new features to feature list
   - Update installation if needed

---

## Submitting Changes

### Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets threshold (`npm run test:coverage`)
- [ ] Build succeeds (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Commit messages follow convention
- [ ] No unrelated changes included
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of the changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots
If applicable

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Changelog updated
```

### Review Process

1. **Automated Checks**
   - CI must pass
   - Coverage must meet threshold
   - Build must succeed

2. **Code Review**
   - At least one approval required
   - Address review comments
   - Re-request review after changes

3. **Merge**
   - Squash and merge (for feature branches)
   - Include PR number in commit message
   - Delete branch after merge

---

## Release Process

Maintainers only. See [RELEASING.md](./docs/RELEASING.md) for details.

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create GitHub release
4. Publish to npm (automated via GitHub Actions)

---

## Getting Help

### Communication

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

### Resources

- [README](./README.md) - Project overview
- [SPEC.md](./SPEC.md) - Architecture and design
- [Documentation](./docs/) - Detailed guides
- [Tests](./tests/) - Usage examples

---

## Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes
- README (for significant contributions)

Thank you for contributing! 🎉

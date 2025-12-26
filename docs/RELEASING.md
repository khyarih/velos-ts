# Release Guide

Complete guide for releasing new versions of velos to npm.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Versioning Strategy](#versioning-strategy)
- [Release Process](#release-process)
- [Publishing to npm](#publishing-to-npm)
- [Post-Release](#post-release)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** 18+ installed
- **npm** 9.5.0+ (for provenance support)
- **Git** configured with your credentials
- **npm account** with publish access

### Required Access

- **npm registry**: Login with `npm login`
- **GitHub repository**: Push access to main branch
- **npm organization** (if publishing scoped package)

### Check Your Setup

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 9.5.0+

# Verify npm login
npm whoami      # Should show your npm username

# Verify git
git config user.name
git config user.email
```

---

## Versioning Strategy

We follow **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH

Example: 2.1.3
         │ │ │
         │ │ └─ PATCH: Bug fixes, minor improvements
         │ └─── MINOR: New features, backward compatible
         └───── MAJOR: Breaking changes
```

### When to Bump Version

#### MAJOR (x.0.0)

Breaking changes that require users to update their code:

- Changing function signatures
- Removing public APIs
- Changing default behavior
- Renaming exports
- Changing config file structure

**Example:** 2.5.3 → 3.0.0

#### MINOR (0.x.0)

New features that are backward compatible:

- Adding new CLI commands
- Adding new configuration options
- Adding new utility functions
- Improving performance
- Adding new optional parameters

**Example:** 2.5.3 → 2.6.0

#### PATCH (0.0.x)

Bug fixes and minor improvements:

- Fixing bugs
- Updating documentation
- Improving error messages
- Dependency updates (non-breaking)
- Performance optimizations

**Example:** 2.5.3 → 2.5.4

---

## Release Process

### 1. Prepare the Release

#### Update Version

```bash
# For PATCH release (bug fixes)
npm version patch

# For MINOR release (new features)
npm version minor

# For MAJOR release (breaking changes)
npm version major

# Or set specific version
npm version 2.1.0
```

This will:
- Update `package.json` version
- Create a git commit
- Create a git tag

#### Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [2.1.0] - 2024-01-15

### Added
- New CLI command for validation
- Support for OpenAPI 3.1.0

### Changed
- Improved error messages
- Updated dependencies

### Fixed
- Fixed bug in path parameter extraction
- Fixed type inference for arrays
```

### 2. Run Quality Checks

```bash
# Clean build
npm run clean

# Install dependencies
npm ci

# Run linter (when available)
npm run lint

# Type check
npm run type-check

# Run all tests
npm test

# Check test coverage
npm run test:coverage

# Build the package
npm run build

# Verify build output
ls -la dist/
```

### 3. Test the Package Locally

#### Using npm link

```bash
# In velos directory
npm link

# In a test project
npm link velos

# Test the CLI
velos --version
velos generate --help

# Test programmatic usage
# (import and use the package in test project)

# Unlink when done
npm unlink velos
```

#### Using npm pack

```bash
# Create tarball
npm pack

# This creates: velos-2.1.0.tgz

# In a test project
npm install --save-dev velos-ts-2.1.0.tgz

# Test functionality

# Uninstall when done
npm uninstall velos
```

### 4. Commit and Push

```bash
# Add changelog
git add CHANGELOG.md

# Commit
git commit -m "docs: update changelog for v2.1.0"

# Push commits
git push origin main

# Push tags
git push --tags
```

---

## Publishing to npm

### Automated Publishing (Recommended)

We use GitHub Actions for automated publishing:

#### 1. Create GitHub Release

```bash
# Via GitHub web interface:
1. Go to Releases
2. Click "Draft a new release"
3. Choose tag (e.g., v2.1.0)
4. Title: "Release v2.1.0"
5. Description: Copy from CHANGELOG
6. Click "Publish release"
```

This triggers the publish workflow which:
- Runs all tests
- Builds the package
- Publishes to npm with provenance
- Uploads release assets

#### 2. Verify Publication

```bash
# Check npm
npm view velos

# Check version
npm view velos version

# Check latest
npm info velos dist-tags
```

### Manual Publishing

If needed, you can publish manually:

```bash
# Ensure you're logged in
npm whoami

# Dry run (see what would be published)
npm publish --dry-run

# Publish (public package)
npm publish --access public

# With provenance (recommended)
npm publish --provenance --access public
```

### First-Time Publishing

For the very first publish:

```bash
# Publish as public package
npm publish --access public

# If scoped package (@username/velos)
npm publish --access public
```

---

## Post-Release

### 1. Verify npm Package

```bash
# View package info
npm view velos

# Check files included
npm view velos files

# Check exports
npm view velos exports

# Install in test project
npm install --save-dev velos-ts@latest
```

### 2. Update Documentation

- Update README badges (if using shields.io)
- Update documentation site (if applicable)
- Post announcement (Twitter, blog, etc.)

### 3. Create GitHub Release Notes

If not using automated release:

1. Go to GitHub Releases
2. Click "Draft a new release"
3. Select the tag
4. Copy changelog content
5. Add any additional notes
6. Publish

### 4. Announce Release

Consider announcing on:

- GitHub Discussions
- Twitter
- Dev.to
- Reddit (r/typescript, r/javascript)
- Your blog

---

## Troubleshooting

### "You do not have permission to publish"

**Cause:** Not logged in or no publish access

**Solution:**
```bash
npm login
npm whoami
```

### "Cannot publish over existing version"

**Cause:** Version already published

**Solution:**
```bash
# Bump version
npm version patch

# Or manually edit package.json
```

### "Package name too similar to existing package"

**Cause:** npm name squatting protection

**Solution:**
- Choose a different name
- Or use scoped package: `@username/velos`

### "Failed to publish: 403 Forbidden"

**Cause:** Package might be owned by someone else

**Solution:**
```bash
# Check if name is available
npm view velos

# Use scoped name if needed
# Update package.json: "@khyarih/velos-ts"
```

### Build Fails in CI

**Cause:** Build or tests failing

**Solution:**
1. Run locally: `npm run build && npm test`
2. Check CI logs for specific error
3. Fix the issue
4. Push fix
5. Re-release

### Package Size Too Large

**Cause:** Including unnecessary files

**Solution:**
```bash
# Check what would be published
npm pack --dry-run

# Review .npmignore
# Ensure src/, tests/ are excluded

# Check packed size
npm pack
tar -tzf velos-*.tgz
```

---

## Release Checklist

Before releasing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets threshold (`npm run test:coverage`)
- [ ] Build succeeds (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Version bumped (`npm version <type>`)
- [ ] CHANGELOG.md updated
- [ ] README.md up to date
- [ ] Changes committed and pushed
- [ ] Tags pushed (`git push --tags`)
- [ ] Package tested locally (`npm link` or `npm pack`)
- [ ] GitHub release created
- [ ] npm package published
- [ ] Publication verified (`npm view velos`)

---

## Version History

Keep track of releases in CHANGELOG.md:

```markdown
# Changelog

## [Unreleased]

### Added
- Feature X

## [2.1.0] - 2024-01-15

### Added
- New CLI command

### Fixed
- Bug fix

## [2.0.0] - 2024-01-01

### Changed
- **BREAKING:** Renamed config option
```

---

## Automation

### GitHub Actions Workflow

The `.github/workflows/publish.yml` handles:

1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests
5. Build package
6. Publish to npm
7. Upload release assets

### Required Secrets

Add to GitHub repository settings:

- `NPM_TOKEN`: npm authentication token
  - Get from: https://www.npmjs.com/settings/tokens
  - Type: Automation token
  - Add to: Settings > Secrets > Actions

---

## Best Practices

### Before Release

1. **Test thoroughly**
   - Run full test suite
   - Test in real projects
   - Check all Node.js versions (18, 20, 22)

2. **Review changes**
   - Read all commits since last release
   - Ensure changelog is complete
   - Verify no unintended changes

3. **Check dependencies**
   - Update outdated dependencies
   - Test with updated deps
   - Check for security vulnerabilities

### During Release

1. **Use semantic versioning**
   - Follow SemVer strictly
   - Don't skip versions
   - Use pre-release for beta: `2.1.0-beta.1`

2. **Document everything**
   - Update CHANGELOG
   - Update README if needed
   - Add migration guide for breaking changes

3. **Verify publication**
   - Check npm page
   - Test install from npm
   - Verify all exports work

### After Release

1. **Monitor issues**
   - Watch for bug reports
   - Respond to questions
   - Prepare hotfix if critical bug found

2. **Gather feedback**
   - Ask users for feedback
   - Track adoption metrics
   - Plan next release

---

## Emergency Hotfix

For critical bugs in production:

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug main

# Fix the bug
# ... make changes ...

# Test thoroughly
npm test

# Bump patch version
npm version patch

# Commit and push
git add .
git commit -m "fix: critical bug in X"
git push origin hotfix/critical-bug

# Create PR and merge to main

# Tag and publish
git checkout main
git pull
npm publish --access public

# Backport to develop if needed
```

---

## Resources

- [Semantic Versioning](https://semver.org/)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## Support

If you encounter issues during release:

1. Check this guide
2. Search existing GitHub issues
3. Create new issue with `release` label
4. Contact maintainers

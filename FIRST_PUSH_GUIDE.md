# First Push Guide - Velos-TS

Complete guide for pushing the velos-ts project to GitHub for the first time.

---

## Pre-Push Checklist

### ✅ Package Configuration
- [x] Package name: `velos-ts`
- [x] Version: `2.0.0`
- [x] Author: `Hamza Khyari <hamza.khyari.dev@gmail.com>`
- [x] Repository URL: `https://github.com/khyarih/velos-ts`
- [x] Binary command: `velos`
- [x] License: MIT

### ✅ Documentation
- [x] README.md updated with correct package name
- [x] CHANGELOG.md created with v2.0.0 release notes
- [x] CONTRIBUTING.md created
- [x] LICENSE file created
- [x] All URLs point to `khyarih/velos-ts`

### ✅ Source Code
- [x] CLI command renamed to `velos`
- [x] Config file names updated to `velos.config.yaml`
- [x] Import paths updated to `velos-ts/runtime`
- [x] All error messages reference `velos-ts`

### ✅ Build & Test
- [x] Build configuration (tsup) ready
- [x] Test suite complete (100+ tests)
- [x] CI/CD workflows configured
- [x] Validation script ready

---

## Step-by-Step Push Instructions

### 1. Initialize Git Repository

```bash
cd /home/hamza/WorkSpace/khyari.com/repo-generator
git init
```

### 2. Create Initial Commit

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "feat: initial release of velos-ts v2.0.0

- Modular architecture with 50+ focused modules
- YAML-based configuration system
- Beautiful CLI with colored output
- Comprehensive testing (100+ tests, 80%+ coverage)
- Dual build support (CommonJS + ESM)
- Complete documentation
- GitHub Actions CI/CD workflows

🎉 Ready for production use!"
```

### 3. Create GitHub Repository

**Option A: Via GitHub CLI (if installed)**
```bash
gh repo create velos-ts --public --source=. --remote=origin
```

**Option B: Via GitHub Web Interface**
1. Go to: https://github.com/new
2. Repository name: `velos-ts`
3. Description: `Generate type-safe TypeScript repositories from OpenAPI specifications`
4. Visibility: **Public**
5. **Do NOT** initialize with README, .gitignore, or license (we have them)
6. Click "Create repository"

### 4. Add Remote and Push

```bash
# Add GitHub remote
git remote add origin https://github.com/khyarih/velos-ts.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main

# Push tags (if any)
git push --tags
```

### 5. Verify Push

Visit: https://github.com/khyarih/velos-ts

**Check:**
- [  ] Repository is visible
- [  ] README displays correctly
- [  ] All files are present
- [  ] License is recognized
- [  ] Description is set

---

## Post-Push Setup

### 1. Configure Repository Settings

**On GitHub:**
1. Go to Settings → General
2. Features:
   - ✅ Issues
   - ✅ Discussions (optional)
   - ✅ Projects (optional)
3. Pull Requests:
   - ✅ Allow squash merging
   - ✅ Automatically delete head branches
4. Save changes

### 2. Add Repository Topics

**On GitHub main page:**
- Click ⚙️ next to "About"
- Add topics:
  - `openapi`
  - `typescript`
  - `code-generator`
  - `repository-pattern`
  - `api-client`
  - `cli`
  - `type-safe`
  - `openapi-typescript`
- Save

### 3. Configure Branch Protection (Optional)

**Settings → Branches → Add rule:**
- Branch name pattern: `main`
- Protect matching branches:
  - ✅ Require pull request before merging
  - ✅ Require status checks to pass (CI tests)
  - ✅ Require conversation resolution before merging

### 4. Enable GitHub Actions

**Workflows are already configured:**
- `.github/workflows/ci.yml` - Tests on every push
- `.github/workflows/publish.yml` - Auto-publish to npm on release
- `.github/workflows/scheduled.yml` - Weekly health checks

**To enable:**
- Push will automatically trigger CI
- Check: Actions tab on GitHub

### 5. Add Secrets for npm Publishing

**Settings → Secrets and variables → Actions:**

**Add secret:**
- Name: `NPM_TOKEN`
- Value: Your npm authentication token

**To get npm token:**
```bash
# Login to npm
npm login

# Create automation token
npm token create --read-only=false
```

Copy the token and add it to GitHub secrets.

---

## Verification Steps

### Local Verification

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Build
npm run build

# 3. Run tests
npm test

# 4. Validate package
npm run validate

# 5. Test CLI
npx velos --version
npx velos --help
```

**Expected Output:**
- Build succeeds
- All tests pass
- Validation passes (12/12 checks)
- CLI shows version 2.0.0

### GitHub Verification

```bash
# 1. Clone fresh copy
cd /tmp
git clone https://github.com/khyarih/velos-ts.git
cd velos-ts

# 2. Install and test
npm install
npm test
npm run build

# 3. Verify CLI works
npx velos --version
```

---

## Create First Release

### 1. Create Git Tag

```bash
git tag -a v2.0.0 -m "Release v2.0.0

Initial public release of velos-ts.

Major Features:
- Type-safe repository generation from OpenAPI specs
- Beautiful CLI with colored output
- YAML-based configuration
- Result pattern for error handling
- 100+ tests with 80%+ coverage
- Dual module support (CJS + ESM)

See CHANGELOG.md for complete details."

git push origin v2.0.0
```

### 2. Create GitHub Release

**Via GitHub Web:**
1. Go to: https://github.com/khyarih/velos-ts/releases/new
2. Tag: `v2.0.0`
3. Release title: `v2.0.0 - Initial Release`
4. Description: Copy from CHANGELOG.md
5. Check "Set as the latest release"
6. Click "Publish release"

**This will trigger:**
- GitHub Actions publish workflow
- Automatic npm publishing (if secrets configured)

---

## npm Publishing

### Manual Publish (First Time)

```bash
# 1. Ensure you're logged in
npm whoami

# 2. Publish
npm publish --access public

# With provenance (recommended)
npm publish --access public --provenance
```

### Verify Publication

```bash
# Check on npm
npm view velos-ts

# Install and test
cd /tmp
mkdir test-velos
cd test-velos
npm init -y
npm install velos-ts
npx velos --version
```

---

## Post-Publication Tasks

### 1. Update Package Badges

**In README.md**, verify badges work:
- npm version: https://img.shields.io/npm/v/velos-ts.svg
- License: Already correct
- Node.js version: Already correct

### 2. Share the Release

**Announce on:**
- Twitter/X
- Dev.to
- Reddit (r/typescript, r/javascript)
- LinkedIn
- Your blog

**Sample announcement:**
```
🎉 Introducing Velos-TS v2.0.0!

Generate type-safe TypeScript repositories from OpenAPI specs.

✨ Features:
• Zero manual type definitions
• Beautiful CLI
• Result pattern for errors
• 80%+ test coverage
• Dual module support

npm install --save-dev velos-ts

https://github.com/khyarih/velos-ts
```

### 3. Monitor

- Watch GitHub for issues/stars
- Monitor npm downloads: https://npmtrends.com/velos-ts
- Check CI/CD status

---

## Rollback Plan

If something goes wrong:

### Unpublish from npm (within 72 hours)

```bash
npm unpublish velos-ts@2.0.0
```

**Note:** After 72 hours, you cannot unpublish. Use deprecate instead:

```bash
npm deprecate velos-ts@2.0.0 "This version has issues, use @latest"
```

### Revert Git Tag

```bash
git tag -d v2.0.0
git push origin :refs/tags/v2.0.0
```

### Delete GitHub Release

Go to releases page and delete the release.

---

## Troubleshooting

### "remote: Repository not found"

**Fix:**
```bash
# Check remote URL
git remote -v

# Update if needed
git remote set-url origin https://github.com/khyarih/velos-ts.git
```

### "You do not have permission to publish"

**Fix:**
```bash
# Login to npm
npm login

# Verify
npm whoami
```

### CI Fails on GitHub

**Fix:**
1. Check Actions tab for error details
2. Fix the issue locally
3. Commit and push fix
4. CI will re-run automatically

---

## Quick Reference

### Essential Commands

```bash
# Build
npm run build

# Test
npm test

# Validate
npm run validate

# Publish
npm publish --access public --provenance

# Create tag
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

### Important URLs

- Repository: https://github.com/khyarih/velos-ts
- npm package: https://www.npmjs.com/package/velos-ts
- Issues: https://github.com/khyarih/velos-ts/issues
- Actions: https://github.com/khyarih/velos-ts/actions

---

## Success Criteria

✅ **Ready to push when:**
- All tests pass locally
- Build succeeds
- Package validates (12/12 checks)
- Documentation is complete
- LICENSE file exists
- .gitignore is correct
- All URLs point to correct repository

✅ **Successfully pushed when:**
- Repository visible on GitHub
- README displays correctly
- GitHub Actions CI passes
- Package published to npm
- CLI works when installed from npm

---

**Good luck with your first push! 🚀**

If you encounter any issues, refer to:
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [docs/RELEASING.md](./docs/RELEASING.md)
- [GitHub Issues](https://github.com/khyarih/velos-ts/issues)

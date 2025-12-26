/**
 * Tests for Configuration Loader
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { loadConfig, findConfigFile, mergeConfigs } from '@/config/config-loader';
import { createTempDir, cleanupTempDir } from '@tests/helpers/test-utils';

describe('Configuration Loader', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir('config-loader-test');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('findConfigFile()', () => {
    it('should find velos.config.yaml', () => {
      const configPath = resolve(tempDir, 'velos.config.yaml');
      writeFileSync(configPath, 'openApiSpecPath: ./api.json');

      const found = findConfigFile(tempDir);
      expect(found).toBe(configPath);
    });

    it('should find velos.config.yml', () => {
      const configPath = resolve(tempDir, 'velos.config.yml');
      writeFileSync(configPath, 'openApiSpecPath: ./api.json');

      const found = findConfigFile(tempDir);
      expect(found).toBe(configPath);
    });

    it('should find .velos.yaml', () => {
      const configPath = resolve(tempDir, '.velos.yaml');
      writeFileSync(configPath, 'openApiSpecPath: ./api.json');

      const found = findConfigFile(tempDir);
      expect(found).toBe(configPath);
    });

    it('should prioritize velos.config.yaml over others', () => {
      writeFileSync(resolve(tempDir, 'velos.config.yaml'), 'openApiSpecPath: ./api.json');
      writeFileSync(resolve(tempDir, '.velos.yaml'), 'openApiSpecPath: ./other.json');

      const found = findConfigFile(tempDir);
      expect(found).toBe(resolve(tempDir, 'velos.config.yaml'));
    });

    it('should search parent directories', () => {
      const parentDir = tempDir;
      const childDir = resolve(tempDir, 'src', 'components');
      mkdirSync(childDir, { recursive: true });

      const configPath = resolve(parentDir, 'velos.config.yaml');
      writeFileSync(configPath, 'openApiSpecPath: ./api.json');

      const found = findConfigFile(childDir);
      expect(found).toBe(configPath);
    });

    it('should return undefined if no config found', () => {
      const found = findConfigFile(tempDir);
      expect(found).toBeUndefined();
    });
  });

  describe('loadConfig()', () => {
    it('should load valid YAML config', () => {
      const configPath = resolve(tempDir, 'velos.config.yaml');
      const configContent = `
openApiSpecPath: ./api-docs.json
outputDir: ./src/repositories
apiSpecTypesPath: '@/api/api-spec'
overwrite: true
      `;
      writeFileSync(configPath, configContent);

      const config = loadConfig({ configPath });

      expect(config.openApiSpecPath).toBe('./api-docs.json');
      expect(config.outputDir).toBe('./src/repositories');
      expect(config.apiSpecTypesPath).toBe('@/api/api-spec');
      expect(config.overwrite).toBe(true);
    });

    it('should load config with arrays', () => {
      const configPath = resolve(tempDir, 'velos.config.yaml');
      const configContent = `
openApiSpecPath: ./api.json
outputDir: ./output
apiSpecTypesPath: '@/api'
includePatterns:
  - /api/v1/**
  - /api/v2/**
excludePatterns:
  - /api/v1/admin/**
      `;
      writeFileSync(configPath, configContent);

      const config = loadConfig({ configPath });

      expect(config.includePatterns).toEqual(['/api/v1/**', '/api/v2/**']);
      expect(config.excludePatterns).toEqual(['/api/v1/admin/**']);
    });

    it('should throw error for non-existent config file', () => {
      const configPath = resolve(tempDir, 'non-existent.yaml');

      expect(() => loadConfig({ configPath })).toThrow();
    });

    it('should throw error for invalid YAML', () => {
      const configPath = resolve(tempDir, 'invalid.yaml');
      writeFileSync(configPath, 'invalid: yaml: content: [[[');

      expect(() => loadConfig({ configPath })).toThrow();
    });

    it('should validate required fields', () => {
      const configPath = resolve(tempDir, 'incomplete.yaml');
      writeFileSync(configPath, 'overwrite: true'); // Missing required fields

      expect(() => loadConfig({ configPath })).toThrow();
    });

    it('should apply default values', () => {
      const configPath = resolve(tempDir, 'minimal.yaml');
      const configContent = `
openApiSpecPath: ./api.json
outputDir: ./output
apiSpecTypesPath: '@/api'
      `;
      writeFileSync(configPath, configContent);

      const config = loadConfig({ configPath });

      // Should have default values
      expect(config.overwrite).toBeDefined();
      expect(config.generateInterfaces).toBeDefined();
      expect(config.generateTypeAliases).toBeDefined();
    });
  });

  describe('mergeConfigs()', () => {
    it('should merge configs with priority: overrides > file > defaults', () => {
      const defaults = {
        openApiSpecPath: './default.json',
        outputDir: './default-output',
        apiSpecTypesPath: '@/default',
        overwrite: false,
      };

      const file = {
        openApiSpecPath: './file.json',
        outputDir: './file-output',
        overwrite: true,
      };

      const overrides = {
        outputDir: './override-output',
      };

      const merged = mergeConfigs(defaults, file, overrides);

      expect(merged.openApiSpecPath).toBe('./file.json'); // from file
      expect(merged.outputDir).toBe('./override-output'); // from overrides
      expect(merged.apiSpecTypesPath).toBe('@/default'); // from defaults
      expect(merged.overwrite).toBe(true); // from file
    });

    it('should merge arrays correctly', () => {
      const defaults = {
        includePatterns: ['/api/**'],
      };

      const file = {
        includePatterns: ['/api/v1/**', '/api/v2/**'],
        excludePatterns: ['/api/admin/**'],
      };

      const overrides = {
        excludePatterns: ['/api/test/**'],
      };

      const merged = mergeConfigs(defaults, file, overrides);

      expect(merged.includePatterns).toEqual(['/api/v1/**', '/api/v2/**']);
      expect(merged.excludePatterns).toEqual(['/api/test/**']);
    });

    it('should handle undefined values', () => {
      const defaults = {
        openApiSpecPath: './default.json',
        outputDir: './output',
        apiSpecTypesPath: '@/api',
      };

      const merged = mergeConfigs(defaults, {}, {});

      expect(merged.openApiSpecPath).toBe('./default.json');
      expect(merged.outputDir).toBe('./output');
    });

    it('should preserve boolean false values', () => {
      const defaults = {
        overwrite: true,
        generateInterfaces: true,
      };

      const overrides = {
        overwrite: false,
        generateInterfaces: false,
      };

      const merged = mergeConfigs(defaults, {}, overrides);

      expect(merged.overwrite).toBe(false);
      expect(merged.generateInterfaces).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should auto-discover and load config', () => {
      const configPath = resolve(tempDir, 'velos.config.yaml');
      const configContent = `
openApiSpecPath: ./api.json
outputDir: ./repos
apiSpecTypesPath: '@/api'
      `;
      writeFileSync(configPath, configContent);

      // Change to temp directory
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const config = loadConfig({});
        expect(config.openApiSpecPath).toBe('./api.json');
        expect(config.outputDir).toBe('./repos');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should load and merge with overrides', () => {
      const configPath = resolve(tempDir, 'velos.config.yaml');
      const configContent = `
openApiSpecPath: ./api.json
outputDir: ./repos
apiSpecTypesPath: '@/api'
overwrite: false
      `;
      writeFileSync(configPath, configContent);

      const config = loadConfig({
        configPath,
        overrides: {
          outputDir: './custom-output',
          overwrite: true,
        },
      });

      expect(config.openApiSpecPath).toBe('./api.json');
      expect(config.outputDir).toBe('./custom-output');
      expect(config.overwrite).toBe(true);
    });
  });
});

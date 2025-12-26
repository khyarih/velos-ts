import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    index: 'src/index.ts',
    'core/runtime/index': 'src/core/runtime/index.ts',
    'cli/index': 'src/cli/index.ts',
  },

  // Output formats
  format: ['cjs', 'esm'],

  // Generate declaration files
  dts: true,

  // Code splitting for better tree-shaking
  splitting: true,

  // Source maps for debugging
  sourcemap: true,

  // Clean output directory before build
  clean: true,

  // Target environment
  target: 'node18',

  // External dependencies (don't bundle)
  external: [
    'commander',
    'chalk',
    'ora',
    'js-yaml',
    'zod',
  ],

  // Don't minify for better debugging
  minify: false,

  // Keep comments (JSDoc, etc.)
  keepNames: true,

  // Tree shaking
  treeshake: true,

  // Platform
  platform: 'node',

  // Shims for ESM
  shims: true,
});

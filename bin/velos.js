#!/usr/bin/env node

/**
 * Velos-TS CLI
 * Entry point for the velos command-line tool
 */

// Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0], 10);

if (majorVersion < 18) {
  console.error('Error: velos-ts requires Node.js 18 or higher');
  console.error(`Current version: ${nodeVersion}`);
  console.error('Please upgrade Node.js: https://nodejs.org/');
  process.exit(1);
}

// Run the CLI
require('../dist/cli/index.cjs').run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

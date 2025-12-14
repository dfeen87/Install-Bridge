#!/usr/bin/env node

'use strict';

// Import core logic
const core = require('../src/core/core');

// Basic CLI handling
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
Install Bridge

Usage:
  install-bridge init
  install-bridge validate
  install-bridge badge

This tool generates portable install badges for repositories.
`);
  process.exit(0);
}

// Example command dispatch
const command = args[0];

try {
  switch (command) {
    case 'init':
      core.init();
      break;

    case 'validate':
      core.validate();
      break;

    case 'badge':
      core.generateBadge();
      break;

    default:
      console.error(\`Unknown command: \${command}\`);
      process.exit(1);
  }
} catch (err) {
  console.error('Install Bridge error:', err.message);
  process.exit(1);
}

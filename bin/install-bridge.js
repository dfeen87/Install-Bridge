#!/usr/bin/env node
// ============================================================================
// INSTALL BRIDGE - CLI
// Lightweight local interface for Install Bridge
// Zero dependencies, config-driven
// ============================================================================

'use strict';

const fs = require('fs');
const path = require('path');

// Import core logic
const core = require('../src/core/core');

// ----------------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------------

const CONFIG_FILE = 'install-bridge.json';
const BADGE_FILE = 'install-badge.svg';

// ----------------------------------------------------------------------------
// UTILITIES
// ----------------------------------------------------------------------------

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`✔ ${message}`);
}

function readConfig() {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    fail(`Missing ${CONFIG_FILE} in current directory`);
  }

  const content = fs.readFileSync(configPath, 'utf8');
  const result = core.parseConfig(content);

  if (!result.success) {
    fail(`Invalid config:\n- ${result.errors.join('\n- ')}`);
  }

  return result.config;
}

function writeBadge(svg) {
  fs.writeFileSync(BADGE_FILE, svg, 'utf8');
  log(`Generated ${BADGE_FILE}`);
}

function printSnippets(snippets) {
  console.log('\n--- Markdown ---\n');
  console.log(snippets.markdown);

  console.log('\n--- HTML ---\n');
  console.log(snippets.html);
}

// ----------------------------------------------------------------------------
// COMMANDS
// ----------------------------------------------------------------------------

function cmdInit() {
  const appName = process.argv[3] || 'MyApp';

  if (fs.existsSync(CONFIG_FILE)) {
    fail(`${CONFIG_FILE} already exists`);
  }

  const template = core.createTemplate(appName);

  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(template, null, 2),
    'utf8'
  );

  log(`Created ${CONFIG_FILE}`);
}

function cmdValidate() {
  const config = readConfig();
  const result = core.validateConfig(config);

  if (!result.valid) {
    fail(`Config invalid:\n- ${result.errors.join('\n- ')}`);
  }

  log('Config is valid');
}

function cmdGenerate() {
  const config = readConfig();

  const svg = core.generateBadge(config);
  writeBadge(svg);

  const snippets = core.generateSnippets(config);
  printSnippets(snippets);
}

// ----------------------------------------------------------------------------
// ENTRY
// ----------------------------------------------------------------------------

const command = process.argv[2];

switch (command) {
  case 'init':
    cmdInit();
    break;

  case 'validate':
    cmdValidate();
    break;

  case 'generate':
    cmdGenerate();
    break;

  case '--help':
  case '-h':
  case 'help':
  default:
    console.log(`
Install Bridge

Usage:
  install-bridge init [AppName]   Create install-bridge.json
  install-bridge validate         Validate configuration
  install-bridge generate         Generate badge and snippets

Files:
  - install-bridge.json
  - install-badge.svg
`);
    process.exit(0);
}

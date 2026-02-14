#!/usr/bin/env node
// ============================================================================
// INSTALL BRIDGE - CLI
// Lightweight local interface for Install Bridge
// Zero dependencies, config-driven
// ============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const core = require('../src/core/core');

const CONFIG_FILE = 'install-bridge.json';
const BADGE_FILE = 'install-badge.svg';

// ============================================================================
// UTILITIES
// ============================================================================

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

function detectGitRepo() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    const appName = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim().split('/').pop();

    let owner, repo;
    if (remoteUrl.includes('github.com')) {
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (match) {
        owner = match[1];
        repo = match[2];
      }
    }

    return { remoteUrl, appName, owner, repo };
  } catch {
    return null;
  }
}

// ============================================================================
// COMMANDS
// ============================================================================

function cmdInit() {
  if (fs.existsSync(CONFIG_FILE)) {
    fail(`${CONFIG_FILE} already exists`);
  }

  const gitInfo = detectGitRepo();
  const appName = process.argv[3] || gitInfo?.appName || 'MyApp';
  
  let template = core.createTemplate(appName);

  if (gitInfo?.owner && gitInfo?.repo) {
    const repoUrl = `https://github.com/${gitInfo.owner}/${gitInfo.repo}`;
    template.installers = {
      darwin: `${repoUrl}/releases/latest/download/${appName}-macOS.dmg`,
      win32: `${repoUrl}/releases/latest/download/${appName}-windows.exe`,
      linux: `${repoUrl}/releases/latest/download/${appName}-linux.AppImage`
    };
    template.homepage = repoUrl;
    template.fallback = `${repoUrl}/releases`;
  }

  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(template, null, 2),
    'utf8'
  );

  log(`Created ${CONFIG_FILE}`);

  if (gitInfo?.owner && gitInfo?.repo) {
    console.log(`\n💡 Detected GitHub repository: ${gitInfo.owner}/${gitInfo.repo}`);
    console.log(`   URLs have been auto-populated with your repository info.`);
  } else {
    console.log(`\n💡 No git repository detected.`);
    console.log(`   Edit ${CONFIG_FILE} to update placeholder URLs.`);
  }

  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review and edit ${CONFIG_FILE} as needed`);
  console.log(`   2. Update installer URLs to match your release assets`);
  console.log(`   3. Run: install-bridge generate`);
}

function cmdGenerate() {
  const config = readConfig();

  const svg = core.generateBadge(config);
  writeBadge(svg);

  const snippets = core.generateSnippets(config);
  printSnippets(snippets);

  console.log('\n📋 Copy the snippet above and paste it into your README.md or any website\n');
  console.log(`💡 Badge file created: ${BADGE_FILE}`);
  console.log(`   Commit this file to your repository to use the badge.`);
}

function cmdValidate() {
  const config = readConfig();
  const result = core.validateConfig(config);

  if (!result.valid) {
    fail(`Config invalid:\n- ${result.errors.join('\n- ')}`);
  }

  log('Config is valid');
}

function cmdSetup() {
  if (fs.existsSync(CONFIG_FILE)) {
    console.log(`⚠️  ${CONFIG_FILE} already exists.`);
    console.log(`   Running generate command instead...`);
    cmdGenerate();
    return;
  }

  const gitInfo = detectGitRepo();
  const appName = process.argv[3] || gitInfo?.appName || 'MyApp';
  
  let template = core.createTemplate(appName);

  if (gitInfo?.owner && gitInfo?.repo) {
    const repoUrl = `https://github.com/${gitInfo.owner}/${gitInfo.repo}`;
    template.installers = {
      darwin: `${repoUrl}/releases/latest/download/${appName}-macOS.dmg`,
      win32: `${repoUrl}/releases/latest/download/${appName}-windows.exe`,
      linux: `${repoUrl}/releases/latest/download/${appName}-linux.AppImage`
    };
    template.homepage = repoUrl;
    template.fallback = `${repoUrl}/releases`;
  }

  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(template, null, 2),
    'utf8'
  );

  log(`Created ${CONFIG_FILE}`);

  if (gitInfo?.owner && gitInfo?.repo) {
    console.log(`\n💡 Detected GitHub repository: ${gitInfo.owner}/${gitInfo.repo}`);
    console.log(`   URLs have been auto-populated with your repository info.`);
  } else {
    console.log(`\n💡 No git repository detected.`);
    console.log(`   Edit ${CONFIG_FILE} to update placeholder URLs before continuing.`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Edit ${CONFIG_FILE} to update installer URLs`);
    console.log(`   2. Run: install-bridge generate`);
    return;
  }

  console.log(`\n🚀 Generating badge...`);

  const config = template;
  const svg = core.generateBadge(config);
  writeBadge(svg);

  const snippets = core.generateSnippets(config);
  printSnippets(snippets);

  console.log('\n✨ All done! Your install badge is ready.\n');
  console.log(`📋 Copy the Markdown snippet above and paste it into your README.md or any website`);
  console.log(`\n💡 Don't forget to:`);
  console.log(`   1. Commit ${CONFIG_FILE} and ${BADGE_FILE} to your repository`);
  console.log(`   2. Update installer URLs in ${CONFIG_FILE} to match your actual release assets`);
}

// ============================================================================
// ENTRY
// ============================================================================

const command = process.argv[2];

switch (command) {
  case 'setup':
    cmdSetup();
    break;

  case 'init':
    cmdInit();
    break;

  case 'generate':
    cmdGenerate();
    break;

  case 'validate':
    cmdValidate();
    break;

  default:
    console.log(`
Install Bridge CLI

Create install badges for any website or README file:

Usage:
  install-bridge setup [AppName]      One-step: create config and generate badge (recommended)
  install-bridge init [AppName]       Create install-bridge.json with auto-detected repo info
  install-bridge generate             Generate badge and embed snippets
  install-bridge validate             Validate your configuration

Quick Start (Easiest):
  install-bridge setup YourApp

Or Step by Step:
  1. Run 'install-bridge init YourApp' in your repository
  2. Edit install-bridge.json to customize installer URLs
  3. Run 'install-bridge generate' to create your badge
  4. Copy the Markdown snippet to your README.md or any website

Files Created:
  - install-bridge.json    Configuration for your install badge
  - install-badge.svg      The badge image to embed on any website

Learn more: https://github.com/dfeen87/install-bridge
`);
    process.exit(0);
}

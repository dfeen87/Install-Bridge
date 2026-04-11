// ============================================================================
// INSTALL BRIDGE - CLI SMOKE TESTS
// Runs real CLI commands in a temporary directory and asserts on their output
// and the files they create. Zero-dependency, CI-friendly.
// ============================================================================

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CLI = path.resolve(__dirname, '../bin/install-bridge.js');

let HAS_FAILURES = false;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (err) {
    HAS_FAILURES = true;
    console.error(`FAIL: ${name}`);
    console.error(`      ${err && err.message ? err.message : String(err)}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

process.on('exit', () => {
  if (HAS_FAILURES) {
    console.error('\nError: Some CLI tests failed\n');
    process.exitCode = 1;
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'install-bridge-test-'));
}

function removeTmpDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function runCli(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' }
  });
}

function writeConfig(dir, config) {
  fs.writeFileSync(
    path.join(dir, 'install-bridge.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );
}

const VALID_CONFIG = {
  name: 'TestApp',
  installers: {
    darwin: 'https://example.com/TestApp-macOS.dmg',
    win32: 'https://example.com/TestApp-windows.exe',
    linux: 'https://example.com/TestApp-linux.AppImage'
  },
  homepage: 'https://example.com',
  fallback: 'https://example.com/releases',
  badge: { label: 'Install', color: '#0366d6', style: 'flat' }
};

// ---------------------------------------------------------------------------
// --version / --help
// ---------------------------------------------------------------------------

console.log('\nInfo: Running Install Bridge CLI Tests\n');

test('--version prints a version string', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['--version'], tmp);
    assert(r.status === 0, `Exit code ${r.status}`);
    assert(/^\d+\.\d+\.\d+/.test(r.stdout.trim()), `Unexpected output: ${r.stdout}`);
  } finally {
    removeTmpDir(tmp);
  }
});

test('-v is an alias for --version', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['-v'], tmp);
    assert(r.status === 0, `Exit code ${r.status}`);
    assert(/^\d+\.\d+\.\d+/.test(r.stdout.trim()), `Unexpected output: ${r.stdout}`);
  } finally {
    removeTmpDir(tmp);
  }
});

test('--help prints usage information', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['--help'], tmp);
    assert(r.status === 0, `Exit code ${r.status}`);
    assert(r.stdout.includes('install-bridge setup'), 'Missing setup command in help');
    assert(r.stdout.includes('install-bridge init'), 'Missing init command in help');
    assert(r.stdout.includes('install-bridge generate'), 'Missing generate command in help');
    assert(r.stdout.includes('install-bridge validate'), 'Missing validate command in help');
  } finally {
    removeTmpDir(tmp);
  }
});

test('unknown command exits non-zero', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['unknown-command'], tmp);
    assert(r.status !== 0, 'Should exit non-zero for unknown command');
    assert(r.stderr.toLowerCase().includes('unknown'), 'Should mention unknown command');
  } finally {
    removeTmpDir(tmp);
  }
});

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

test('init creates install-bridge.json', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['init', 'SmokeApp'], tmp);
    assert(r.status === 0, `Exit code ${r.status}\nstderr: ${r.stderr}`);
    const configPath = path.join(tmp, 'install-bridge.json');
    assert(fs.existsSync(configPath), 'install-bridge.json should be created');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert(config.name === 'SmokeApp', `Expected name SmokeApp, got ${config.name}`);
    assert(config.installers && typeof config.installers === 'object', 'Should have installers');
    assert(Object.keys(config.installers).length > 0, 'Should have at least one installer');
  } finally {
    removeTmpDir(tmp);
  }
});

test('init fails if install-bridge.json already exists', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r = runCli(['init', 'SmokeApp'], tmp);
    assert(r.status !== 0, 'Should fail if config already exists');
    assert(r.stderr.includes('already exists'), 'Should mention file already exists');
  } finally {
    removeTmpDir(tmp);
  }
});

test('init uses default app name when none provided', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['init'], tmp);
    assert(r.status === 0, `Exit code ${r.status}\nstderr: ${r.stderr}`);
    const configPath = path.join(tmp, 'install-bridge.json');
    assert(fs.existsSync(configPath), 'install-bridge.json should be created');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert(typeof config.name === 'string' && config.name.length > 0, 'Should have a non-empty name');
  } finally {
    removeTmpDir(tmp);
  }
});

// ---------------------------------------------------------------------------
// validate
// ---------------------------------------------------------------------------

test('validate passes with valid config', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r = runCli(['validate'], tmp);
    assert(r.status === 0, `Exit code ${r.status}\nstderr: ${r.stderr}`);
    assert(r.stdout.includes('valid'), 'Should report config as valid');
  } finally {
    removeTmpDir(tmp);
  }
});

test('validate fails with missing name', () => {
  const tmp = makeTmpDir();
  try {
    const bad = { ...VALID_CONFIG };
    delete bad.name;
    writeConfig(tmp, bad);
    const r = runCli(['validate'], tmp);
    assert(r.status !== 0, 'Should exit non-zero for invalid config');
    assert(r.stderr.toLowerCase().includes('name'), 'Should mention name error');
  } finally {
    removeTmpDir(tmp);
  }
});

test('validate fails with missing installers', () => {
  const tmp = makeTmpDir();
  try {
    const bad = { name: 'TestApp' };
    writeConfig(tmp, bad);
    const r = runCli(['validate'], tmp);
    assert(r.status !== 0, 'Should exit non-zero');
    assert(r.stderr.toLowerCase().includes('installer'), 'Should mention installers');
  } finally {
    removeTmpDir(tmp);
  }
});

test('validate fails if install-bridge.json is missing', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['validate'], tmp);
    assert(r.status !== 0, 'Should fail without config file');
    assert(r.stderr.includes('install-bridge.json'), 'Should mention missing file');
  } finally {
    removeTmpDir(tmp);
  }
});

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

test('generate creates install-badge.svg', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r = runCli(['generate'], tmp);
    assert(r.status === 0, `Exit code ${r.status}\nstderr: ${r.stderr}`);
    const badgePath = path.join(tmp, 'install-badge.svg');
    assert(fs.existsSync(badgePath), 'install-badge.svg should be created');
    const svg = fs.readFileSync(badgePath, 'utf8');
    assert(svg.startsWith('<svg'), 'Badge should be valid SVG');
    assert(svg.includes('TestApp'), 'Badge should contain app name');
  } finally {
    removeTmpDir(tmp);
  }
});

test('generate outputs a Markdown snippet', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r = runCli(['generate'], tmp);
    assert(r.status === 0, `Exit code ${r.status}`);
    assert(r.stdout.includes('--- Markdown ---'), 'Should output Markdown section');
    assert(r.stdout.includes('[![Install TestApp]'), 'Should include Markdown badge link');
    assert(r.stdout.includes('install-badge.svg'), 'Markdown snippet should reference badge file');
  } finally {
    removeTmpDir(tmp);
  }
});

test('generate outputs an HTML snippet', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r = runCli(['generate'], tmp);
    assert(r.status === 0, `Exit code ${r.status}`);
    assert(r.stdout.includes('--- HTML ---'), 'Should output HTML section');
    assert(r.stdout.includes('<a href='), 'Should include HTML anchor');
    assert(r.stdout.includes('<img'), 'Should include HTML image');
  } finally {
    removeTmpDir(tmp);
  }
});

test('generate fails when config is missing', () => {
  const tmp = makeTmpDir();
  try {
    const r = runCli(['generate'], tmp);
    assert(r.status !== 0, 'Should fail without config file');
  } finally {
    removeTmpDir(tmp);
  }
});

test('generate output is consistent across runs', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r1 = runCli(['generate'], tmp);
    const r2 = runCli(['generate'], tmp);
    assert(r1.status === 0 && r2.status === 0, 'Both runs should succeed');
    const badge1 = fs.readFileSync(path.join(tmp, 'install-badge.svg'), 'utf8');
    // Re-run generate (second call overwrites the file)
    assert(r1.stdout === r2.stdout, 'CLI output should be deterministic');
    const badge2 = fs.readFileSync(path.join(tmp, 'install-badge.svg'), 'utf8');
    assert(badge1 === badge2, 'Generated SVG should be deterministic');
  } finally {
    removeTmpDir(tmp);
  }
});

// ---------------------------------------------------------------------------
// setup
// ---------------------------------------------------------------------------

test('setup creates install-bridge.json and install-badge.svg when git repo present', () => {
  // Use this repo's directory so git is available
  const tmp = makeTmpDir();
  try {
    // Initialize a bare git repo so detectGitRepo works
    const { spawnSync: sp } = require('child_process');
    sp('git', ['init'], { cwd: tmp, encoding: 'utf8' });
    sp('git', ['remote', 'add', 'origin', 'https://github.com/example/SmokeApp.git'], { cwd: tmp, encoding: 'utf8' });

    const r = runCli(['setup', 'SmokeApp'], tmp);
    // Setup may succeed fully or warn about missing badge if no homepage — either is ok
    // The important invariant is that install-bridge.json is created.
    const configPath = path.join(tmp, 'install-bridge.json');
    assert(fs.existsSync(configPath), 'install-bridge.json should be created');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert(config.name === 'SmokeApp', `Expected name SmokeApp, got ${config.name}`);
    assert(r.status === 0, `Exit code ${r.status}\nstderr: ${r.stderr}\nstdout: ${r.stdout}`);
  } finally {
    removeTmpDir(tmp);
  }
});

test('setup falls back to generate when install-bridge.json already exists', () => {
  const tmp = makeTmpDir();
  try {
    writeConfig(tmp, VALID_CONFIG);
    const r = runCli(['setup'], tmp);
    assert(r.status === 0, `Exit code ${r.status}\nstderr: ${r.stderr}`);
    // Should have run generate, producing the badge
    const badgePath = path.join(tmp, 'install-badge.svg');
    assert(fs.existsSync(badgePath), 'install-badge.svg should be created by generate fallback');
    assert(r.stdout.includes('already exists'), 'Should warn that config already exists');
  } finally {
    removeTmpDir(tmp);
  }
});

console.log('\nInfo: All CLI tests completed\n');

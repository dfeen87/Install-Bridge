// ============================================================================
// INSTALL BRIDGE - CORE TESTS
// Zero-dependency test suite for core functionality
// Production-ready: exits non-zero on failure (CI-friendly)
// ============================================================================

const core = require('../src/core/core');

// Track failures so CI can fail properly
let HAS_FAILURES = false;

// Simple test runner
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (err) {
    HAS_FAILURES = true;
    console.error(`❌ ${name}`);
    console.error(`   ${err && err.message ? err.message : String(err)}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Ensure process exits non-zero if any test fails
process.on('exit', () => {
  if (HAS_FAILURES) {
    console.error('\n❌ Some tests failed\n');
    process.exitCode = 1;
  }
});

// ============================================================================
// TESTS
// ============================================================================

console.log('\n🧪 Running Install Bridge Core Tests\n');

// ---------------------------------------------------------------------------
// Config Validation
// ---------------------------------------------------------------------------

test('validateConfig: accepts valid config', () => {
  const config = {
    name: 'TestApp',
    installers: {
      darwin: 'https://example.com/app.dmg',
      linux: 'https://example.com/app.AppImage'
    }
  };
  const result = core.validateConfig(config);
  assert(result.valid === true, 'Should be valid');
  assert(Array.isArray(result.errors), 'errors should be an array');
  assert(result.errors.length === 0, 'Should have no errors');
});

test('validateConfig: rejects missing name', () => {
  const config = {
    installers: {
      darwin: 'https://example.com/app.dmg'
    }
  };
  const result = core.validateConfig(config);
  assert(result.valid === false, 'Should be invalid');
  assert(result.errors.some(e => e.includes('name')), 'Should mention name error');
});

test('validateConfig: rejects missing installers', () => {
  const config = { name: 'TestApp' };
  const result = core.validateConfig(config);
  assert(result.valid === false, 'Should be invalid');
  assert(result.errors.some(e => e.includes('installers')), 'Should mention installers error');
});

test('validateConfig: rejects empty installers', () => {
  const config = {
    name: 'TestApp',
    installers: {}
  };
  const result = core.validateConfig(config);
  assert(result.valid === false, 'Should be invalid');
  assert(
    result.errors.some(e => e.toLowerCase().includes('at least one')),
    'Should mention platform requirement'
  );
});

test('validateConfig: rejects invalid platform', () => {
  const config = {
    name: 'TestApp',
    installers: {
      windows: 'https://example.com/app.exe'
    }
  };
  const result = core.validateConfig(config);
  assert(result.valid === false, 'Should be invalid');
  assert(result.errors.some(e => e.includes('invalid platform')), 'Should mention invalid platform');
});

test('validateConfig: accepts file URLs (current behavior)', () => {
  const config = {
    name: 'TestApp',
    installers: {
      darwin: 'file:///path/to/app.dmg'
    }
  };
  const result = core.validateConfig(config);
  assert(result.valid === true, 'file:// URLs are currently allowed');
});

// ---------------------------------------------------------------------------
// OS Detection
// ---------------------------------------------------------------------------

test('detectOS: detects macOS', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
  assert(core.detectOS(ua) === 'darwin', 'Should detect darwin');
});

test('detectOS: detects iPhone/iPad as darwin', () => {
  const ua1 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';
  const ua2 = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)';
  assert(core.detectOS(ua1) === 'darwin', 'Should detect darwin for iPhone');
  assert(core.detectOS(ua2) === 'darwin', 'Should detect darwin for iPad');
});

test('detectOS: detects Linux', () => {
  const ua = 'Mozilla/5.0 (X11; Linux x86_64)';
  assert(core.detectOS(ua) === 'linux', 'Should detect linux');
});

test('detectOS: detects Windows', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  assert(core.detectOS(ua) === 'win32', 'Should detect win32');
});

test('detectOS: handles unknown OS', () => {
  const ua = 'Some weird device';
  assert(core.detectOS(ua) === 'unknown', 'Should return unknown');
});

test('detectOS: handles empty user agent', () => {
  assert(core.detectOS('') === 'unknown', 'Should return unknown for empty string');
  assert(core.detectOS(null) === 'unknown', 'Should return unknown for null');
});

// ---------------------------------------------------------------------------
// Install Target Resolution
// ---------------------------------------------------------------------------

test('getInstallTarget: returns URL for available platform', () => {
  const config = {
    name: 'TestApp',
    installers: {
      darwin: 'https://example.com/app.dmg'
    }
  };
  const target = core.getInstallTarget(config, 'darwin');
  assert(target.available === true, 'Should be available');
  assert(target.platform === 'darwin', 'Should have correct platform');
  assert(target.url === 'https://example.com/app.dmg', 'Should have correct URL');
});

test('getInstallTarget: returns fallback for unavailable platform', () => {
  const config = {
    name: 'TestApp',
    installers: {
      darwin: 'https://example.com/app.dmg'
    },
    fallback: 'https://example.com/download'
  };
  const target = core.getInstallTarget(config, 'win32');
  assert(target.available === false, 'Should not be available');
  assert(target.platform === 'win32', 'Should have correct platform');
  assert(target.fallback === 'https://example.com/download', 'Should have fallback');
});

test('getInstallTarget: falls back to homepage when installers missing', () => {
  const config = {
    name: 'TestApp',
    homepage: 'https://example.com'
  };
  const target = core.getInstallTarget(config, 'darwin');
  assert(target.available === false, 'Should not be available');
  assert(target.fallback === 'https://example.com', 'Should fall back to homepage');
});

// ---------------------------------------------------------------------------
// Badge Generation
// ---------------------------------------------------------------------------

test('generateBadge: creates valid SVG', () => {
  const config = {
    name: 'TestApp',
    installers: { darwin: 'https://example.com/app.dmg' }
  };
  const svg = core.generateBadge(config);
  assert(svg.includes('<svg'), 'Should contain SVG tag');
  assert(svg.includes('TestApp'), 'Should contain app name');
  assert(svg.includes('Install'), 'Should contain default label');
});

test('generateBadge: respects custom label and color', () => {
  const config = {
    name: 'TestApp',
    installers: { darwin: 'https://example.com/app.dmg' },
    badge: {
      label: 'Download',
      color: '#ff0000'
    }
  };
  const svg = core.generateBadge(config);
  assert(svg.includes('Download'), 'Should contain custom label');
  assert(svg.includes('#ff0000'), 'Should contain custom color');
});

// ---------------------------------------------------------------------------
// Snippet Generation
// ---------------------------------------------------------------------------

test('generateSnippets: creates markdown and HTML', () => {
  const config = {
    name: 'TestApp',
    installers: { darwin: 'https://example.com/app.dmg' },
    homepage: 'https://example.com'
  };
  const snippets = core.generateSnippets(config);
  assert(snippets.markdown.includes('[![Install TestApp]'), 'Markdown should have image syntax');
  assert(snippets.markdown.includes('(https://example.com)'), 'Markdown should have link');
  assert(snippets.html.includes('<a href="https://example.com">'), 'HTML should have link');
  assert(snippets.html.includes('<img'), 'HTML should have image');
});

test('generateSnippets: uses installer fallback when homepage absent', () => {
  const config = {
    name: 'TestApp',
    installers: {
      linux: 'https://example.com/linux',
      darwin: 'https://example.com/mac'
    }
  };
  const snippets = core.generateSnippets(config);
  assert(
    snippets.markdown.includes('https://example.com/mac'),
    'Should prefer darwin installer when homepage not provided'
  );
});

// ---------------------------------------------------------------------------
// Config Parsing
// ---------------------------------------------------------------------------

test('parseConfig: parses valid JSON', () => {
  const json = JSON.stringify({
    name: 'TestApp',
    installers: {
      darwin: 'https://example.com/app.dmg'
    }
  });
  const result = core.parseConfig(json);
  assert(result.success === true, 'Should succeed');
  assert(result.config.name === 'TestApp', 'Should have correct name');
});

test('parseConfig: rejects invalid JSON', () => {
  const json = '{ invalid json }';
  const result = core.parseConfig(json);
  assert(result.success === false, 'Should fail');
  assert(result.errors.length > 0, 'Should have errors');
});

test('parseConfig: validates config after parsing', () => {
  const json = JSON.stringify({
    name: 'TestApp'
  });
  const result = core.parseConfig(json);
  assert(result.success === false, 'Should fail validation');
  assert(result.errors.some(e => e.includes('installers')), 'Should mention installers');
});

// ---------------------------------------------------------------------------
// Template Creation
// ---------------------------------------------------------------------------

test('createTemplate: generates valid config', () => {
  const template = core.createTemplate('MyApp');
  assert(template.name === 'MyApp', 'Should have correct name');
  assert(template.installers.darwin, 'Should have darwin installer');
  assert(template.installers.linux, 'Should have linux installer');
  assert(template.installers.win32, 'Should have win32 installer');

  const validation = core.validateConfig(template);
  assert(validation.valid === true, 'Template should be valid');
});

console.log('\n✨ All tests completed\n');

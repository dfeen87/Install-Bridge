// ============================================================================
// INSTALL BRIDGE - SERVER TESTS
// Integration tests for the HTTP server. Starts a real server on an unused
// port, fires real HTTP requests, and asserts on responses.
// Zero-dependency, CI-friendly.
// ============================================================================

const http = require('http');
const net = require('net');

let HAS_FAILURES = false;

function test(name, fn) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => console.log(`PASS: ${name}`))
    .catch((err) => {
      HAS_FAILURES = true;
      console.error(`FAIL: ${name}`);
      console.error(`      ${err && err.message ? err.message : String(err)}`);
    });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REQUEST_TIMEOUT_MS = 5000;

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function httpGet(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: 'localhost', port, path, headers },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => reject(new Error('Request timed out')));
  });
}

function makeConfigParam(config) {
  return Buffer.from(JSON.stringify(config)).toString('base64');
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
// Main test runner
// ---------------------------------------------------------------------------

async function runServerTests() {
  console.log('\nInfo: Running Install Bridge Server Tests\n');

  // Find a free port before requiring the server module so PORT is set correctly
  const port = await findFreePort();
  process.env.PORT = String(port);

  // Require server after setting PORT so the module-level constant picks it up
  const { startServer } = require('../src/server/server');
  const server = startServer();

  // Wait for the server to be listening
  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });

  try {
    // -----------------------------------------------------------------------
    // Root endpoint
    // -----------------------------------------------------------------------

    await test('GET / returns 200 HTML page', async () => {
      const r = await httpGet(port, '/');
      assert(r.status === 200, `Expected 200, got ${r.status}`);
      assert(
        r.headers['content-type'].includes('text/html'),
        'Should return HTML content-type'
      );
      assert(r.body.includes('Install Bridge'), 'Root page should mention Install Bridge');
    });

    await test('GET /unknown returns 404', async () => {
      const r = await httpGet(port, '/unknown');
      assert(r.status === 404, `Expected 404, got ${r.status}`);
    });

    await test('Security headers are present', async () => {
      const r = await httpGet(port, '/');
      assert(r.headers['x-content-type-options'] === 'nosniff', 'Missing X-Content-Type-Options');
      assert(r.headers['x-frame-options'] === 'DENY', 'Missing X-Frame-Options');
      assert(r.headers['referrer-policy'] === 'no-referrer', 'Missing Referrer-Policy');
    });

    // -----------------------------------------------------------------------
    // Badge endpoint
    // -----------------------------------------------------------------------

    await test('GET /badge.svg returns valid SVG', async () => {
      const cfg = makeConfigParam(VALID_CONFIG);
      const r = await httpGet(port, `/badge.svg?config=${cfg}`);
      assert(r.status === 200, `Expected 200, got ${r.status}`);
      assert(
        r.headers['content-type'].includes('image/svg+xml'),
        `Expected SVG content-type, got ${r.headers['content-type']}`
      );
      assert(r.body.startsWith('<svg'), 'Response should be valid SVG');
      assert(r.body.includes('TestApp'), 'SVG should contain the app name');
      assert(r.body.includes('Install'), 'SVG should contain the badge label');
    });

    await test('GET /badge.svg respects custom badge options', async () => {
      const config = {
        ...VALID_CONFIG,
        badge: { label: 'Download', color: '#e44d26', style: 'flat' }
      };
      const cfg = makeConfigParam(config);
      const r = await httpGet(port, `/badge.svg?config=${cfg}`);
      assert(r.status === 200, `Expected 200, got ${r.status}`);
      assert(r.body.includes('Download'), 'SVG should use custom label');
      assert(r.body.includes('#e44d26'), 'SVG should use custom color');
    });

    await test('GET /badge.svg returns 400 without config param', async () => {
      const r = await httpGet(port, '/badge.svg');
      assert(r.status === 400, `Expected 400, got ${r.status}`);
    });

    await test('GET /badge.svg returns 400 for invalid config', async () => {
      const bad = Buffer.from(JSON.stringify({ name: 'NoInstallers' })).toString('base64');
      const r = await httpGet(port, `/badge.svg?config=${bad}`);
      assert(r.status === 400, `Expected 400, got ${r.status}`);
    });

    await test('GET /badge.svg returns 400 for malformed base64', async () => {
      const r = await httpGet(port, '/badge.svg?config=!!!not-base64!!!');
      assert(r.status === 400, `Expected 400, got ${r.status}`);
    });

    await test('GET /badge.svg sets Cache-Control header', async () => {
      const cfg = makeConfigParam(VALID_CONFIG);
      const r = await httpGet(port, `/badge.svg?config=${cfg}`);
      assert(r.status === 200, `Expected 200, got ${r.status}`);
      assert(
        r.headers['cache-control'] && r.headers['cache-control'].includes('max-age'),
        'Should set Cache-Control with max-age'
      );
    });

    // -----------------------------------------------------------------------
    // Install (redirect) endpoint – OS detection
    // -----------------------------------------------------------------------

    await test('GET /install redirects macOS user to darwin installer', async () => {
      const cfg = makeConfigParam(VALID_CONFIG);
      const r = await httpGet(port, `/install?config=${cfg}`, {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36'
      });
      assert(r.status === 302, `Expected 302, got ${r.status}`);
      assert(
        r.headers.location === VALID_CONFIG.installers.darwin,
        `Expected darwin URL, got ${r.headers.location}`
      );
    });

    await test('GET /install redirects Windows user to win32 installer', async () => {
      const cfg = makeConfigParam(VALID_CONFIG);
      const r = await httpGet(port, `/install?config=${cfg}`, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      assert(r.status === 302, `Expected 302, got ${r.status}`);
      assert(
        r.headers.location === VALID_CONFIG.installers.win32,
        `Expected win32 URL, got ${r.headers.location}`
      );
    });

    await test('GET /install redirects Linux user to linux installer', async () => {
      const cfg = makeConfigParam(VALID_CONFIG);
      const r = await httpGet(port, `/install?config=${cfg}`, {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      });
      assert(r.status === 302, `Expected 302, got ${r.status}`);
      assert(
        r.headers.location === VALID_CONFIG.installers.linux,
        `Expected linux URL, got ${r.headers.location}`
      );
    });

    await test('GET /install uses fallback URL when OS has no installer', async () => {
      const darwinOnly = {
        name: 'TestApp',
        installers: { darwin: 'https://example.com/mac.dmg' },
        fallback: 'https://example.com/releases'
      };
      const cfg = makeConfigParam(darwinOnly);
      const r = await httpGet(port, `/install?config=${cfg}`, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
      assert(r.status === 302, `Expected 302, got ${r.status}`);
      assert(
        r.headers.location === 'https://example.com/releases',
        `Expected fallback URL, got ${r.headers.location}`
      );
    });

    await test('GET /install uses homepage as fallback when no fallback set', async () => {
      const darwinOnly = {
        name: 'TestApp',
        installers: { darwin: 'https://example.com/mac.dmg' },
        homepage: 'https://example.com'
      };
      const cfg = makeConfigParam(darwinOnly);
      const r = await httpGet(port, `/install?config=${cfg}`, {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'
      });
      assert(r.status === 302, `Expected 302, got ${r.status}`);
      assert(
        r.headers.location === 'https://example.com' ||
        r.headers.location === 'https://example.com/',
        `Expected homepage URL, got ${r.headers.location}`
      );
    });

    await test('GET /install serves fallback HTML page when no URL is available', async () => {
      const darwinOnly = {
        name: 'FallbackApp',
        installers: { darwin: 'https://example.com/mac.dmg' }
      };
      const cfg = makeConfigParam(darwinOnly);
      const r = await httpGet(port, `/install?config=${cfg}`, {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'
      });
      // No fallback and no homepage → serves HTML page
      assert(r.status === 200, `Expected 200 HTML fallback, got ${r.status}`);
      assert(
        r.headers['content-type'].includes('text/html'),
        'Should serve HTML fallback page'
      );
      assert(r.body.includes('FallbackApp'), 'Fallback page should show app name');
    });

    await test('GET /install returns 400 without config param', async () => {
      const r = await httpGet(port, '/install');
      assert(r.status === 400, `Expected 400, got ${r.status}`);
    });

    await test('GET /install returns 400 for invalid config', async () => {
      const bad = Buffer.from('{"not": "valid"}').toString('base64');
      const r = await httpGet(port, `/install?config=${bad}`);
      assert(r.status === 400, `Expected 400, got ${r.status}`);
    });

    // -----------------------------------------------------------------------
    // Method handling
    // -----------------------------------------------------------------------

    await test('POST requests are rejected with 405', async () => {
      const r = await new Promise((resolve, reject) => {
        const req = http.request(
          { hostname: 'localhost', port, path: '/', method: 'POST' },
          (res) => {
            res.resume();
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers }));
          }
        );
        req.on('error', reject);
        req.end();
      });
      assert(r.status === 405, `Expected 405, got ${r.status}`);
      assert(r.headers['allow'], 'Should include Allow header');
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\nInfo: All server tests completed\n');

  process.on('exit', () => {
    if (HAS_FAILURES) {
      console.error('\nError: Some server tests failed\n');
      process.exitCode = 1;
    }
  });
}

runServerTests().catch((err) => {
  console.error('Fatal error running server tests:', err);
  process.exit(1);
});

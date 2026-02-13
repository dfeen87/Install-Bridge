// ============================================================================
// INSTALL BRIDGE - HTTP SERVER
// Thin, stateless HTTP wrapper around core logic
// Production-ready: defensive parsing, safe headers, correct status handling
// ============================================================================

const http = require('http');
const core = require('../core/core');

const PORT = Number(process.env.PORT) || 3000;
const MAX_CONFIG_SIZE = 8 * 1024; // 8KB safety limit
const CONFIG_CACHE_LIMIT = 200;
const BADGE_CACHE_LIMIT = 200;

const configCache = new Map();
const badgeCache = new Map();

// ============================================================================
// UTILITIES
// ============================================================================

function getFromCache(cache, key) {
  if (!cache.has(key)) return null;
  const value = cache.get(key);
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function setCache(cache, key, value, limit) {
  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, value);
  if (cache.size > limit) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    ...headers
  });
  res.end(body);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function decodeConfig(param) {
  if (!param || typeof param !== 'string') {
    throw new Error('Missing config parameter');
  }

  const buf = Buffer.from(param, 'base64');
  if (buf.length > MAX_CONFIG_SIZE) {
    throw new Error('Config too large');
  }

  return buf.toString('utf8');
}

function parseConfigFromRequest(req) {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const encodedConfig = reqUrl.searchParams.get('config');
  const cached = getFromCache(configCache, encodedConfig);
  if (cached) {
    return { config: cached, encodedConfig };
  }

  const json = decodeConfig(encodedConfig);
  const result = core.parseConfig(json);

  if (!result.success) {
    throw new Error(`Invalid config: ${result.errors.join(', ')}`);
  }

  setCache(configCache, encodedConfig, result.config, CONFIG_CACHE_LIMIT);
  return { config: result.config, encodedConfig };
}

// ============================================================================
// HANDLERS
// ============================================================================

function handleBadge(req, res) {
  try {
    const { config, encodedConfig } = parseConfigFromRequest(req);
    const cachedSvg = getFromCache(badgeCache, encodedConfig);
    if (cachedSvg) {
      send(res, 200, cachedSvg, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      });
      return;
    }

    const svg = core.generateBadge(config);
    setCache(badgeCache, encodedConfig, svg, BADGE_CACHE_LIMIT);

    send(res, 200, svg, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });
  } catch (err) {
    send(res, 400, err.message, { 'Content-Type': 'text/plain' });
  }
}

function handleInstall(req, res) {
  try {
    const { config } = parseConfigFromRequest(req);
    const ua = req.headers['user-agent'] || '';
    const os = core.detectOS(ua);
    const target = core.getInstallTarget(config, os);

    if (target.available) {
      send(res, 302, '', { Location: target.url });
      return;
    }

    if (target.fallback) {
      send(res, 302, '', { Location: target.fallback });
      return;
    }

    send(res, 200, generateFallbackPage(config, os), {
      'Content-Type': 'text/html; charset=utf-8'
    });

  } catch (err) {
    send(res, 400, err.message, { 'Content-Type': 'text/plain' });
  }
}

function generateFallbackPage(config, detectedOS) {
  const platformNames = {
    darwin: 'macOS',
    linux: 'Linux',
    win32: 'Windows'
  };

  const installers = config.installers || {};
  const platforms = Object.keys(installers);
  const appName = escapeHtml(config.name || 'Install');
  const homepage = config.homepage ? escapeHtml(config.homepage) : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Install ${appName}</title>
<style>
body {
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#f5f5f5;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100vh;
  margin:0;
  padding:20px;
}
.container {
  background:white;
  border-radius:8px;
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
  max-width:520px;
  width:100%;
  padding:40px;
  text-align:center;
}
h1 { margin-bottom:10px; }
.notice {
  color:#d73a49;
  margin-bottom:20px;
}
a.btn {
  display:block;
  margin:10px 0;
  padding:14px 20px;
  background:#0366d6;
  color:white;
  text-decoration:none;
  border-radius:6px;
  font-weight:500;
}
a.btn:hover { background:#0256c1; }
.footer {
  margin-top:30px;
  font-size:14px;
  color:#666;
}
</style>
</head>
<body>
<div class="container">
<h1>Install ${appName}</h1>
${detectedOS !== 'unknown'
  ? `<p>Detected OS: ${escapeHtml(platformNames[detectedOS] || detectedOS)}</p>`
  : ''}
${detectedOS !== 'unknown' && !installers[detectedOS]
  ? `<p class="notice">No installer available for your platform</p>`
  : ''}
${platforms.map(p =>
  `<a class="btn" href="${escapeHtml(installers[p])}">Download for ${escapeHtml(platformNames[p] || p)}</a>`
).join('')}
${homepage
  ? `<div class="footer"><a href="${homepage}">Learn more →</a></div>`
  : ''}
</div>
</body>
</html>`;
}

function handleRoot(req, res) {
  send(res, 200, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Install Bridge</title>
<style>
body {
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  max-width:800px;
  margin:60px auto;
  padding:20px;
  line-height:1.6;
}
code { background:#f5f5f5; padding:2px 6px; border-radius:4px; }
</style>
</head>
<body>
<h1>Install Bridge Server</h1>
<p>Stateless HTTP interface for Install Bridge.</p>
<ul>
<li><code>GET /badge.svg?config=&lt;base64&gt;</code></li>
<li><code>GET /install?config=&lt;base64&gt;</code></li>
</ul>
</body>
</html>`, {
    'Content-Type': 'text/html; charset=utf-8'
  });
}

// ============================================================================
// ROUTER
// ============================================================================

function handleRequest(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    send(res, 405, 'Method Not Allowed', { 
      'Content-Type': 'text/plain',
      'Allow': 'GET, OPTIONS'
    });
    return;
  }

  if (pathname === '/badge.svg') return handleBadge(req, res);
  if (pathname === '/install') return handleInstall(req, res);
  if (pathname === '/') return handleRoot(req, res);

  send(res, 404, 'Not Found', { 'Content-Type': 'text/plain' });
}

// ============================================================================
// SERVER
// ============================================================================

function startServer() {
  const server = http.createServer(handleRequest);
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error(`❌ Server error: ${err.message}`);
      process.exit(1);
    }
  });
  
  server.listen(PORT, () => {
    console.log(`🚀 Install Bridge server running on http://localhost:${PORT}`);
  });
  
  return server;
}

// ============================================================================
// MAIN
// ============================================================================

if (require.main === module) {
  const server = startServer();
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

module.exports = { startServer };

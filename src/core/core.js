// ============================================================================
// INSTALL BRIDGE - CORE MODULE
// Pure logic layer with zero dependencies on CLI or server
// ============================================================================

/**
 * Supported platform priority order
 * Used for deterministic fallbacks
 */
const PLATFORM_ORDER = ['darwin', 'win32', 'linux'];

/**
 * Validate URL using native URL parser
 */
function isValidURL(value) {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate configuration object
 */
function validateConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Config must be an object'] };
  }

  if (!config.name || typeof config.name !== 'string') {
    errors.push('name is required and must be a string');
  }

  if (!config.installers || typeof config.installers !== 'object') {
    errors.push('installers is required and must be an object');
  } else {
    const platforms = Object.keys(config.installers);

    if (platforms.length === 0) {
      errors.push('at least one installer platform must be specified');
    }

    platforms.forEach(platform => {
      if (!PLATFORM_ORDER.includes(platform)) {
        errors.push(
          `invalid platform: ${platform} (must be darwin, win32, or linux)`
        );
      }

      const url = config.installers[platform];
      if (!isValidURL(url)) {
        errors.push(
          `installer for ${platform} must be a valid HTTP(S) URL`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Detect OS from User-Agent string
 * Returns: 'darwin' | 'linux' | 'win32' | 'unknown'
 */
function detectOS(userAgent) {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (
    ua.includes('mac') ||
    ua.includes('darwin') ||
    ua.includes('iphone') ||
    ua.includes('ipad')
  ) {
    return 'darwin';
  }

  if (ua.includes('linux') || ua.includes('android')) {
    return 'linux';
  }

  if (ua.includes('win')) {
    return 'win32';
  }

  return 'unknown';
}

/**
 * Get first available installer deterministically
 */
function getFirstInstaller(installers = {}) {
  for (const platform of PLATFORM_ORDER) {
    if (installers[platform]) return installers[platform];
  }
  return Object.values(installers)[0] || null;
}

/**
 * Determine install target for detected OS
 */
function getInstallTarget(config, os) {
  const installers = config.installers || {};

  if (!installers[os]) {
    return {
      available: false,
      platform: os,
      fallback: config.fallback || config.homepage || null
    };
  }

  return {
    available: true,
    platform: os,
    url: installers[os]
  };
}

/**
 * Generate SVG badge
 */
function generateBadge(config) {
  const opts = config.badge || {};
  const label = opts.label || 'Install';
  const appName = config.name;
  const color = opts.color || '#0366d6';
  const style = opts.style || 'flat';

  const labelWidth = label.length * 6 + 10;
  const nameWidth = appName.length * 7 + 10;
  const totalWidth = labelWidth + nameWidth;

  if (style === 'flat') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
    <path fill="${color}" d="M${labelWidth} 0h${nameWidth}v20H${labelWidth}z"/>
    <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle"
     font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + nameWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${appName}</text>
    <text x="${labelWidth + nameWidth / 2}" y="14">${appName}</text>
  </g>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <rect width="${labelWidth}" height="20" fill="#555"/>
  <rect x="${labelWidth}" width="${nameWidth}" height="20" fill="${color}"/>
  <text x="${labelWidth / 2}" y="14" fill="#fff"
        font-family="Arial,sans-serif" font-size="11"
        text-anchor="middle">${label}</text>
  <text x="${labelWidth + nameWidth / 2}" y="14" fill="#fff"
        font-family="Arial,sans-serif" font-size="11"
        text-anchor="middle">${appName}</text>
</svg>`;
}

/**
 * Generate embed snippets
 */
function generateSnippets(
  config,
  badgePath = './install-badge.svg',
  installURL = null
) {
  const targetURL =
    installURL ||
    config.homepage ||
    getFirstInstaller(config.installers);

  const markdown =
    `[![Install ${config.name}](${badgePath})](${targetURL})`;

  const html =
`<a href="${targetURL}">
  <img src="${badgePath}" alt="Install ${config.name}" />
</a>`;

  return { markdown, html };
}

/**
 * Parse install-bridge.json content
 */
function parseConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    const validation = validateConfig(config);

    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    return { success: true, config };
  } catch (err) {
    return {
      success: false,
      errors: [`Invalid JSON: ${err.message}`]
    };
  }
}

/**
 * Create template configuration
 */
function createTemplate(appName = 'MyApp') {
  return {
    name: appName,
    installers: {
      darwin: `https://github.com/user/repo/releases/latest/download/${appName}-macOS.dmg`,
      win32: `https://github.com/user/repo/releases/latest/download/${appName}-windows.exe`,
      linux: `https://github.com/user/repo/releases/latest/download/${appName}-linux.AppImage`
    },
    homepage: 'https://github.com/user/repo',
    fallback: 'https://github.com/user/repo/releases',
    badge: {
      label: 'Install',
      color: '#0366d6',
      style: 'flat'
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

const InstallBridgeCore = {
  validateConfig,
  detectOS,
  getInstallTarget,
  generateBadge,
  generateSnippets,
  parseConfig,
  createTemplate
};

module.exports = InstallBridgeCore;

// Browser / REPL support
if (typeof window !== 'undefined') {
  window.InstallBridge = InstallBridgeCore;
}

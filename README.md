# Install Bridge

[![npm version](https://img.shields.io/npm/v/install-bridge.svg)](https://www.npmjs.com/package/install-bridge)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)

**Install Bridge** is a lightweight, open-source tool that creates **install badges** for your software — badges you can add to any website on the internet.

> *Why is it easy to share code, but still awkward to share installation?*

From that question came a calm, disciplined idea — give developers a way to **create a single, copy-pasteable install badge** that works anywhere on the internet: README files, documentation sites, blog posts, or any website, without app stores, gatekeepers, or heavy infrastructure.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Architecture](#architecture)
- [Who This Is For](#who-this-is-for)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Philosophy](#philosophy)
- [Why This Matters](#why-this-matters)
- [Status](#status)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Links](#links)

---

## Quick Start

Create an install badge for your project in one command:

```bash
npx install-bridge setup YourApp
```

Or install globally:

```bash
npm install -g install-bridge
install-bridge setup YourApp
```

**What this does:**
1. ✅ Detects your GitHub repository automatically
2. ✅ Creates `install-bridge.json` with your repo URLs pre-filled
3. ✅ Generates `install-badge.svg` ready to use
4. ✅ Shows you the snippet to paste in your README or any website

**Result:** Copy the Markdown snippet and paste it into your README.md or any website. Done! 🎉

---

## Features

✨ **Simple & Fast** — Create install badges in seconds with one command  
🎯 **Platform-Aware** — Smart routing to correct installers based on user's OS  
🎨 **Customizable** — Full control over badge appearance and styling  
🔗 **Universal Embedding** — Works on README files, docs, blogs, wikis, and any website  
📦 **Declarative Config** — Simple JSON configuration with auto-detection  
🚀 **Zero Dependencies** — Lightweight core with no external dependencies  
🌐 **Optional Server** — Can run as HTTP service or purely locally  
🔒 **Transparent** — Users can review source before installing  
🏷️ **Repository-First** — Your repo stays the source of truth

---

## Installation

### Option 1: Use Without Installing (Recommended)

```bash
npx install-bridge setup YourApp
```

### Option 2: Global Installation

```bash
npm install -g install-bridge
install-bridge setup YourApp
```

### Option 3: Local Development

```bash
git clone https://github.com/dfeen87/install-bridge.git
cd install-bridge
npm install
node bin/install-bridge.js setup YourApp
```

**Requirements:**
- Node.js >= 14.0.0
- npm or npx

---

## Usage

### Quick Setup (Recommended)

Create an install badge for your project in one command:

```bash
npx install-bridge setup YourApp
```

This command will:
1. ✅ Detect your GitHub repository automatically
2. ✅ Create `install-bridge.json` with your repo URLs pre-filled
3. ✅ Generate `install-badge.svg` ready to use
4. ✅ Show you the snippet to paste in your README or any website

### Advanced Usage

For more control over the process:

```bash
# Initialize configuration
install-bridge init MyApp

# Validate configuration
install-bridge validate

# Generate badge and snippets
install-bridge generate
```

For detailed usage instructions, see the [Usage Guide](./docs/USAGE.md).

---

## Examples

### Basic Example

After running `install-bridge setup MyApp`, you'll get:

**Generated Badge:**
```markdown
[![Install MyApp](./install-badge.svg)](https://github.com/user/myapp)
```

**Configuration File (`install-bridge.json`):**
```json
{
  "name": "MyApp",
  "installers": {
    "darwin": "https://github.com/user/myapp/releases/latest/download/MyApp-macOS.dmg",
    "win32": "https://github.com/user/myapp/releases/latest/download/MyApp-windows.exe",
    "linux": "https://github.com/user/myapp/releases/latest/download/MyApp-linux.AppImage"
  },
  "homepage": "https://github.com/user/myapp",
  "fallback": "https://github.com/user/myapp/releases",
  "badge": {
    "label": "Install",
    "color": "#0366d6",
    "style": "flat"
  }
}
```

### Embedding Locations

Install Bridge badges work anywhere on the internet:

* ✅ README files
* ✅ Documentation sites
* ✅ Blog posts
* ✅ Issue trackers
* ✅ Social posts
* ✅ Internal wikis

**Anywhere** — if a website allows images and links, Install Bridge badges work there.

---

## Architecture

Install Bridge is built in three clean layers:

### Core

Pure logic only.

* Validates configuration
* Generates SVG badges
* Detects user platforms
* Resolves install targets

No filesystem access. No network calls. No side effects.

### CLI

A lightweight local interface.

* Initializes configs
* Validates settings
* Generates badges and snippets

This lets developers adopt Install Bridge locally, immediately.

### HTTP Server (Optional)

A stateless wrapper.

* Serves badges over HTTP
* Handles install redirects based on OS
* Can run anywhere — or not at all

The server is optional. The system works even without it.

For detailed technical documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Who This Is For

Install Bridge is especially useful for:

* 🌟 Open-source projects
* 🛠️ Developer tools
* 🔧 Internal utilities
* 🧪 Experimental software
* 🔬 Research prototypes
* 💡 Indie applications

Anywhere distribution matters, but overhead should stay low.

---

## Documentation

- **[Usage Guide](./docs/USAGE.md)** — Detailed usage instructions and examples
- **[Architecture](./docs/ARCHITECTURE.md)** — Technical architecture and design principles
- **[Configuration Reference](./docs/CONFIG_AND_STABILITY.md)** — Complete config file documentation

---

## Contributing

Contributions are welcome! Install Bridge is intentionally small and focused, but improvements that align with its philosophy are appreciated.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/dfeen87/install-bridge.git
cd install-bridge
npm install
npm test
```

### Guidelines

- Keep changes minimal and focused
- Maintain zero external dependencies in the core
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

---

## Philosophy

This project grew out of practical conversations about keeping software honest and lightweight. Instead of building a platform, Install Bridge was designed as a **primitive** — something small, composable, and durable.

### Guiding Principles

* 📚 Repositories remain the source of truth
* 🎯 Installation should be one click, not a paragraph
* 🌐 Distribution should be portable, not centralized
* 📖 Tooling should stay readable and dependency-free

Install Bridge is intentionally calm. It does not try to manage users, rank projects, collect analytics, or lock anyone in. It exists to make sharing software easier — and then get out of the way.

*Install Bridge prioritizes transparency—developers publish clear install links, and users are encouraged to review the source and releases before installing.*

---

## Why This Matters

Modern software spreads through links, badges, and icons — but installation often lags behind.

Install Bridge closes that gap by giving developers a **single, embeddable install badge** that:

* ✨ Looks familiar
* 🎯 Feels intentional
* 🔐 Respects user autonomy
* 👤 Keeps control with the project

It is not an app store.  
It is not a marketplace.  
**It is a bridge.**

---

## Status

Install Bridge is intentionally small and complete.

The core logic is frozen, tested, and dependency-free. Future additions are expected to stay minimal and aligned with the original philosophy.


**Current Version:** v0.1.1  
**Stability:** Stable  
**Maintenance:** Active

---

## License

This project is available for **non‑commercial use only** under the terms of the included LICENSE file.  
Commercial use requires a separate paid license.

---

## Acknowledgments

This project was developed with a combination of original ideas, hands‑on coding, and support from advanced AI systems. I would like to acknowledge **Microsoft Copilot**, **Anthropic Claude**, and **OpenAI ChatGPT** for their meaningful assistance in refining concepts, improving clarity, and strengthening the overall quality of this work.

---

## Links

- **Repository:** [github.com/dfeen87/install-bridge](https://github.com/dfeen87/install-bridge)
- **npm Package:** [npmjs.com/package/install-bridge](https://www.npmjs.com/package/install-bridge)
- **Issues:** [github.com/dfeen87/install-bridge/issues](https://github.com/dfeen87/install-bridge/issues)

---

<p align="center">
  <i>Built with care. Designed to last.</i>
</p>

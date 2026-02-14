# Install Bridge

**Install Bridge** is a lightweight, open-source tool that creates **install badges** for your software — badges you can add to any website on the internet.

It began as a focused collaboration around a simple question:

> *Why is it easy to share code, but still awkward to share installation?*

From that question came a calm, disciplined idea — give developers a way to **create a single, copy-pasteable install badge** that works anywhere on the internet: README files, documentation sites, blog posts, or any website, without app stores, gatekeepers, or heavy infrastructure.

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

For more control, see the detailed [Usage Guide](./docs/USAGE.md).

---

## Origin & Philosophy

This project grew out of practical conversations about keeping software honest and lightweight. Instead of building a platform, Install Bridge was designed as a **primitive** — something small, composable, and durable.

The guiding principles are simple:

* Repositories remain the source of truth
* Installation should be one click, not a paragraph
* Distribution should be portable, not centralized
* Tooling should stay readable and dependency-free

Install Bridge is intentionally calm. It does not try to manage users, rank projects, collect analytics, or lock anyone in. It exists to make sharing software easier — and then get out of the way.

*Install Bridge prioritizes transparency—developers publish clear install links, and users are encouraged to review the source and releases before installing.*

---

## What Install Bridge Does

Install Bridge creates **install badges** for your software that you can embed anywhere on the internet.

The tool gives each project three things:

1. **A declarative config file** (`install-bridge.json`)
2. **A generated install badge (SVG)**
3. **A smart install link** that routes users to the correct installer

Together, these create a badge you can paste into:

* README files
* Documentation sites
* Blog posts
* Issue trackers
* Social posts
* Internal wikis

**Anywhere on the internet** — if a website allows images and links, Install Bridge badges work there.

---

## How It Works (High Level)

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

---

## Why This Matters

Modern software spreads through links, badges, and icons — but installation often lags behind.

Install Bridge closes that gap by giving developers a **single, embeddable install badge** that:

* Looks familiar
* Feels intentional
* Respects user autonomy
* Keeps control with the project

It is not an app store.
It is not a marketplace.

It is a bridge.

---

## Who This Is For

Install Bridge is especially useful for:

* Open-source projects
* Developer tools
* Internal utilities
* Experimental software
* Research prototypes
* Indie applications

Anywhere distribution matters, but overhead should stay low.

---

## Status

Install Bridge is intentionally small and complete.

The core logic is frozen, tested, and dependency-free. Future additions are expected to stay minimal and aligned with the original philosophy.

---

## Closing Thought

Install Bridge exists because good software deserves to be easy to share — without losing its independence.

If this tool helps your work travel a little farther, then it’s doing exactly what it was built to do.

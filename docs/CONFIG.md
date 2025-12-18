# Install Bridge — Configuration

Install Bridge is configured using a single declarative file:

**`install-bridge.json`**

This file lives at the root of a repository and describes how software should be installed across platforms.

---

## Example Configuration

```json
{
  "name": "MyAwesomeApp",
  "installers": {
    "darwin": "https://github.com/user/myapp/releases/latest/download/MyAwesomeApp-macOS.dmg",
    "win32": "https://github.com/user/myapp/releases/latest/download/MyAwesomeApp-windows.exe",
    "linux": "https://github.com/user/myapp/releases/latest/download/MyAwesomeApp-linux.AppImage"
  },
  "homepage": "https://myawesomeapp.dev",
  "fallback": "https://github.com/user/myapp/releases",
  "badge": {
    "label": "Install",
    "color": "#0366d6",
    "style": "flat"
  }
}
```

---

## Field Reference

### `name` (required)

The human-readable name of the project.

```json
"name": "MyAwesomeApp"
```

Used in badges and snippets.

### `installers` (required)

A map of platform identifiers to installer URLs.

**Supported platforms:**
- `darwin`
- `win32`
- `linux`

At least one platform must be specified.

```json
"installers": {
  "darwin": "https://example.com/app.dmg"
}
```

### `homepage` (optional)

Primary project homepage or landing page.

Used as a fallback link when no platform-specific installer is available.

### `fallback` (optional)

Explicit fallback URL when an installer is unavailable.

If omitted, `homepage` is used.

### `badge` (optional)

Controls badge appearance.

```json
"badge": {
  "label": "Install",
  "color": "#0366d6",
  "style": "flat"
}
```

Defaults are applied when fields are omitted.

---

## Validation Rules

- The configuration must be valid JSON
- Required fields must be present
- Installer URLs must be valid URLs
- Unknown platforms are rejected
- Errors are reported explicitly by the CLI

---

## Stability Guarantee

As of **v1.0.0**, the configuration schema is considered **stable**.

Fields will not be removed or redefined without a major version bump.

---

# Install Bridge — Stability & Guarantees

This document defines what v1.0.0 means for Install Bridge.

It exists to set clear expectations for users and maintainers.

---

## What v1.0.0 Guarantees

- The CLI command surface is stable
- The `install-bridge.json` schema is stable
- Core logic remains dependency-free
- No analytics, tracking, or user management
- No network calls in the core layer
- Deterministic behavior across environments

Breaking changes will not be introduced without a major version increment.

---

## What Will Not Change Lightly

- Configuration field meanings
- Badge generation behavior
- Platform detection rules
- Core/CLI separation
- Repository-first distribution model

---

## What Is Explicitly Out of Scope

Install Bridge is **not**:

- An app store
- A package manager
- A marketplace
- A user platform
- A telemetry or analytics system

These are intentional non-goals.

---

## Evolution Policy

Future development may include:

- Minor enhancements
- Bug fixes
- Documentation improvements

But changes that alter the fundamental contract require a major version bump.

---

## Closing Note

Install Bridge aims to stay boring, predictable, and respectful of developer autonomy.

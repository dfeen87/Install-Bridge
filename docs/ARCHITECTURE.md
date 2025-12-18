# Install Bridge — Architecture

Install Bridge is intentionally small. Its architecture is designed to keep
responsibilities separated, behavior predictable, and long-term maintenance
low.

This document explains how the system is structured and why.

---

## High-Level Overview

Install Bridge is composed of three layers:

1. Core (pure logic)
2. CLI (local developer interface)
3. Optional HTTP server (stateless distribution)

Each layer builds on the previous one without introducing hidden coupling.

---

## Core Layer (`src/core/`)

The core is a pure logic module.

**Responsibilities**
- Validate install configuration objects
- Generate SVG install badges
- Generate embed snippets (Markdown / HTML)
- Resolve install targets deterministically
- Parse and validate JSON config input

**Non-Responsibilities**
- No filesystem access
- No network access
- No environment assumptions
- No process control

The core is deterministic and side-effect free. This allows it to be reused
safely in CLI tools, servers, or browser environments.

---

## CLI Layer (`bin/install-bridge.js`)

The CLI is a thin wrapper around the core.

**Responsibilities**
- Read and write local files
- Initialize `install-bridge.json`
- Validate configuration on disk
- Generate badge files and snippets
- Provide a simple, human-friendly interface

The CLI performs all I/O and delegates all logic to the core.

---

## Optional HTTP Server (`src/server/`)

The HTTP server is an optional, stateless wrapper.

**Responsibilities**
- Serve generated badges over HTTP
- Redirect users to platform-appropriate installers

**Non-Responsibilities**
- No persistence
- No user tracking
- No analytics
- No project ownership logic

The server is not required for Install Bridge to function.

---

## Design Principles

- Repositories remain the source of truth
- Configuration is declarative, not procedural
- Logic stays readable and dependency-free
- Side effects are explicit and localized
- Small tools should remain small

---

## Summary

Install Bridge is designed as a primitive, not a platform.

Each layer can be used independently, and no layer assumes more than it needs.
This structure is intentional and considered stable as of v1.0.0.

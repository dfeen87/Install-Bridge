# **Install‑Bridge**  
Semantic Ingestion Engine for the Semantic Dropdown Search API

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.0.0-orange.svg)](VERSION)
[![CI](https://github.com/dfeen87/Install-Bridge/workflows/CI/badge.svg)](https://github.com/dfeen87/Install-Bridge/actions)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

Install‑Bridge 3.0.0 is a **fully‑typed Python CLI** that serves as the ingestion gateway for the **Semantic Dropdown Search API (v2.0.0)**.  
It transforms media and creative artifacts—YouTube videos, images, articles, audio, and Pinterest boards—into deterministic semantic descriptors and optional embeddings.

Install‑Bridge is the foundation of a **semantic creation platform**, enabling cross‑modal indexing and search.

---

## **Philosophy**

- **Lightweight & Developer‑Friendly** — Built on Typer for intuitive CLI ergonomics.  
- **Deterministic‑First** — Rule‑based descriptor generation powered by **spaCy** ensures reproducibility.  
- **Optional Embeddings** — CPU‑only support for **sentence‑transformers** and **CLIP**, configurable via global settings.  
- **Seamless Integration** — Native client for POSTing ingestion payloads to the `/semantic-index` endpoint.

---

## **Installation**

Install‑Bridge uses **Poetry** for dependency management.

```bash
git clone https://github.com/dfeen87/Install-Bridge/
cd Install-Bridge
poetry install
```

Run the CLI:

```bash
poetry run bridge
```

To use globally, install the wheel or alias the command.

---

## **Configuration**

Install‑Bridge stores settings in your global user configuration directory  
(e.g., `~/.config/install-bridge/config.json`).

Show current configuration:

```bash
bridge config show
```

Set configuration values:

```bash
bridge config set use_embeddings true
bridge config set api_url http://your-semantic-api.com:8000
```

### **Available Keys**
- `api_url`  
- `use_embeddings` (true/false)  
- `embedding_model`  
- `image_model`  
- `audio_model`  
- `log_level`  

---

## **Ingestion Commands**

Each ingestion module extracts metadata, generates deterministic descriptors, optionally computes embeddings, and sends a unified payload to the Semantic API.

### **YouTube**
```bash
bridge ingest youtube <url>
```

### **Pinterest** *(Mocked extraction for now)*
```bash
bridge ingest pinterest <board_url>
```

### **Image**
```bash
bridge ingest image <file_or_url>
```

### **Article**
```bash
bridge ingest article <url>
```

### **Audio**
```bash
bridge ingest audio <file_or_url>
```

---

## **Extending Descriptors**

Install‑Bridge supports proprietary semantic rules via:

```
install_bridge/descriptors/proprietary_rules.py
```

You can inject custom heuristics for any ingestion module, enabling domain‑specific semantic enrichment.

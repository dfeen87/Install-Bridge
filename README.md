# Install-Bridge 3.0

Install-Bridge 3.0 is a semantic ingestion CLI that feeds the Semantic Dropdown Search API (v2.0.0).
It is designed to be the ingestion gateway for a semantic creation platform, taking various media types and converting them into semantic descriptors and optional embeddings before indexing them.

## Philosophy

- **Lightweight & Developer-friendly:** Simple CLI commands built on Typer.
- **Deterministic-first:** Rule-based descriptor generation using `spacy` ensures stability and reproducibility.
- **Optional Embeddings:** Native support for `sentence-transformers` and `transformers` (CLIP), which can be toggled via config.
- **Seamless Integration:** Native client for POSTing payloads to the `/semantic-index` endpoint.

## Installation

Install-Bridge 3.0 uses `poetry` for dependency management.

```bash
git clone <repo-url>
cd Install-Bridge
poetry install
```

The CLI will be available via `poetry run bridge`.
If you want to use it globally, you can install the wheel or simply alias `poetry run bridge`.

## Configuration

Settings are stored globally in your user configuration directory (e.g., `~/.config/install-bridge/config.json`).

Show current configuration:
```bash
bridge config show
```

Set a configuration value:
```bash
bridge config set use_embeddings true
bridge config set api_url http://your-semantic-api.com:8000
```

### Available Keys
- `api_url`
- `use_embeddings` (true/false)
- `embedding_model`
- `image_model`
- `audio_model`
- `log_level`

## Ingestion Commands

All commands extract metadata, generate descriptors (and optionally embeddings), and send a unified payload to the Semantic API.

**YouTube:**
```bash
bridge ingest youtube <url>
```

**Pinterest (Mocked extraction for now):**
```bash
bridge ingest pinterest <board_url>
```

**Image (Local file or URL):**
```bash
bridge ingest image <file_or_url>
```

**Article:**
```bash
bridge ingest article <url>
```

**Audio:**
```bash
bridge ingest audio <file_or_url>
```

## Extending Descriptors

The architecture supports a clean extension point for proprietary rules. You can update `install_bridge/descriptors/proprietary_rules.py` to inject custom heuristics into the semantic descriptors for any ingestion module.

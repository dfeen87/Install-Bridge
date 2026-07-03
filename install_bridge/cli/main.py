import typer
import json
import logging
from typing import Optional

from ..config import load_config, set_config_value, get_config_path
from ..api import SemanticAPIClient
from ..ingestion import (
    YouTubeIngestionModule,
    ArticleIngestionModule,
    ImageIngestionModule,
    PinterestIngestionModule,
    AudioIngestionModule
)

app = typer.Typer(help="Install-Bridge 3.0: Semantic Ingestion CLI")
config_app = typer.Typer(help="Manage configuration settings")
ingest_app = typer.Typer(help="Ingest and index content")

app.add_typer(config_app, name="config")
app.add_typer(ingest_app, name="ingest")

def setup_logging():
    config = load_config()
    level = getattr(logging, config.get("log_level", "INFO").upper(), logging.INFO)
    logging.basicConfig(level=level, format="%(levelname)s: %(message)s")

@app.callback()
def main_callback():
    setup_logging()

@config_app.command("show")
def config_show():
    """Display current configuration settings."""
    config = load_config()
    path = get_config_path()
    typer.echo(f"Configuration file: {path}")
    typer.echo(json.dumps(config, indent=2))

@config_app.command("set")
def config_set(key: str, value: str):
    """Set a configuration value."""
    set_config_value(key, value)
    typer.echo(f"Set '{key}' to '{value}'.")

def process_ingestion(module, source: str):
    """Helper to process ingestion and send to API."""
    try:
        typer.echo(f"Ingesting {source}...")
        payload = module.ingest(source)

        # Don't echo the massive embedding arrays to console if present
        display_payload = payload.copy()
        if "embeddings" in display_payload:
            display_payload["embeddings"] = {k: f"<{len(v)} dims>" for k, v in display_payload["embeddings"].items()}

        typer.echo("Generated Payload:")
        typer.echo(json.dumps(display_payload, indent=2))

        client = SemanticAPIClient()
        typer.echo("Indexing to Semantic API...")
        response = client.index_payload(payload)

        typer.echo("Success!")
        typer.echo(json.dumps(response, indent=2))
    except Exception as e:
        typer.echo(f"Error: {e}", err=True)

@ingest_app.command("youtube")
def ingest_youtube(url: str = typer.Argument(..., help="YouTube URL to ingest")):
    """Ingest a YouTube video."""
    module = YouTubeIngestionModule()
    process_ingestion(module, url)

@ingest_app.command("pinterest")
def ingest_pinterest(board_url: str = typer.Argument(..., help="Pinterest Board URL to ingest")):
    """Ingest a Pinterest board."""
    module = PinterestIngestionModule()
    process_ingestion(module, board_url)

@ingest_app.command("image")
def ingest_image(file_or_url: str = typer.Argument(..., help="Local file path or URL to an image")):
    """Ingest an image."""
    module = ImageIngestionModule()
    process_ingestion(module, file_or_url)

@ingest_app.command("article")
def ingest_article(url: str = typer.Argument(..., help="Article URL to ingest")):
    """Ingest an article."""
    module = ArticleIngestionModule()
    process_ingestion(module, url)

@ingest_app.command("audio")
def ingest_audio(file_or_url: str = typer.Argument(..., help="Local file path or URL to an audio file")):
    """Ingest an audio file."""
    module = AudioIngestionModule()
    process_ingestion(module, file_or_url)

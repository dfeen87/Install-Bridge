import json
import os
from pathlib import Path
from platformdirs import user_config_dir

APP_NAME = "install-bridge"
CONFIG_FILE = "config.json"

DEFAULT_CONFIG = {
    "api_url": "http://localhost:8000",
    "use_embeddings": False,
    "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
    "image_model": "openai/clip-vit-base-patch32",
    "audio_model": "default-audio-model",
    "log_level": "INFO",
}

def get_config_dir() -> Path:
    return Path(user_config_dir(APP_NAME))

def get_config_path() -> Path:
    return get_config_dir() / CONFIG_FILE

def load_config() -> dict:
    config_path = get_config_path()
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            try:
                user_config = json.load(f)
                config = DEFAULT_CONFIG.copy()
                config.update(user_config)
                return config
            except json.JSONDecodeError:
                return DEFAULT_CONFIG.copy()
    return DEFAULT_CONFIG.copy()

def save_config(config: dict) -> None:
    config_dir = get_config_dir()
    config_dir.mkdir(parents=True, exist_ok=True)
    config_path = get_config_path()
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

def set_config_value(key: str, value: str) -> None:
    config = load_config()

    # Handle boolean conversion
    if value.lower() in ("true", "yes", "1"):
        config[key] = True
    elif value.lower() in ("false", "no", "0"):
        config[key] = False
    else:
        config[key] = value

    save_config(config)

def get_config_value(key: str) -> str:
    config = load_config()
    return config.get(key, None)

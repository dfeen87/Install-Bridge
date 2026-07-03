import json
from unittest.mock import patch, mock_open
from install_bridge.config.settings import load_config, set_config_value, DEFAULT_CONFIG

@patch("install_bridge.config.settings.get_config_path")
def test_load_config_default(mock_path, tmp_path):
    mock_path.return_value = tmp_path / "config.json"
    config = load_config()
    assert config == DEFAULT_CONFIG

@patch("install_bridge.config.settings.get_config_path")
def test_load_config_custom(mock_path, tmp_path):
    config_file = tmp_path / "config.json"
    mock_path.return_value = config_file

    custom_data = {"api_url": "http://example.com"}
    config_file.write_text(json.dumps(custom_data))

    config = load_config()
    assert config["api_url"] == "http://example.com"
    # Ensure other defaults are maintained
    assert config["use_embeddings"] == DEFAULT_CONFIG["use_embeddings"]

@patch("install_bridge.config.settings.get_config_path")
@patch("install_bridge.config.settings.get_config_dir")
def test_set_config_value(mock_dir, mock_path, tmp_path):
    mock_dir.return_value = tmp_path
    config_file = tmp_path / "config.json"
    mock_path.return_value = config_file

    set_config_value("use_embeddings", "true")

    with open(config_file, "r") as f:
        saved_config = json.load(f)

    assert saved_config["use_embeddings"] is True

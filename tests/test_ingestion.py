from unittest.mock import patch, MagicMock
from install_bridge.ingestion import PinterestIngestionModule, AudioIngestionModule

def test_pinterest_ingestion():
    module = PinterestIngestionModule()

    with patch("install_bridge.embeddings.generator.EmbeddingGenerator.generate_text_embedding", return_value=None):
        payload = module.ingest("http://pinterest.com/mock")

    assert payload["type"] == "pinterest"
    assert "keywords" in payload["descriptors"]
    assert "image_urls" in payload["metadata"]

def test_audio_ingestion():
    module = AudioIngestionModule()

    with patch("install_bridge.embeddings.generator.EmbeddingGenerator.generate_audio_embedding", return_value=None):
        payload = module.ingest("/path/to/mock.mp3")

    assert payload["type"] == "audio"
    assert payload["metadata"]["genre"] == "ambient"
    assert "mood_tags" in payload["descriptors"]

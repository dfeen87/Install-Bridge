from unittest.mock import patch
from install_bridge.embeddings import EmbeddingGenerator

@patch("install_bridge.embeddings.generator.get_config_value")
def test_embedding_disabled(mock_get_config):
    # When embeddings are disabled
    mock_get_config.return_value = False
    generator = EmbeddingGenerator()

    assert generator.generate_text_embedding("test") is None
    assert generator.generate_image_embedding(None) is None
    assert generator.generate_audio_embedding(None) is None

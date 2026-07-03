import uuid
import os
from typing import Dict, Any

from .base import BaseIngestionModule
from ..descriptors import AudioDescriptorGenerator
from ..embeddings import EmbeddingGenerator

class AudioIngestionModule(BaseIngestionModule):
    """
    Basic extraction layer for Audio metadata.
    """
    def __init__(self):
        self.descriptor_gen = AudioDescriptorGenerator()
        self.embedding_gen = EmbeddingGenerator()

    def _extract_mock_metadata(self, source: str) -> Dict[str, Any]:
        # For a full implementation, you would use mutagen or similar to read ID3 tags.
        return {
            "title": os.path.basename(source),
            "genre": "ambient",
            "lyrics": "",
        }

    def ingest(self, source: str) -> Dict[str, Any]:
        metadata = self._extract_mock_metadata(source)

        descriptors = self.descriptor_gen.generate(metadata)

        embeddings = {}
        # Audio embeddings are not yet implemented in EmbeddingGenerator
        audio_emb = self.embedding_gen.generate_audio_embedding(source)
        if audio_emb:
            embeddings["audio"] = audio_emb

        payload = {
            "id": str(uuid.uuid4()),
            "type": "audio",
            "source": source,
            "descriptors": descriptors,
            "embeddings": embeddings if embeddings else {},
            "metadata": metadata
        }

        return payload

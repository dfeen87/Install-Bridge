import hashlib
import uuid
from typing import Dict, Any

import yt_dlp

from .base import BaseIngestionModule
from ..descriptors import YouTubeDescriptorGenerator
from ..embeddings import EmbeddingGenerator

class YouTubeIngestionModule(BaseIngestionModule):
    def __init__(self):
        self.descriptor_gen = YouTubeDescriptorGenerator()
        self.embedding_gen = EmbeddingGenerator()

    def ingest(self, source: str) -> Dict[str, Any]:
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'extract_flat': False,
            'writesubtitles': True,
            'allsubtitles': False,
            'subtitleslangs': ['en'],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(source, download=False)

        metadata = {
            "title": info.get("title", ""),
            "description": info.get("description", ""),
            "tags": info.get("tags", []),
            "categories": info.get("categories", []),
            "channel": info.get("uploader", ""),
            "thumbnail_url": info.get("thumbnail", ""),
        }

        # We could extract subtitles here if available, but for simplicity we rely on description/title

        descriptors = self.descriptor_gen.generate(metadata)

        embeddings = {}
        text_for_embedding = f"{metadata['title']}. {metadata['description']}"
        text_emb = self.embedding_gen.generate_text_embedding(text_for_embedding)
        if text_emb:
            embeddings["text"] = text_emb

        # Optional thumbnail embedding could go here by downloading the image and passing to self.embedding_gen.generate_image_embedding

        payload = {
            "id": str(uuid.uuid4()),
            "type": "youtube",
            "source": source,
            "descriptors": descriptors,
            "embeddings": embeddings if embeddings else {},
            "metadata": metadata
        }

        return payload

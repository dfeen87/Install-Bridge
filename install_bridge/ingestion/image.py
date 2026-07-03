import uuid
import os
import httpx
from io import BytesIO
from typing import Dict, Any, List

from PIL import Image

from .base import BaseIngestionModule
from ..descriptors import ImageDescriptorGenerator
from ..embeddings import EmbeddingGenerator

class ImageIngestionModule(BaseIngestionModule):
    def __init__(self):
        self.descriptor_gen = ImageDescriptorGenerator()
        self.embedding_gen = EmbeddingGenerator()

    def _extract_palette(self, img: Image.Image, num_colors=5) -> List[str]:
        # Simple palette extraction using quantize
        # Convert to RGB just in case
        img_rgb = img.convert("RGB")
        q_img = img_rgb.quantize(colors=num_colors)
        palette = q_img.getpalette()

        colors = []
        if palette:
            for i in range(num_colors):
                r, g, b = palette[i*3:i*3+3]
                colors.append(f"#{r:02x}{g:02x}{b:02x}")
        return colors

    def ingest(self, source: str) -> Dict[str, Any]:
        is_url = source.startswith("http://") or source.startswith("https://")

        if is_url:
            with httpx.Client() as client:
                response = client.get(source)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
            filename = source.split("/")[-1]
        else:
            img = Image.open(source)
            filename = os.path.basename(source)

        exif = img.getexif()
        exif_data = {str(k): str(v) for k, v in exif.items()} if exif else {}

        palette = self._extract_palette(img)

        metadata = {
            "filename": filename,
            "format": img.format,
            "dimensions": f"{img.width}x{img.height}",
            "palette": palette,
            "exif": exif_data
        }

        descriptors = self.descriptor_gen.generate(metadata)

        embeddings = {}
        image_emb = self.embedding_gen.generate_image_embedding(img)
        if image_emb:
            embeddings["image"] = image_emb

        payload = {
            "id": str(uuid.uuid4()),
            "type": "image",
            "source": source,
            "descriptors": descriptors,
            "embeddings": embeddings if embeddings else {},
            "metadata": metadata
        }

        return payload

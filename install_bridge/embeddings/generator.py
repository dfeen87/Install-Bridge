from typing import Any
import logging
from typing import List, Optional, Union
from PIL.Image import Image

from ..config.settings import get_config_value

logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    def __init__(self):
        self.use_embeddings = get_config_value("use_embeddings")
        self.text_model_name = get_config_value("embedding_model")
        self.image_model_name = get_config_value("image_model")

        self._text_model = None
        self._image_processor = None
        self._image_model = None

    def _load_text_model(self):
        if self._text_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading text embedding model: {self.text_model_name}")
                self._text_model = SentenceTransformer(self.text_model_name)
            except ImportError:
                logger.error("sentence-transformers is not installed.")
                raise
            except Exception as e:
                logger.error(f"Failed to load text embedding model: {e}")
                raise

    def _load_image_model(self):
        if self._image_model is None or self._image_processor is None:
            try:
                from transformers import CLIPProcessor, CLIPModel
                logger.info(f"Loading image embedding model: {self.image_model_name}")
                self._image_processor = CLIPProcessor.from_pretrained(self.image_model_name)
                self._image_model = CLIPModel.from_pretrained(self.image_model_name)
            except ImportError:
                logger.error("transformers is not installed.")
                raise
            except Exception as e:
                logger.error(f"Failed to load image embedding model: {e}")
                raise

    def generate_text_embedding(self, text: str) -> Optional[List[float]]:
        if not self.use_embeddings or not text:
            return None

        try:
            self._load_text_model()
            # Encode and convert to list of floats
            embedding = self._text_model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.warning(f"Failed to generate text embedding: {e}")
            return None

    def generate_image_embedding(self, image: Image) -> Optional[List[float]]:
        if not self.use_embeddings or image is None:
            return None

        try:
            self._load_image_model()
            inputs = self._image_processor(images=image, return_tensors="pt")

            # We must import torch here locally if it's needed for the actual processing
            import torch
            with torch.no_grad():
                image_features = self._image_model.get_image_features(**inputs)

            return image_features.squeeze().tolist()
        except Exception as e:
            logger.warning(f"Failed to generate image embedding: {e}")
            return None

    def generate_audio_embedding(self, audio_data: Any) -> Optional[List[float]]:
        # Placeholder for future audio embedding support
        if not self.use_embeddings:
            return None
        logger.info("Audio embeddings are not yet implemented.")
        return None

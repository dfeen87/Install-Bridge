import uuid
from typing import Dict, Any

from newspaper import Article as NewsArticle
import nltk

from .base import BaseIngestionModule
from ..descriptors import ArticleDescriptorGenerator
from ..embeddings import EmbeddingGenerator

# Ensure punckt is downloaded for newspaper3k nlp()
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class ArticleIngestionModule(BaseIngestionModule):
    def __init__(self):
        self.descriptor_gen = ArticleDescriptorGenerator()
        self.embedding_gen = EmbeddingGenerator()

    def ingest(self, source: str) -> Dict[str, Any]:
        article = NewsArticle(source)
        article.download()
        article.parse()
        try:
            article.nlp()
        except Exception:
            pass # NLP extraction can fail if NLTK data isn't loaded properly

        metadata = {
            "title": article.title,
            "summary": article.summary,
            "text": article.text,
            "keywords": article.keywords,
            "authors": article.authors,
            "publish_date": str(article.publish_date) if article.publish_date else None,
        }

        descriptors = self.descriptor_gen.generate(metadata)

        embeddings = {}
        text_for_embedding = f"{metadata['title']}. {metadata['summary']}"
        text_emb = self.embedding_gen.generate_text_embedding(text_for_embedding)
        if text_emb:
            embeddings["text"] = text_emb

        payload = {
            "id": str(uuid.uuid4()),
            "type": "article",
            "source": source,
            "descriptors": descriptors,
            "embeddings": embeddings if embeddings else {},
            "metadata": metadata
        }

        return payload

import spacy
from typing import List, Dict, Any

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback if not downloaded, though poetry command handled it
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class BaseDescriptorGenerator:
    """Base class for descriptor generation."""

    def __init__(self):
        pass

    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """Extract noun chunks and entities as keywords."""
        if not text:
            return []
        doc = nlp(text)
        keywords = set()

        # Add named entities
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PERSON", "GPE", "PRODUCT", "EVENT"]:
                keywords.add(ent.text.lower())

        # Add noun chunks
        for chunk in doc.noun_chunks:
            # Filter out basic pronouns
            if chunk.root.pos_ != "PRON":
                keywords.add(chunk.text.lower())

        # Fallback to just nouns and adjectives if list is empty
        if not keywords:
            for token in doc:
                if token.pos_ in ["NOUN", "ADJ"] and not token.is_stop:
                    keywords.add(token.lemma_.lower())

        # Sort by length or just return a list
        sorted_keywords = sorted(list(keywords), key=lambda x: len(x), reverse=True)
        return sorted_keywords[:max_keywords]

    def extract_topics(self, text: str) -> List[str]:
        """Extract top-level topics from text."""
        return self.extract_keywords(text, max_keywords=5)

    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate descriptors from raw data. To be overridden by subclasses."""
        raise NotImplementedError

from typing import Dict, Any
from .base import BaseDescriptorGenerator
from .proprietary_rules import apply_pinterest_rules

class PinterestDescriptorGenerator(BaseDescriptorGenerator):
    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title", "")
        description = data.get("description", "")
        captions = data.get("captions", [])

        combined_text = f"{title}. {description}. " + " ".join(captions)
        keywords = self.extract_keywords(combined_text)

        descriptors = {
            "keywords": keywords,
            "aesthetic_tags": self._extract_aesthetic_tags(combined_text),
            "board_category": data.get("category", "unknown"),
        }

        return apply_pinterest_rules(descriptors, data)

    def _extract_aesthetic_tags(self, text: str) -> list[str]:
        # Simple heuristic
        known_aesthetics = ["vintage", "modern", "minimalist", "dark academia", "cottagecore", "cyberpunk"]
        text_lower = text.lower()
        return [tag for tag in known_aesthetics if tag in text_lower]

from typing import Dict, Any
from .base import BaseDescriptorGenerator
from .proprietary_rules import apply_audio_rules

class AudioDescriptorGenerator(BaseDescriptorGenerator):
    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title", "")
        lyrics = data.get("lyrics", "")
        genre = data.get("genre", "Unknown")

        combined_text = f"{title}. {lyrics}"
        keywords = self.extract_keywords(combined_text)

        descriptors = {
            "keywords": keywords,
            "genre": genre,
            "mood_tags": self._derive_mood(data),
            "topics": self.extract_topics(combined_text) if lyrics else []
        }

        return apply_audio_rules(descriptors, data)

    def _derive_mood(self, data: Dict[str, Any]) -> list[str]:
        # Simple placeholder heuristic
        genre = data.get("genre", "").lower()
        if "rock" in genre or "metal" in genre:
            return ["energetic", "intense"]
        elif "ambient" in genre or "classical" in genre:
            return ["calm", "relaxing"]
        elif "pop" in genre:
            return ["upbeat", "happy"]
        return ["neutral"]

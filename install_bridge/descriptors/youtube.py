from typing import Dict, Any, List
from .base import BaseDescriptorGenerator
from .proprietary_rules import apply_youtube_rules

class YouTubeDescriptorGenerator(BaseDescriptorGenerator):
    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title") or ""
        description = data.get("description") or ""
        tags = data.get("tags") or []

        combined_text = f"{title} {description}"
        keywords = self.extract_keywords(combined_text)

        # Merge yt-dlp tags with extracted keywords
        all_keywords = list(dict.fromkeys(tags + keywords))

        categories = data.get("categories") or ["Unknown"]
        if isinstance(categories, str):
            categories = [categories]

        descriptors = {
            "keywords": all_keywords,
            "categories": [categories[0]],
            "topics": self.extract_topics(combined_text)
        }

        # Apply future proprietary rules
        return apply_youtube_rules(descriptors, data)

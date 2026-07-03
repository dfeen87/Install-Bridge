from typing import Dict, Any, List
from .base import BaseDescriptorGenerator
from .proprietary_rules import apply_youtube_rules

class YouTubeDescriptorGenerator(BaseDescriptorGenerator):
    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title", "")
        description = data.get("description", "")
        tags = data.get("tags", [])

        combined_text = f"{title} {description}"
        keywords = self.extract_keywords(combined_text)

        # Merge yt-dlp tags with extracted keywords
        all_keywords = list(set(tags + keywords))

        descriptors = {
            "keywords": all_keywords,
            "categories": [data.get("categories", ["Unknown"])[0]] if data.get("categories") else ["Unknown"],
            "topics": self.extract_topics(combined_text)
        }

        # Apply future proprietary rules
        return apply_youtube_rules(descriptors, data)

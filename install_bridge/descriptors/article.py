from typing import Dict, Any
from .base import BaseDescriptorGenerator
from .proprietary_rules import apply_article_rules

class ArticleDescriptorGenerator(BaseDescriptorGenerator):
    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title") or ""
        summary = data.get("summary") or ""
        text = data.get("text") or ""
        meta_keywords = data.get("keywords") or []

        combined_text = f"{title}. {summary}. {text[:1000]}" # Use first 1000 chars for speed

        extracted_keywords = self.extract_keywords(combined_text)
        all_keywords = list(dict.fromkeys(meta_keywords + extracted_keywords))

        descriptors = {
            "keywords": all_keywords,
            "topics": self.extract_topics(combined_text),
            "summary_length": len(summary)
        }

        return apply_article_rules(descriptors, data)

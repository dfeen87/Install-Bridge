from typing import Dict, Any, List
from .base import BaseDescriptorGenerator
from .proprietary_rules import apply_image_rules

class ImageDescriptorGenerator(BaseDescriptorGenerator):
    def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        filename = data.get("filename", "")
        # Palette will be extracted in the ingestion phase using PIL and passed here
        palette = data.get("palette", [])

        keywords = self.extract_keywords(filename.replace("-", " ").replace("_", " "))

        descriptors = {
            "keywords": keywords,
            "color_palette": palette,
            "format": data.get("format", "unknown"),
            "dimensions": data.get("dimensions", "unknown"),
            "style_tags": self._derive_style_tags(data)
        }

        return apply_image_rules(descriptors, data)

    def _derive_style_tags(self, data: Dict[str, Any]) -> List[str]:
        # Simple heuristic, to be expanded
        format_type = data.get("format", "").lower()
        if format_type in ["jpeg", "jpg"]:
            return ["photographic"]
        elif format_type in ["png"]:
            return ["graphic", "digital"]
        elif format_type in ["gif"]:
            return ["animated"]
        return ["mixed"]

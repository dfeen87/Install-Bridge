import httpx
import logging
from typing import Dict, Any

from ..config.settings import get_config_value

logger = logging.getLogger(__name__)

class SemanticAPIClient:
    def __init__(self):
        self.api_url = get_config_value("api_url")
        self.endpoint = f"{self.api_url.rstrip('/')}/semantic-index"

    def index_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sends the ingestion payload to the Semantic Dropdown Search API.

        Payload expected structure:
        {
            "id": "<unique_id>",
            "type": "<youtube|pinterest|image|article|audio>",
            "source": "<url_or_file>",
            "descriptors": {...},
            "embeddings": {...},
            "metadata": {...}
        }
        """
        logger.info(f"Sending payload to {self.endpoint}")

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(self.endpoint, json=payload)
                response.raise_for_status()
                logger.info("Payload indexed successfully.")
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Request Error: Failed to connect to {self.endpoint} - {e}")
            raise

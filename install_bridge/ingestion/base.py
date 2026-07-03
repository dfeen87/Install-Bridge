from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseIngestionModule(ABC):

    @abstractmethod
    def ingest(self, source: str) -> Dict[str, Any]:
        """
        Extract data from the source, generate descriptors, optionally generate
        embeddings, and return the final payload ready to be sent to the API.
        """
        pass

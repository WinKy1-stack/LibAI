"""
UW-Madison Worker
Specialized worker for UW-Madison Z39.50 server
"""

from .z3950_worker import Z3950Worker
import logging

logger = logging.getLogger(__name__)


class UWWorker(Z3950Worker):
    """Worker for UW-Madison Z39.50 server"""

    def __init__(self):
        super().__init__('uw')

    def search(self, query: str, query_type: str = "keyword", limit: int = None):
        """
        Search UW-Madison with optional enhancements

        Args:
            query: Search query
            query_type: Type of search
            limit: Max results

        Returns:
            List of LibraryRecordLite dictionaries
        """
        logger.info(f"Searching UW-Madison for: {query}")
        results = super().search(query, query_type, limit)

        # Add UW-specific metadata
        for record in results:
            record['source']['url'] = "https://search.library.wisc.edu"

        return results

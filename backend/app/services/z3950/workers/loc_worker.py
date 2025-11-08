"""
Library of Congress (LOC) Worker
Specialized worker for LOC Z39.50 server
"""

from .z3950_worker import Z3950Worker
import logging

logger = logging.getLogger(__name__)


class LOCWorker(Z3950Worker):
    """Worker for Library of Congress Z39.50 server"""

    def __init__(self):
        super().__init__('loc')

    def search(self, query: str, query_type: str = "keyword", limit: int = None):
        """
        Search LOC with optional enhancements

        Args:
            query: Search query
            query_type: Type of search
            limit: Max results

        Returns:
            List of LibraryRecordLite dictionaries
        """
        logger.info(f"Searching Library of Congress for: {query}")
        results = super().search(query, query_type, limit)

        # Add LOC-specific metadata
        for record in results:
            record['source']['url'] = f"https://lccn.loc.gov/{record.get('record_id', '')}"

        return results

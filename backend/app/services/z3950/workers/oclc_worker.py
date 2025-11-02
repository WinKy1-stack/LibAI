"""
OCLC WorldCat Worker
Specialized worker for OCLC Z39.50 server (requires authentication)
"""

from .z3950_worker import Z3950Worker
import logging
import os

logger = logging.getLogger(__name__)


class OCLCWorker(Z3950Worker):
    """Worker for OCLC WorldCat Z39.50 server"""

    def __init__(self):
        super().__init__('oclc')

        # Load credentials from environment if available
        self.config['username'] = os.getenv('OCLC_USERNAME', self.config.get('username', ''))
        self.config['password'] = os.getenv('OCLC_PASSWORD', self.config.get('password', ''))

    def connect(self) -> bool:
        """
        Connect to OCLC with authentication

        Returns:
            True if successful, False otherwise
        """
        if not self.config['username'] or not self.config['password']:
            logger.error("OCLC requires authentication. Set OCLC_USERNAME and OCLC_PASSWORD")
            return False

        return super().connect()

    def search(self, query: str, query_type: str = "keyword", limit: int = None):
        """
        Search OCLC WorldCat

        Args:
            query: Search query
            query_type: Type of search
            limit: Max results

        Returns:
            List of LibraryRecordLite dictionaries
        """
        if not self.config.get('enabled', False):
            logger.warning("OCLC is disabled. Enable in config and provide credentials.")
            return []

        logger.info(f"Searching OCLC WorldCat for: {query}")
        results = super().search(query, query_type, limit)

        # Add OCLC-specific metadata
        for record in results:
            record['source']['url'] = f"https://www.worldcat.org/search?q={query}"

        return results

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

        # Add LOC-specific URL to access field if control_number is available
        for record in results:
            control_number = record.get('control_number', '')
            if control_number:
                # Update access.online_url with LOC URL if not already set
                access = record.get('access') or {}
                if not access.get('online_url'):
                    access['online_url'] = f"https://lccn.loc.gov/{control_number}"
                    access['restrictions'] = access.get('restrictions', '')
                    record['access'] = access

        return results

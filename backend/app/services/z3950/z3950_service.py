"""
Z39.50 Service Orchestrator
Coordinates multi-source searches with caching and database integration
"""

from typing import List, Dict, Any, Optional
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from .workers import LOCWorker, UWWorker, OCLCWorker
from .cache import Z3950Cache
from .config import Z3950_SOURCES
from app.utils.mongo_helper import MongoHelper

logger = logging.getLogger(__name__)


class Z3950Service:
    """Main service for Z39.50 operations"""

    def __init__(self, cache_enabled: bool = True):
        """
        Initialize Z39.50 service

        Args:
            cache_enabled: Whether to use Redis caching
        """
        self.cache = Z3950Cache() if cache_enabled else None
        self.worker_map = {
            'loc': LOCWorker,
            'uw': UWWorker,
            'oclc': OCLCWorker
        }

    def search_single(
        self,
        source: str,
        query: str,
        query_type: str = "keyword",
        limit: int = 5,
        use_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search a single Z39.50 source

        Args:
            source: Source key (loc, uw, oclc)
            query: Search query
            query_type: Type of search
            limit: Maximum results
            use_cache: Whether to use cache

        Returns:
            List of LibraryRecordLite dictionaries
        """
        # Check cache first
        if use_cache and self.cache:
            cached = self.cache.get(source, query, query_type, limit)
            if cached is not None:
                return cached

        # Search Z39.50
        if source not in self.worker_map:
            logger.error(f"Unknown source: {source}")
            return []

        try:
            worker_class = self.worker_map[source]
            with worker_class() as worker:
                results = worker.search(query, query_type, limit)

            # Cache results
            if use_cache and self.cache and results:
                self.cache.set(source, query, query_type, limit, results)

            return results

        except Exception as e:
            logger.error(f"Error searching {source}: {str(e)}")
            return []

    def search_all(
        self,
        query: str,
        query_type: str = "keyword",
        limit: int = 5,
        use_cache: bool = True
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Search all enabled Z39.50 sources in parallel

        Args:
            query: Search query
            query_type: Type of search
            limit: Maximum results per source
            use_cache: Whether to use cache

        Returns:
            Dictionary with source keys and their results
        """
        # Check cache for multi-source search
        if use_cache and self.cache:
            cached = self.cache.get('all', query, query_type, limit)
            if cached is not None:
                return cached

        results = {}
        enabled_sources = [
            source for source, config in Z3950_SOURCES.items()
            if config.get('enabled', False)
        ]

        # Search in parallel
        with ThreadPoolExecutor(max_workers=len(enabled_sources)) as executor:
            future_to_source = {
                executor.submit(
                    self.search_single,
                    source,
                    query,
                    query_type,
                    limit,
                    use_cache=False  # Don't double-cache
                ): source
                for source in enabled_sources
            }

            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    source_results = future.result()
                    results[source] = source_results
                    logger.info(f"Got {len(source_results)} results from {source}")
                except Exception as e:
                    logger.error(f"Error getting results from {source}: {str(e)}")
                    results[source] = []

        # Cache combined results
        if use_cache and self.cache:
            self.cache.set('all', query, query_type, limit, results)

        return results

    def search_and_save(
        self,
        query: str,
        query_type: str = "keyword",
        limit: int = 5,
        source: Optional[str] = None,
        save_to_db: bool = True
    ) -> Dict[str, Any]:
        """
        Search Z39.50 and optionally save new records to database

        Args:
            query: Search query
            query_type: Type of search
            limit: Maximum results
            source: Specific source or None for all sources
            save_to_db: Whether to save new records to database

        Returns:
            Dictionary with results and stats
        """
        # Search
        if source:
            raw_results = {source: self.search_single(source, query, query_type, limit)}
        else:
            raw_results = self.search_all(query, query_type, limit)

        # Flatten results
        all_records = []
        for source_key, records in raw_results.items():
            all_records.extend(records)

        stats = {
            "total_found": len(all_records),
            "sources_searched": list(raw_results.keys()),
            "saved_to_db": 0,
            "already_in_db": 0,
            "errors": 0
        }

        # Save to database if requested
        if save_to_db and all_records:
            for record in all_records:
                try:
                    # Check if ISBN already exists
                    isbn_values = [
                        isbn['value']
                        for isbn in record.get('identifiers', {}).get('isbn', [])
                    ]

                    if isbn_values:
                        existing = MongoHelper.find_one(
                            'marc_records',
                            {'identifiers.isbn.value': {'$in': isbn_values}}
                        )

                        if existing:
                            stats['already_in_db'] += 1
                            logger.info(f"Record with ISBN {isbn_values[0]} already exists")
                            continue

                    # Save new record
                    MongoHelper.insert_one('marc_records', record)
                    stats['saved_to_db'] += 1
                    logger.info(f"Saved new record: {record.get('title', {}).get('main', 'Unknown')}")

                except Exception as e:
                    logger.error(f"Error saving record to DB: {str(e)}")
                    stats['errors'] += 1

        return {
            "query": query,
            "query_type": query_type,
            "results": raw_results,
            "stats": stats
        }

    def clear_cache(self) -> bool:
        """
        Clear all cache entries

        Returns:
            True if successful
        """
        if self.cache:
            return self.cache.clear_all()
        return False

    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Cache stats dictionary
        """
        if self.cache:
            return self.cache.get_stats()
        return {"enabled": False}

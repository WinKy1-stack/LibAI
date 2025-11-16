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
from .local_db_search import search_local_db
from .enrichment import enrich_with_google_books
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
        if use_cache and self.cache:
            cached = self.cache.get(source, query, query_type, limit)
            if cached is not None:
                return cached

        if source not in self.worker_map:
            logger.error(f"Unknown source: {source}")
            return []

        try:
            worker_class = self.worker_map[source]
            with worker_class() as worker:
                results = worker.search(query, query_type, limit)

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
        if use_cache and self.cache:
            cached = self.cache.get('all', query, query_type, limit)
            if cached is not None:
                return cached

        results = {}
        enabled_sources = [
            source for source, config in Z3950_SOURCES.items()
            if config.get('enabled', False)
        ]

        with ThreadPoolExecutor(max_workers=len(enabled_sources)) as executor:
            future_to_source = {
                executor.submit(
                    self.search_single,
                    source,
                    query,
                    query_type,
                    limit,
                    use_cache=False
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

        if use_cache and self.cache:
            self.cache.set('all', query, query_type, limit, results)

        return results

    def search_local_db(
        self,
        query: str,
        query_type: str = "keyword",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search in local MongoDB database

        Args:
            query: Search query
            query_type: Type of search
            limit: Maximum results

        Returns:
            List of records from local database
        """
        return search_local_db(query, query_type, limit)

    def search_and_save(
        self,
        query: str,
        query_type: str = "keyword",
        limit: int = 5,
        source: Optional[str] = None,
        save_to_db: bool = True,
        search_local_first: bool = True
    ) -> Dict[str, Any]:
        """
        Search Z39.50 and optionally save new records to database
        Also searches local database first if search_local_first is True

        Args:
            query: Search query
            query_type: Type of search
            limit: Maximum results
            source: Specific source or None for all sources
            save_to_db: Whether to save new records to database
            search_local_first: Whether to search local database first

        Returns:
            Dictionary with results and stats
        """
        raw_results = {}

        if search_local_first:
            local_results = self.search_local_db(query, query_type, limit)
            if local_results:
                raw_results['local'] = local_results
                logger.info(f"Found {len(local_results)} results in local database")

        z3950_results = {}
        if source:
            z3950_results = {source: self.search_single(source, query, query_type, limit)}
        else:
            z3950_results = self.search_all(query, query_type, limit)

        for source_key, records in z3950_results.items():
            raw_results[source_key] = records

        all_records = []
        z3950_records = []
        for source_key, records in raw_results.items():
            all_records.extend(records)

            if source_key != 'local':
                z3950_records.extend(records)

        stats = {
            "total_found": len(all_records),
            "sources_searched": list(raw_results.keys()),
            "saved_to_db": 0,
            "already_in_db": 0,
            "errors": 0
        }

        if save_to_db and z3950_records:
            for record in z3950_records:
                try:
                    isbn_values = record.get('identifiers', {}).get('isbn', [])
                    control_number = record.get('control_number', '')

                    existing = None
                    if control_number:
                        existing = MongoHelper.find_one(
                            'marc_21',
                            {'control_number': control_number}
                        )

                    if not existing and isbn_values:
                        existing = MongoHelper.find_one(
                            'marc_21',
                            {'identifiers.isbn': {'$in': isbn_values}}
                        )

                    if existing:
                        stats['already_in_db'] += 1
                        logger.info(f"Record already exists: {control_number or isbn_values[0] if isbn_values else 'unknown'}")
                        continue

                    record = enrich_with_google_books(record)

                    MongoHelper.insert_one('marc_21', record)
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

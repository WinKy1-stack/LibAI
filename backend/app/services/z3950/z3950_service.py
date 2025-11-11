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
from app.services.google_books import GoogleBooksService

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

    def search_local_db(
        self,
        query: str,
        query_type: str = "keyword",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search in local MongoDB database with improved accuracy
        
        Uses MongoDB text search for better performance and relevance scoring,
        combined with regex for exact phrase matching.

        Args:
            query: Search query
            query_type: Type of search
            limit: Maximum results

        Returns:
            List of records from local database, sorted by relevance
        """
        try:
            from app.config import Config
            from app import mongo
            
            # Clean and prepare query
            query = query.strip()
            if not query:
                return []
            
            # Escape special regex characters for exact matching
            import re
            escaped_query = re.escape(query)
            
            # Build search queries with priority (most specific first)
            queries = []
            
            if query_type == "keyword":
                # Strategy 1: Exact phrase match (highest priority)
                exact_phrase_query = {
                    "$or": [
                        {"title.main": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                        {"title.main": {"$regex": f"^{escaped_query}\\s", "$options": "i"}},
                        {"title.main": {"$regex": f"\\s{escaped_query}$", "$options": "i"}},
                        {"title.main": {"$regex": f"\\s{escaped_query}\\s", "$options": "i"}},
                        {"title.subtitle": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                        {"title.subtitle": {"$regex": f"^{escaped_query}\\s", "$options": "i"}},
                        {"contributors.name": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                        {"contributors.name": {"$regex": f"^{escaped_query}\\s", "$options": "i"}},
                        {"subjects": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                    ]
                }
                queries.append(exact_phrase_query)
                
                # Strategy 2: Phrase contains query (word boundaries)
                phrase_contains_query = {
                    "$or": [
                        {"title.main": {"$regex": escaped_query, "$options": "i"}},
                        {"title.subtitle": {"$regex": escaped_query, "$options": "i"}},
                        {"contributors.name": {"$regex": escaped_query, "$options": "i"}},
                        {"subjects": {"$regex": escaped_query, "$options": "i"}},
                        {"publication.publisher": {"$regex": escaped_query, "$options": "i"}},
                    ]
                }
                queries.append(phrase_contains_query)
                
                # Strategy 3: MongoDB text search (for relevance scoring)
                # Split query into words and use text search
                words = query.split()
                significant_words = [w for w in words if len(w) > 2]
                
                if significant_words:
                    # Use text search if we have significant words
                    text_search_query = {"$text": {"$search": " ".join(significant_words)}}
                    queries.append(text_search_query)
                    
                    # Strategy 4: All words match (AND logic) - more restrictive
                    if len(significant_words) > 1:
                        and_conditions = []
                        for word in significant_words:
                            word_escaped = re.escape(word)
                            and_conditions.append({
                                "$or": [
                                    {"title.main": {"$regex": word_escaped, "$options": "i"}},
                                    {"title.subtitle": {"$regex": word_escaped, "$options": "i"}},
                                    {"contributors.name": {"$regex": word_escaped, "$options": "i"}},
                                    {"subjects": {"$regex": word_escaped, "$options": "i"}},
                                ]
                            })
                        if and_conditions:
                            queries.append({"$and": and_conditions})
                
            elif query_type == "title":
                # Title search: prioritize exact matches
                exact_title_query = {
                    "$or": [
                        {"title.main": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                        {"title.main": {"$regex": f"^{escaped_query}\\s", "$options": "i"}},
                        {"title.main": {"$regex": f"\\s{escaped_query}$", "$options": "i"}},
                        {"title.main": {"$regex": f"\\s{escaped_query}\\s", "$options": "i"}},
                        {"title.subtitle": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                        {"title.subtitle": {"$regex": f"^{escaped_query}\\s", "$options": "i"}},
                    ]
                }
                queries.append(exact_title_query)
                
                # Contains query
                contains_title_query = {
                    "$or": [
                        {"title.main": {"$regex": escaped_query, "$options": "i"}},
                        {"title.subtitle": {"$regex": escaped_query, "$options": "i"}},
                    ]
                }
                queries.append(contains_title_query)
                
                # Text search for title
                words = query.split()
                significant_words = [w for w in words if len(w) > 2]
                if significant_words:
                    text_search_query = {
                        "$text": {"$search": " ".join(significant_words)}
                    }
                    queries.append(text_search_query)
                    
            elif query_type == "author":
                # Author search: exact match first
                exact_author_query = {
                    "$or": [
                        {"contributors.name": {"$regex": f"^{escaped_query}$", "$options": "i"}},
                        {"contributors.name": {"$regex": f"^{escaped_query}\\s", "$options": "i"}},
                        {"contributors.name": {"$regex": f"\\s{escaped_query}$", "$options": "i"}},
                    ]
                }
                queries.append(exact_author_query)
                
                # Contains query
                contains_author_query = {
                    "contributors.name": {"$regex": escaped_query, "$options": "i"}
                }
                queries.append(contains_author_query)
                
            elif query_type == "subject":
                # Subject search
                exact_subject_query = {
                    "subjects": {"$regex": f"^{escaped_query}$", "$options": "i"}
                }
                queries.append(exact_subject_query)
                
                contains_subject_query = {
                    "subjects": {"$regex": escaped_query, "$options": "i"}
                }
                queries.append(contains_subject_query)
                
            elif query_type == "isbn":
                # ISBN search: exact match only
                isbn_clean = query.replace("-", "").replace(" ", "").strip()
                isbn_query = {
                    "$or": [
                        {"identifiers.isbn": query},
                        {"identifiers.isbn": isbn_clean},
                        {"identifiers.isbn": {"$regex": f"^{re.escape(isbn_clean)}", "$options": "i"}},
                    ]
                }
                queries.append(isbn_query)
            
            if not queries:
                return []
            
            # Try each query strategy in order, return first non-empty result
            all_records = []
            seen_ids = set()
            
            collection = mongo.db['marc_21']
            
            for mongo_query in queries:
                try:
                    # Try with text score if using text search
                    if "$text" in mongo_query:
                        cursor = collection.find(
                            mongo_query,
                            {"score": {"$meta": "textScore"}}
                        ).sort([("score", {"$meta": "textScore"})]).limit(limit * 3)
                    else:
                        cursor = collection.find(mongo_query).limit(limit * 3)
                    
                    for record in cursor:
                        record_id = record.get('_id')
                        if record_id and str(record_id) not in seen_ids:
                            # Convert ObjectId to string
                            if '_id' in record:
                                record['_id'] = str(record['_id'])
                            all_records.append(record)
                            seen_ids.add(str(record_id))
                    
                    # If we found enough exact matches, return early
                    if len(all_records) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Error executing query strategy: {str(e)}")
                    continue
            
            # Sort results: exact matches first, then by text score if available, then by created_at
            def sort_key(record):
                title_main = record.get('title', {}).get('main', '').lower()
                query_lower = query.lower()
                
                # Priority 1: Exact match
                if title_main == query_lower:
                    return (0, 0, 0)
                # Priority 2: Starts with query
                elif title_main.startswith(query_lower):
                    return (1, 0, 0)
                # Priority 3: Contains query
                elif query_lower in title_main:
                    return (2, 0, 0)
                # Priority 4: Text score (if available)
                elif 'score' in record:
                    return (3, -record.get('score', 0), 0)
                # Priority 5: Created date
                else:
                    created_at = record.get('created_at', '')
                    return (4, 0, created_at)
            
            # Sort and limit
            all_records.sort(key=sort_key)
            results = all_records[:limit]
            
            logger.info(f"Found {len(results)} records in local database for query: {query} (searched {len(all_records)} total)")
            return results
            
        except Exception as e:
            logger.error(f"Error searching local database: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return []

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
        
        # Search local database first
        if search_local_first:
            local_results = self.search_local_db(query, query_type, limit)
            if local_results:
                raw_results['local'] = local_results
                logger.info(f"Found {len(local_results)} results in local database")
        
        # Search Z39.50 if we need more results or if no local results
        z3950_results = {}
        if source:
            z3950_results = {source: self.search_single(source, query, query_type, limit)}
        else:
            z3950_results = self.search_all(query, query_type, limit)
        
        # Merge Z39.50 results
        for source_key, records in z3950_results.items():
            raw_results[source_key] = records

        # Flatten results (exclude local from z3950_records for save logic)
        all_records = []
        z3950_records = []
        for source_key, records in raw_results.items():
            # Add all records to all_records for total count
            all_records.extend(records)
            
            # Only add Z39.50 records to z3950_records for saving
            # Local records are already in DB, don't need to save
            if source_key != 'local':
                z3950_records.extend(records)

        stats = {
            "total_found": len(all_records),
            "sources_searched": list(raw_results.keys()),
            "saved_to_db": 0,
            "already_in_db": 0,
            "errors": 0
        }

        # Save to database if requested (only save Z39.50 results, not local)
        if save_to_db and z3950_records:
            for record in z3950_records:
                try:
                    # Check if record already exists by control_number or ISBN
                    isbn_values = record.get('identifiers', {}).get('isbn', [])
                    control_number = record.get('control_number', '')
                    
                    # Check for existing record
                    existing = None
                    if control_number:
                        existing = MongoHelper.find_one(
                            'marc_21',
                            {'control_number': control_number}
                        )
                    
                    if not existing and isbn_values:
                        # Check by ISBN (new structure: array of strings)
                        existing = MongoHelper.find_one(
                            'marc_21',
                            {'identifiers.isbn': {'$in': isbn_values}}
                        )

                    if existing:
                        stats['already_in_db'] += 1
                        logger.info(f"Record already exists: {control_number or isbn_values[0] if isbn_values else 'unknown'}")
                        continue

                    # Enrich record with Google Books API data
                    record = Z3950Service._enrich_with_google_books(record)

                    # Save new record
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

    @staticmethod
    def _enrich_with_google_books(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich MARC record with data from Google Books API
        
        Args:
            record: MARC record dictionary
            
        Returns:
            Enriched MARC record dictionary
        """
        try:
            # Get ISBN, title, and author for lookup
            isbn_values = record.get('identifiers', {}).get('isbn', [])
            title_info = record.get('title', {})
            title = title_info.get('main', '') if title_info else ''
            contributors = record.get('contributors', [])
            author = None
            if contributors:
                # Find first author
                for contrib in contributors:
                    if contrib.get('role') == 'author':
                        author = contrib.get('name')
                        break
            
            # Try to get book info from Google Books API
            first_isbn = isbn_values[0] if isbn_values else None
            book_info = GoogleBooksService.get_book_info(
                isbn=first_isbn,
                title=title,
                author=author
            )
            
            if book_info:
                # Update image URL if available (always update if Google Books has it)
                # Since MARC records initialize image_url as empty string, we should update it
                if book_info.get('image_url'):
                    record['image_url'] = book_info['image_url']
                    logger.debug(f"Updated image_url from Google Books: {book_info['image_url'][:50]}...")
                
                # Update access.online_url if not already set and Google Books has a preview/info link
                access = record.get('access') or {}
                if not access.get('online_url'):
                    # Prefer info_link over preview_link
                    if book_info.get('info_link'):
                        access['online_url'] = book_info['info_link']
                    elif book_info.get('preview_link'):
                        access['online_url'] = book_info['preview_link']
                    # Ensure restrictions field exists
                    if 'restrictions' not in access:
                        access['restrictions'] = ''
                    record['access'] = access
                
                logger.info(f"Enriched record with Google Books data: {title}")
            
        except Exception as e:
            logger.warning(f"Error enriching record with Google Books API: {str(e)}")
            # Continue without Google Books data if there's an error
        
        return record

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

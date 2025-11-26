"""
Local MongoDB Database Search Module
Handles searching within local MARC21 collection
"""

import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def search_local_db(query: str, query_type: str = "keyword", limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search in local MongoDB database with improved accuracy

    Uses MongoDB text search for better performance and relevance scoring,
    combined with regex for exact phrase matching.

    Args:
        query: Search query
        query_type: Type of search (keyword, title, author, subject, isbn)
        limit: Maximum results

    Returns:
        List of records from local database, sorted by relevance
    """
    try:
        from app import mongo

        query = query.strip()
        if not query:
            return []

        escaped_query = re.escape(query)

        queries = _build_search_queries(query, escaped_query, query_type)

        if not queries:
            return []

        all_records = []
        seen_ids = set()

        collection = mongo.db['marc_21']

        for mongo_query in queries:
            try:
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
                        if '_id' in record:
                            record['_id'] = str(record['_id'])
                        all_records.append(record)
                        seen_ids.add(str(record_id))

                if len(all_records) >= limit:
                    break

            except Exception as e:
                logger.warning(f"Error executing query strategy: {str(e)}")
                continue

        sorted_results = _sort_by_relevance(all_records, query)
        results = sorted_results[:limit]

        logger.info(f"Found {len(results)} records in local DB for '{query}' (searched {len(all_records)} total)")
        return results

    except Exception as e:
        logger.error(f"Error searching local database: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return []


def _build_search_queries(query: str, escaped_query: str, query_type: str) -> List[Dict[str, Any]]:
    """
    Build MongoDB search queries based on query type

    Args:
        query: Original query string
        escaped_query: Regex-escaped query string
        query_type: Type of search

    Returns:
        List of MongoDB query dictionaries, ordered by priority
    """
    queries = []

    if query_type == "keyword":
        queries.extend(_build_keyword_queries(query, escaped_query))
    elif query_type == "title":
        queries.extend(_build_title_queries(query, escaped_query))
    elif query_type == "author":
        queries.extend(_build_author_queries(escaped_query))
    elif query_type == "subject":
        queries.extend(_build_subject_queries(escaped_query))
    elif query_type == "isbn":
        queries.extend(_build_isbn_queries(query, escaped_query))

    return queries


def _build_keyword_queries(query: str, escaped_query: str) -> List[Dict[str, Any]]:
    """Build keyword search queries"""
    queries = []

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

    words = query.split()
    significant_words = [w for w in words if len(w) > 2]

    if significant_words:
        text_search_query = {"$text": {"$search": " ".join(significant_words)}}
        queries.append(text_search_query)

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

    return queries


def _build_title_queries(query: str, escaped_query: str) -> List[Dict[str, Any]]:
    """Build title search queries"""
    queries = []

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

    contains_title_query = {
        "$or": [
            {"title.main": {"$regex": escaped_query, "$options": "i"}},
            {"title.subtitle": {"$regex": escaped_query, "$options": "i"}},
        ]
    }
    queries.append(contains_title_query)

    words = query.split()
    significant_words = [w for w in words if len(w) > 2]
    if significant_words:
        text_search_query = {"$text": {"$search": " ".join(significant_words)}}
        queries.append(text_search_query)

    return queries


def _build_author_queries(escaped_query: str) -> List[Dict[str, Any]]:
    """Build author search queries"""
    queries = []

    # Exact author match
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

    return queries


def _build_subject_queries(escaped_query: str) -> List[Dict[str, Any]]:
    """Build subject search queries"""
    queries = []

    # Exact subject match
    exact_subject_query = {
        "subjects": {"$regex": f"^{escaped_query}$", "$options": "i"}
    }
    queries.append(exact_subject_query)

    # Contains query
    contains_subject_query = {
        "subjects": {"$regex": escaped_query, "$options": "i"}
    }
    queries.append(contains_subject_query)

    return queries


def _build_isbn_queries(query: str, escaped_query: str) -> List[Dict[str, Any]]:
    """Build ISBN search queries"""
    queries = []

    isbn_clean = query.replace("-", "").replace(" ", "").strip()
    isbn_query = {
        "$or": [
            {"identifiers.isbn": query},
            {"identifiers.isbn": isbn_clean},
            {"identifiers.isbn": {"$regex": f"^{re.escape(isbn_clean)}", "$options": "i"}},
        ]
    }
    queries.append(isbn_query)

    return queries


def _sort_by_relevance(records: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    """
    Sort results by relevance with improved scoring

    Args:
        records: List of records to sort
        query: Original query string

    Returns:
        Sorted list of records
    """
    query_lower = query.lower()
    query_words = set(query_lower.split())

    def calculate_match_score(record):
        """Calculate comprehensive match score"""
        title_info = record.get('title', {})
        title_main = title_info.get('main', '').lower() if isinstance(title_info, dict) else str(title_info).lower()
        title_words = set(title_main.split())

        # Exact title match (highest priority)
        if title_main == query_lower:
            return (0, 100, 0)

        # Title starts with query
        if title_main.startswith(query_lower):
            return (1, 90, 0)

        # All query words in title (word boundary)
        if query_words and query_words.issubset(title_words):
            word_match_percentage = len(query_words) / len(title_words) if title_words else 0
            return (2, int(word_match_percentage * 100), 0)

        # Query substring in title
        if query_lower in title_main:
            position = title_main.index(query_lower)
            # Earlier position = higher score
            position_score = max(0, 100 - position)
            return (3, position_score, 0)

        # Partial word matches
        matching_words = query_words.intersection(title_words)
        if matching_words:
            match_ratio = len(matching_words) / len(query_words) if query_words else 0
            return (4, int(match_ratio * 100), 0)

        # Check in author/subjects if not in title
        contributors = record.get('contributors', [])
        author_text = ' '.join([c.get('name', '').lower() for c in contributors])
        subjects_text = ' '.join(record.get('subjects', [])).lower()

        if query_lower in author_text:
            return (5, 70, 0)

        if query_lower in subjects_text:
            return (6, 50, 0)

        # MongoDB text search score
        if 'score' in record:
            return (7, record.get('score', 0), 0)

        # Default: by creation date
        created_at = record.get('created_at', '')
        return (8, 0, created_at)

    records.sort(key=calculate_match_score)
    return records

"""
Redis Cache Layer for Z39.50 Search Results
"""

from typing import List, Dict, Any, Optional
import json
import hashlib
import logging
from redis import Redis
from redis.exceptions import RedisError

from ..config import CACHE_CONFIG

logger = logging.getLogger(__name__)


class Z3950Cache:
    """Redis cache for Z39.50 search results"""

    def __init__(self, redis_client: Optional[Redis] = None):
        """
        Initialize cache

        Args:
            redis_client: Optional Redis client. If None, creates default client.
        """
        import os

        self.enabled = CACHE_CONFIG.get('enabled', True)
        self.ttl = CACHE_CONFIG.get('ttl', 3600)
        self.key_prefix = CACHE_CONFIG.get('key_prefix', 'z3950:')

        if redis_client:
            self.redis = redis_client
        else:
            try:
                # Get Redis config from environment or use defaults
                redis_host = os.getenv('REDIS_HOST', 'localhost')
                redis_port = int(os.getenv('REDIS_PORT', 6379))
                redis_db = int(os.getenv('REDIS_DB', 0))

                # Create Redis connection
                self.redis = Redis(
                    host=redis_host,
                    port=redis_port,
                    db=redis_db,
                    decode_responses=False
                )
                # Test connection
                self.redis.ping()
                logger.info(f"Connected to Redis cache at {redis_host}:{redis_port}")
            except RedisError as e:
                logger.error(f"Failed to connect to Redis: {str(e)}")
                self.enabled = False
                self.redis = None

    def _generate_key(self, source: str, query: str, query_type: str, limit: int) -> str:
        """
        Generate cache key from search parameters

        Args:
            source: Source key (loc, uw, oclc, or 'all')
            query: Search query
            query_type: Type of query
            limit: Result limit

        Returns:
            Cache key string
        """
        # Create consistent key from parameters
        key_data = f"{source}:{query}:{query_type}:{limit}"
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{self.key_prefix}{source}:{key_hash}"

    def get(self, source: str, query: str, query_type: str, limit: int) -> Optional[List[Dict[str, Any]]]:
        """
        Retrieve cached search results

        Args:
            source: Source key
            query: Search query
            query_type: Type of query
            limit: Result limit

        Returns:
            List of results or None if not cached
        """
        if not self.enabled or not self.redis:
            return None

        try:
            key = self._generate_key(source, query, query_type, limit)
            cached_data = self.redis.get(key)

            if cached_data:
                logger.info(f"Cache HIT for {source}:{query}")
                return json.loads(cached_data)
            else:
                logger.info(f"Cache MISS for {source}:{query}")
                return None

        except Exception as e:
            logger.error(f"Error retrieving from cache: {str(e)}")
            return None

    def set(
        self,
        source: str,
        query: str,
        query_type: str,
        limit: int,
        results: List[Dict[str, Any]]
    ) -> bool:
        """
        Store search results in cache

        Args:
            source: Source key
            query: Search query
            query_type: Type of query
            limit: Result limit
            results: List of results to cache

        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.redis:
            return False

        try:
            key = self._generate_key(source, query, query_type, limit)
            data = json.dumps(results)

            self.redis.setex(key, self.ttl, data)
            logger.info(f"Cached results for {source}:{query}")
            return True

        except Exception as e:
            logger.error(f"Error storing in cache: {str(e)}")
            return False

    def delete(self, source: str, query: str, query_type: str, limit: int) -> bool:
        """
        Delete cached results

        Args:
            source: Source key
            query: Search query
            query_type: Type of query
            limit: Result limit

        Returns:
            True if deleted, False otherwise
        """
        if not self.enabled or not self.redis:
            return False

        try:
            key = self._generate_key(source, query, query_type, limit)
            deleted = self.redis.delete(key)
            logger.info(f"Deleted cache for {source}:{query}")
            return deleted > 0

        except Exception as e:
            logger.error(f"Error deleting from cache: {str(e)}")
            return False

    def clear_all(self) -> bool:
        """
        Clear all Z39.50 cache entries

        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.redis:
            return False

        try:
            pattern = f"{self.key_prefix}*"
            keys = self.redis.keys(pattern)

            if keys:
                deleted = self.redis.delete(*keys)
                logger.info(f"Cleared {deleted} cache entries")
                return True
            else:
                logger.info("No cache entries to clear")
                return True

        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Dictionary with cache stats
        """
        if not self.enabled or not self.redis:
            return {"enabled": False, "error": "Redis not available"}

        try:
            info = self.redis.info()
            pattern = f"{self.key_prefix}*"
            keys = self.redis.keys(pattern)

            return {
                "enabled": True,
                "total_keys": len(keys),
                "memory_used": info.get('used_memory_human', 'N/A'),
                "connected_clients": info.get('connected_clients', 0),
                "uptime_days": info.get('uptime_in_days', 0)
            }

        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {"enabled": False, "error": str(e)}

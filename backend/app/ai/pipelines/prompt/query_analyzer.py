"""
Query Analyzer - Phân tích và cải thiện query tìm kiếm Z39.50
"""
import re
import logging
from typing import Tuple, List

logger = logging.getLogger(__name__)


class QueryAnalyzer:
    """Phân tích query để xác định query type và optimize cho Z39.50"""

    # ISBN patterns
    ISBN_PATTERNS = [
        r'\b\d{13}\b',  # ISBN-13
        r'\b\d{10}\b',  # ISBN-10
        r'\b\d{9}[0-9Xx]\b',  # ISBN-10 with X
    ]

    # Author indicators (tiếng Việt và tiếng Anh)
    AUTHOR_KEYWORDS = [
        'by', 'author', 'wrote', 'written by',
        'tác giả', 'của', 'viết bởi'
    ]

    # Common title words that indicate book titles
    TITLE_INDICATORS = [
        'book', 'novel', 'story', 'guide', 'introduction',
        'sách', 'tiểu thuyết', 'truyện', 'hướng dẫn'
    ]

    @classmethod
    def analyze_query(cls, query: str) -> Tuple[str, str, List[str]]:
        """
        Phân tích query để xác định query type và tối ưu hóa

        Args:
            query: Query gốc từ user

        Returns:
            Tuple of (optimized_query, query_type, search_terms)
            - optimized_query: Query đã được tối ưu
            - query_type: 'isbn' | 'title' | 'author' | 'keyword'
            - search_terms: Danh sách các từ khóa quan trọng
        """
        query_lower = query.lower().strip()

        # 1. Check if it's an ISBN
        for pattern in cls.ISBN_PATTERNS:
            if re.search(pattern, query):
                isbn = re.search(pattern, query).group(0)
                logger.info(f"Detected ISBN: {isbn}")
                return isbn, 'isbn', [isbn]

        # 2. Check if it's an author search
        for keyword in cls.AUTHOR_KEYWORDS:
            if keyword in query_lower:
                # Extract author name
                author = cls._extract_author(query_lower, keyword)
                if author:
                    logger.info(f"Detected author search: {author}")
                    return author, 'author', [author]

        # 3. Check if it's a title search
        if any(indicator in query_lower for indicator in cls.TITLE_INDICATORS):
            title = cls._clean_title_query(query)
            logger.info(f"Detected title search: {title}")
            return title, 'title', cls._extract_keywords(title)

        # 4. Check if query looks like a specific book title (quoted or proper case)
        if cls._looks_like_title(query):
            title = cls._clean_title_query(query)
            logger.info(f"Query appears to be a title: {title}")
            return title, 'title', cls._extract_keywords(title)

        # 5. Default to keyword search with optimization
        optimized = cls._optimize_keyword_query(query)
        keywords = cls._extract_keywords(optimized)
        logger.info(f"Using keyword search: {optimized}")
        return optimized, 'keyword', keywords

    @classmethod
    def _extract_author(cls, query: str, keyword: str) -> str:
        """Extract author name from query"""
        # Remove the keyword and everything before it
        parts = query.split(keyword)
        if len(parts) > 1:
            author = parts[-1].strip()
            # Clean up common suffixes
            author = re.sub(r'\s+(books?|novels?|works?)\s*$', '', author, flags=re.IGNORECASE)
            return author.strip()
        return ""

    @classmethod
    def _clean_title_query(cls, query: str) -> str:
        """Clean and optimize title query"""
        # Remove quotes
        cleaned = query.strip('"\'')

        # Remove common prefixes
        cleaned = re.sub(r'^(find|search|look for|tìm|tìm kiếm)\s+', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\s+(book|novel|sách|tiểu thuyết)\s*$', '', cleaned, flags=re.IGNORECASE)

        return cleaned.strip()

    @classmethod
    def _looks_like_title(cls, query: str) -> bool:
        """Check if query looks like a book title"""
        # Quoted text is likely a title
        if query.startswith('"') and query.endswith('"'):
            return True
        if query.startswith("'") and query.endswith("'"):
            return True

        # Title case (most words capitalized)
        words = query.split()
        if len(words) >= 2:
            capitalized = sum(1 for w in words if w and w[0].isupper())
            if capitalized >= len(words) * 0.7:  # 70% of words capitalized
                return True

        # Contains number (often in book titles like "Python 3" or "2001: A Space Odyssey")
        if re.search(r'\d+', query):
            return True

        return False

    @classmethod
    def _optimize_keyword_query(cls, query: str) -> str:
        """Optimize keyword query for better Z39.50 results"""
        # Remove common stop words that don't help search
        stop_words = ['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for']
        words = query.split()
        filtered = [w for w in words if w.lower() not in stop_words]

        # If we removed too many words, keep original
        if len(filtered) < len(words) * 0.5 and len(words) > 2:
            return query

        return ' '.join(filtered) if filtered else query

    @classmethod
    def _extract_keywords(cls, query: str) -> List[str]:
        """Extract important keywords from query"""
        # Split and clean
        words = re.findall(r'\b\w+\b', query.lower())

        # Remove very common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'}
        keywords = [w for w in words if w not in stop_words and len(w) > 2]

        return keywords[:5]  # Return top 5 keywords

    @classmethod
    def build_advanced_query(cls, query: str, query_type: str) -> str:
        """
        Build advanced Z39.50 query with phrase search and boolean operators

        Args:
            query: Search query
            query_type: Type of search

        Returns:
            Advanced query string for Z39.50
        """
        # For exact phrases, wrap in quotes
        if ' ' in query and not (query.startswith('"') and query.endswith('"')):
            # Multi-word queries benefit from phrase search
            if query_type in ['title', 'author']:
                return f'"{query}"'

        return query

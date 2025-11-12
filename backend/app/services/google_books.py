"""
Google Books API Service
Fetches book information, cover images, and URLs from Google Books API
"""

import requests
import logging
from typing import Dict, Optional, List, Any
from app.config import Config

logger = logging.getLogger(__name__)


class GoogleBooksService:
    """Service for interacting with Google Books API"""

    BASE_URL = "https://www.googleapis.com/books/v1/volumes"

    @staticmethod
    def search_by_isbn(isbn: str) -> Optional[Dict[str, Any]]:
        """
        Search for a book by ISBN
        
        Args:
            isbn: ISBN-10 or ISBN-13 (with or without hyphens)
            
        Returns:
            Dictionary with book information or None if not found
        """
        try:
            # Clean ISBN (remove hyphens and spaces)
            clean_isbn = isbn.replace('-', '').replace(' ', '')
            
            # Search by ISBN
            params = {
                'q': f'isbn:{clean_isbn}',
                'maxResults': 1
            }
            
            response = requests.get(
                GoogleBooksService.BASE_URL,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('totalItems', 0) == 0:
                logger.debug(f"No book found for ISBN: {isbn}")
                return None
            
            volume_info = data['items'][0].get('volumeInfo', {})
            
            # Extract relevant information
            result = {
                'id': data['items'][0].get('id'),
                'title': volume_info.get('title', ''),
                'subtitle': volume_info.get('subtitle'),
                'authors': volume_info.get('authors', []),
                'publisher': volume_info.get('publisher'),
                'published_date': volume_info.get('publishedDate'),
                'description': volume_info.get('description'),
                'isbn_10': None,
                'isbn_13': None,
                'page_count': volume_info.get('pageCount'),
                'categories': volume_info.get('categories', []),
                'language': volume_info.get('language'),
                'preview_link': volume_info.get('previewLink'),
                'info_link': volume_info.get('infoLink'),
                'canonical_volume_link': volume_info.get('canonicalVolumeLink'),
                'image_url': None,
                'image_url_small': None,
                'image_url_medium': None,
                'image_url_large': None
            }
            
            # Extract ISBNs
            industry_identifiers = volume_info.get('industryIdentifiers', [])
            for identifier in industry_identifiers:
                if identifier.get('type') == 'ISBN_10':
                    result['isbn_10'] = identifier.get('identifier')
                elif identifier.get('type') == 'ISBN_13':
                    result['isbn_13'] = identifier.get('identifier')
            
            # Extract image URLs - prioritize thumbnail from imageLinks.thumbnail
            image_links = volume_info.get('imageLinks', {})
            if image_links:
                # Priority: thumbnail > smallThumbnail > medium > large
                result['image_url'] = image_links.get('thumbnail')
                result['image_url_small'] = image_links.get('smallThumbnail')
                result['image_url_medium'] = image_links.get('medium')
                result['image_url_large'] = image_links.get('large') or image_links.get('extraLarge')
                
                # If thumbnail is not available, use smallThumbnail as fallback
                if not result['image_url']:
                    result['image_url'] = result['image_url_small']
                
                # Final fallback: try other sizes
                if not result['image_url']:
                    result['image_url'] = result['image_url_large'] or result['image_url_medium']
            
            logger.info(f"Found book for ISBN {isbn}: {result['title']}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching book from Google Books API: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in Google Books API search: {str(e)}")
            return None

    @staticmethod
    def search_by_title_and_author(title: str, author: str = None) -> Optional[Dict[str, Any]]:
        """
        Search for a book by title and optionally author
        
        Args:
            title: Book title
            author: Author name (optional)
            
        Returns:
            Dictionary with book information or None if not found
        """
        try:
            # Build query - format: intitle:Title inauthor:Author
            # Example: intitle:The+Great+Gatsby+inauthor:Fitzgerald
            query = f'intitle:{title}'
            if author:
                query += f' inauthor:{author}'
            
            params = {
                'q': query,
                'maxResults': 1
            }
            
            response = requests.get(
                GoogleBooksService.BASE_URL,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('totalItems', 0) == 0:
                logger.debug(f"No book found for title: {title}, author: {author}")
                return None
            
            volume_info = data['items'][0].get('volumeInfo', {})
            
            # Extract relevant information (same structure as search_by_isbn)
            result = {
                'id': data['items'][0].get('id'),
                'title': volume_info.get('title', ''),
                'subtitle': volume_info.get('subtitle'),
                'authors': volume_info.get('authors', []),
                'publisher': volume_info.get('publisher'),
                'published_date': volume_info.get('publishedDate'),
                'description': volume_info.get('description'),
                'isbn_10': None,
                'isbn_13': None,
                'page_count': volume_info.get('pageCount'),
                'categories': volume_info.get('categories', []),
                'language': volume_info.get('language'),
                'preview_link': volume_info.get('previewLink'),
                'info_link': volume_info.get('infoLink'),
                'canonical_volume_link': volume_info.get('canonicalVolumeLink'),
                'image_url': None,
                'image_url_small': None,
                'image_url_medium': None,
                'image_url_large': None
            }
            
            # Extract ISBNs
            industry_identifiers = volume_info.get('industryIdentifiers', [])
            for identifier in industry_identifiers:
                if identifier.get('type') == 'ISBN_10':
                    result['isbn_10'] = identifier.get('identifier')
                elif identifier.get('type') == 'ISBN_13':
                    result['isbn_13'] = identifier.get('identifier')
            
            # Extract image URLs - prioritize thumbnail from imageLinks.thumbnail
            image_links = volume_info.get('imageLinks', {})
            if image_links:
                # Priority: thumbnail > smallThumbnail > medium > large
                result['image_url'] = image_links.get('thumbnail')
                result['image_url_small'] = image_links.get('smallThumbnail')
                result['image_url_medium'] = image_links.get('medium')
                result['image_url_large'] = image_links.get('large') or image_links.get('extraLarge')
                
                # If thumbnail is not available, use smallThumbnail as fallback
                if not result['image_url']:
                    result['image_url'] = result['image_url_small']
                
                # Final fallback: try other sizes
                if not result['image_url']:
                    result['image_url'] = result['image_url_large'] or result['image_url_medium']
            
            logger.info(f"Found book for title {title}: {result['title']}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching book from Google Books API: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in Google Books API search: {str(e)}")
            return None

    @staticmethod
    def get_book_info(isbn: str = None, title: str = None, author: str = None) -> Optional[Dict[str, Any]]:
        """
        Get book information from Google Books API
        Tries ISBN first, then falls back to title/author search
        
        Args:
            isbn: ISBN (optional)
            title: Book title (optional)
            author: Author name (optional)
            
        Returns:
            Dictionary with book information or None if not found
        """
        # Try ISBN first if available
        if isbn:
            result = GoogleBooksService.search_by_isbn(isbn)
            if result:
                return result
        
        # Fall back to title/author search
        if title:
            result = GoogleBooksService.search_by_title_and_author(title, author)
            if result:
                return result
        
        return None

    @staticmethod
    def extract_book_urls(book_info: Dict[str, Any]) -> Dict[str, Optional[str]]:
        """
        Extract URLs from book information
        
        Args:
            book_info: Book information dictionary from Google Books API
            
        Returns:
            Dictionary with URL fields
        """
        return {
            'preview_link': book_info.get('preview_link'),
            'info_link': book_info.get('info_link'),
            'canonical_volume_link': book_info.get('canonical_volume_link'),
            'image_url': book_info.get('image_url')
        }

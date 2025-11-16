"""
Book Record Enrichment Module
Enriches MARC records with additional data from Google Books API
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def enrich_with_google_books(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich MARC record with data from Google Books API

    Adds:
    - Cover image URL
    - Online access URL (preview/info link)

    Args:
        record: MARC record dictionary

    Returns:
        Enriched MARC record dictionary
    """
    try:
        from app.services.google_books import GoogleBooksService

        isbn_values = record.get('identifiers', {}).get('isbn', [])
        title_info = record.get('title', {})
        title = title_info.get('main', '') if title_info else ''
        contributors = record.get('contributors', [])
        author = None

        if contributors:
            for contrib in contributors:
                if contrib.get('role') == 'author':
                    author = contrib.get('name')
                    break

        first_isbn = isbn_values[0] if isbn_values else None
        book_info = GoogleBooksService.get_book_info(
            isbn=first_isbn,
            title=title,
            author=author
        )

        if book_info:
            if book_info.get('image_url'):
                record['image_url'] = book_info['image_url']
                logger.debug(f"Updated image_url from Google Books: {book_info['image_url'][:50]}...")

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

    return record

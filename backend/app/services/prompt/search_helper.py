"""
Search Helper - Tìm sách từ Local DB và Z39.50
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def search_books_multi_source(query: str, min_results: int = 4) -> List[Dict[str, Any]]:
    """
    Tìm sách từ nhiều nguồn: Local DB → Z39.50
    
    Args:
        query: Search query
        min_results: Số lượng tối thiểu cần tìm
        
    Returns:
        List of books với format chuẩn
    """
    try:
        from app.services.z3950 import Z3950Service
        
        all_books = []
        
        # STEP 1: Tìm trong Local DB trước
        z3950_service = Z3950Service(cache_enabled=True)
        local_results = z3950_service.search_local_db(query, query_type="keyword", limit=10)
        
        if local_results:
            logger.info(f"Found {len(local_results)} books in Local DB")
            for record in local_results:
                book = _format_book_record(record, source="Local DB")
                if book:
                    all_books.append(book)
        
        # STEP 2: Nếu không đủ, tìm qua Z39.50
        if len(all_books) < min_results:
            needed = min_results - len(all_books)
            logger.info(f"Need {needed} more books, searching Z39.50...")
            
            z3950_results = z3950_service.search_all(
                query=query,
                query_type="keyword",
                limit=needed + 2,  # Tìm thêm một ít để có nhiều lựa chọn
                use_cache=True
            )
            
            # Merge results từ LOC và UW
            for source_key, records in z3950_results.items():
                source_name = _get_source_display_name(source_key)
                for record in records:
                    if len(all_books) >= min_results + 2:
                        break
                    book = _format_book_record(record, source=source_name)
                    if book:
                        all_books.append(book)
        
        logger.info(f"Total books found: {len(all_books)}")
        return all_books[:min_results + 2]  # Trả về tối đa min_results + 2
        
    except Exception as e:
        logger.error(f"Error searching books: {str(e)}")
        return []


def _format_book_record(record: Dict[str, Any], source: str) -> Dict[str, Any]:
    """
    Format book record thành format chuẩn
    
    Args:
        record: MARC record từ DB hoặc Z39.50
        source: Tên nguồn
        
    Returns:
        Dict với format: {id, title, author, publisher, year, subjects, source}
    """
    try:
        # Extract title
        title_info = record.get('title', {})
        if isinstance(title_info, dict):
            title = title_info.get('main', 'Unknown Title')
            subtitle = title_info.get('subtitle')
            if subtitle:
                title = f"{title}: {subtitle}"
        else:
            title = str(title_info) if title_info else 'Unknown Title'
        
        # Extract author
        contributors = record.get('contributors', [])
        author = 'Unknown Author'
        if contributors and len(contributors) > 0:
            author = contributors[0].get('name', 'Unknown Author')
        
        # Extract other info
        publication = record.get('publication', {})
        publisher = publication.get('publisher', '')
        year = publication.get('year', '')
        
        # Extract subjects
        subjects = record.get('subjects', [])
        
        # Get ID
        book_id = record.get('_id') or record.get('control_number') or record.get('record_id', '')
        
        return {
            'id': str(book_id),
            'title': title,
            'author': author,
            'publisher': publisher,
            'year': year,
            'subjects': subjects,
            'source': source
        }
        
    except Exception as e:
        logger.error(f"Error formatting book record: {str(e)}")
        return None


def _get_source_display_name(source_key: str) -> str:
    """Convert source key to display name"""
    source_map = {
        'loc': 'Z39.50 - LOC',
        'uw': 'Z39.50 - UW',
        'oclc': 'Z39.50 - OCLC',
        'local': 'Local DB'
    }
    return source_map.get(source_key, source_key)



"""
Search Helper - Tìm sách từ Local DB và Z39.50
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def search_books_multi_source(query: str, limit: int = 4) -> List[Dict[str, Any]]:
    """
    Tìm sách từ nhiều nguồn: Local DB → Z39.50

    Logic: Tìm trong Local DB trước, nếu không đủ thì tìm thêm từ Z39.50
    Ví dụ: limit=4, tìm được 3 ở Local DB → tìm thêm 1 từ Z39.50

    Args:
        query: Search query
        limit: Số lượng CHÍNH XÁC cần trả về (default: 4)

    Returns:
        List of books với format chuẩn, CHÍNH XÁC {limit} quyển
    """
    try:
        from app.services.z3950 import Z3950Service

        all_books = []

        # STEP 1: Tìm trong Local DB trước
        z3950_service = Z3950Service(cache_enabled=True)
        local_results = z3950_service.search_local_db(query, query_type="keyword", limit=limit)

        if local_results:
            logger.info(f"Found {len(local_results)} books in Local DB")
            for record in local_results:
                book = _format_book_record(record, source="Local DB")
                if book:
                    all_books.append(book)

        if len(all_books) < limit:
            needed = limit - len(all_books)
            logger.info(f"Need {needed} more books, searching Z39.50...")

            search_result = z3950_service.search_and_save(
                query=query,
                query_type="keyword",
                limit=needed,
                save_to_db=True,
                search_local_first=False
            )

            z3950_results = search_result.get('results', {})
            stats = search_result.get('stats', {})
            
            if stats.get('saved_to_db', 0) > 0:
                logger.info(f"Saved {stats['saved_to_db']} new records to database")

            for source_key, records in z3950_results.items():
                if len(all_books) >= limit:
                    break 

                source_name = _get_source_display_name(source_key)
                for record in records:
                    if len(all_books) >= limit:
                        break 

                    book = _format_book_record(record, source=source_name)
                    if book:
                        all_books.append(book)

        final_results = all_books[:limit]
        logger.info(f"Returning exactly {len(final_results)} books (limit={limit})")
        return final_results

    except Exception as e:
        logger.error(f"Error searching books: {str(e)}")
        return []


def _format_book_record(record: Dict[str, Any], source: str) -> Dict[str, Any]:
    """
    Format book record thành format chuẩn cho frontend

    Args:
        record: MARC record từ DB hoặc Z39.50
        source: Tên nguồn

    Returns:
        Dict với format: {id, title, author, accuracy, source, related}
    """
    try:
        title_info = record.get('title', {})
        if isinstance(title_info, dict):
            title = title_info.get('main', 'Unknown Title')
            subtitle = title_info.get('subtitle')
            if subtitle:
                title = f"{title}: {subtitle}"
        else:
            title = str(title_info) if title_info else 'Unknown Title'

        contributors = record.get('contributors', [])
        author = 'Unknown Author'
        if contributors and len(contributors) > 0:
            author = contributors[0].get('name', 'Unknown Author')

        accuracy_score = 85
        if source == "Local DB":
            accuracy_score = 95 
        elif "Z39.50" in source:
            accuracy_score = 90

        if record.get('identifiers', {}).get('isbn'):
            accuracy_score += 3
        if record.get('publication', {}).get('year'):
            accuracy_score += 2

        accuracy_score = min(accuracy_score, 98) 

        related = []
        subjects = record.get('subjects', [])
        if subjects:
            for subject in subjects[:3]:
                related.append({
                    'type': 'chủ đề',
                    'value': subject
                })

        # Add genre/thể loại if available
        publication = record.get('publication', {})
        publisher = publication.get('publisher', '')
        year = publication.get('year', '')
        if publisher:
            related.append({
                'type': 'nhà xuất bản',
                'value': publisher
            })
        if year:
            related.append({
                'type': 'năm xuất bản',
                'value': str(year)
            })

        book_id = record.get('_id') or record.get('control_number') or record.get('record_id', '')

        return {
            'id': str(book_id),
            'title': title,
            'author': author,
            'accuracy': f"{accuracy_score}%",
            'source': source,
            'related': related
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



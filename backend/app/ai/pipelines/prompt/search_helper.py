"""
Search Helper - Tìm sách từ Local DB và Z39.50
"""
import logging
from typing import List, Dict, Any

from .query_analyzer import QueryAnalyzer

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

        # Phân tích query để xác định query type tốt nhất
        optimized_query, query_type, keywords = QueryAnalyzer.analyze_query(query)
        logger.info(f"Original query: '{query}' -> Optimized: '{optimized_query}' (type: {query_type})")

        # STEP 1: Tìm trong Local DB trước
        z3950_service = Z3950Service(cache_enabled=True)
        local_results = z3950_service.search_local_db(optimized_query, query_type=query_type, limit=limit)

        if local_results:
            logger.info(f"Found {len(local_results)} books in Local DB")
            for record in local_results:
                book = _format_book_record(record, source="Local DB", keywords=keywords)
                if book:
                    all_books.append(book)

        if len(all_books) < limit:
            needed = limit - len(all_books)
            logger.info(f"Need {needed} more books, searching Z39.50...")

            search_result = z3950_service.search_and_save(
                query=optimized_query,
                query_type=query_type,
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

                    book = _format_book_record(record, source=source_name, keywords=keywords)
                    if book:
                        all_books.append(book)

        # Sort by accuracy/relevance before limiting
        all_books.sort(key=lambda x: int(x.get('accuracy', '0%').rstrip('%')), reverse=True)

        final_results = all_books[:limit]
        logger.info(f"Returning exactly {len(final_results)} books (limit={limit})")
        return final_results

    except Exception as e:
        logger.error(f"Error searching books: {str(e)}")
        return []


def _calculate_relevance(record: Dict[str, Any], keywords: List[str]) -> int:
    """
    Tính relevance score dựa trên keywords xuất hiện trong record

    Args:
        record: MARC record
        keywords: Danh sách keywords cần tìm

    Returns:
        Relevance bonus score (0-10)
    """
    if not keywords:
        return 0

    score = 0
    keywords_lower = [k.lower() for k in keywords]

    # Check title
    title_info = record.get('title', {})
    if isinstance(title_info, dict):
        title_text = f"{title_info.get('main', '')} {title_info.get('subtitle', '')}".lower()
    else:
        title_text = str(title_info).lower() if title_info else ''

    # Check author
    author_text = ''
    contributors = record.get('contributors', [])
    if contributors:
        author_text = ' '.join([c.get('name', '').lower() for c in contributors])

    # Check subjects
    subjects_text = ' '.join(record.get('subjects', [])).lower()

    # Count keyword matches
    all_text = f"{title_text} {author_text} {subjects_text}"

    for keyword in keywords_lower:
        if keyword in all_text:
            score += 2  # +2 points per keyword match

    # Extra bonus if keyword appears in title
    for keyword in keywords_lower:
        if keyword in title_text:
            score += 1  # +1 extra point for title match

    return min(score, 10)  # Max 10 bonus points


def _format_book_record(record: Dict[str, Any], source: str, keywords: List[str] = None) -> Dict[str, Any]:
    """
    Format book record thành format chuẩn cho frontend

    Args:
        record: MARC record từ DB hoặc Z39.50
        source: Tên nguồn
        keywords: Danh sách keywords để tính relevance score

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

        # Base score dựa vào nguồn
        accuracy_score = 85
        if source == "Local DB":
            accuracy_score = 95
        elif "Z39.50" in source:
            accuracy_score = 90

        # Bonus điểm cho metadata đầy đủ
        if record.get('identifiers', {}).get('isbn'):
            accuracy_score += 3
        if record.get('publication', {}).get('year'):
            accuracy_score += 2

        # Relevance score dựa trên keywords
        if keywords:
            relevance_bonus = _calculate_relevance(record, keywords)
            accuracy_score += relevance_bonus

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



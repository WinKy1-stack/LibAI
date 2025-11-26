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
        # Primary: accuracy score, Secondary: source preference (Local DB > Z39.50)
        def sort_key(book):
            accuracy = int(book.get('accuracy', '0%').rstrip('%'))
            source = book.get('source', '')
            source_priority = 2 if source == "Local DB" else 1 if "Z39.50" in source else 0
            return (accuracy, source_priority)

        all_books.sort(key=sort_key, reverse=True)

        final_results = all_books[:limit]
        logger.info(f"Returning exactly {len(final_results)} books (limit={limit})")

        # Log top results for debugging
        for i, book in enumerate(final_results[:3], 1):
            logger.debug(f"  #{i}: {book.get('title')} - Accuracy: {book.get('accuracy')} - Source: {book.get('source')}")

        return final_results

    except Exception as e:
        logger.error(f"Error searching books: {str(e)}")
        return []


def _calculate_relevance(record: Dict[str, Any], keywords: List[str]) -> Dict[str, Any]:
    """
    Tính relevance score dựa trên keywords xuất hiện trong record với weighted scoring

    Args:
        record: MARC record
        keywords: Danh sách keywords cần tìm

    Returns:
        Dict với relevance_score và match_details
    """
    if not keywords:
        return {"score": 0, "matches": []}

    score = 0
    matches = []
    keywords_lower = [k.lower() for k in keywords]

    # Extract text fields
    title_info = record.get('title', {})
    if isinstance(title_info, dict):
        title_main = title_info.get('main', '').lower()
        title_subtitle = title_info.get('subtitle', '').lower()
        title_text = f"{title_main} {title_subtitle}"
    else:
        title_text = str(title_info).lower() if title_info else ''
        title_main = title_text

    author_text = ''
    contributors = record.get('contributors', [])
    if contributors:
        author_text = ' '.join([c.get('name', '').lower() for c in contributors])

    subjects_text = ' '.join(record.get('subjects', [])).lower()

    # Weighted scoring for each field
    for keyword in keywords_lower:
        # Title main exact match (highest weight)
        if keyword in title_main:
            # Check if it's a word boundary match (more precise)
            if f" {keyword} " in f" {title_main} " or title_main.startswith(keyword) or title_main.endswith(keyword):
                score += 10  # Exact word match in main title
                matches.append(f"title_exact:{keyword}")
            else:
                score += 6  # Partial match in main title
                matches.append(f"title_partial:{keyword}")

        # Title subtitle match
        elif keyword in title_subtitle:
            score += 4
            matches.append(f"subtitle:{keyword}")

        # Author match
        elif keyword in author_text:
            if f" {keyword} " in f" {author_text} " or author_text.startswith(keyword):
                score += 5  # Exact author name match
                matches.append(f"author_exact:{keyword}")
            else:
                score += 3
                matches.append(f"author_partial:{keyword}")

        # Subject match
        elif keyword in subjects_text:
            score += 2
            matches.append(f"subject:{keyword}")

    # Bonus for multiple keyword matches
    match_count = len(matches)
    if match_count > 1:
        score += (match_count - 1) * 2  # +2 for each additional match

    # Calculate match percentage
    matched_keywords = len(set([m.split(':')[1] for m in matches]))
    match_percentage = (matched_keywords / len(keywords_lower)) * 100 if keywords_lower else 0

    return {
        "score": min(score, 50),  # Max 50 points for relevance
        "matches": matches,
        "match_percentage": match_percentage,
        "matched_keywords": matched_keywords,
        "total_keywords": len(keywords_lower)
    }


def _format_book_record(record: Dict[str, Any], source: str, keywords: List[str] = None) -> Dict[str, Any]:
    """
    Format book record thành format chuẩn cho frontend với improved accuracy calculation

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

        # Calculate relevance first
        relevance_data = _calculate_relevance(record, keywords) if keywords else {"score": 0, "matches": [], "match_percentage": 0}

        # BASE ACCURACY - dựa trên nguồn và match quality
        accuracy_score = 60  # Base score thấp hơn

        # Source bonus
        if source == "Local DB":
            accuracy_score += 10  # Local DB đáng tin cậy hơn
        elif "Z39.50" in source:
            accuracy_score += 5

        # Metadata completeness bonus
        metadata_bonus = 0
        if record.get('identifiers', {}).get('isbn'):
            metadata_bonus += 3
        if record.get('publication', {}).get('year'):
            metadata_bonus += 2
        if record.get('subjects') and len(record.get('subjects', [])) > 0:
            metadata_bonus += 2
        if len(contributors) > 0:
            metadata_bonus += 2

        accuracy_score += metadata_bonus

        # RELEVANCE-BASED ACCURACY - phần quan trọng nhất
        if keywords and relevance_data:
            relevance_score = relevance_data.get('score', 0)
            match_percentage = relevance_data.get('match_percentage', 0)
            matches = relevance_data.get('matches', [])

            # Scale relevance score to 0-25 range
            accuracy_score += min(relevance_score // 2, 25)

            # Bonus for high match percentage
            if match_percentage >= 100:  # All keywords matched
                accuracy_score += 5
            elif match_percentage >= 75:
                accuracy_score += 3
            elif match_percentage >= 50:
                accuracy_score += 2

            # Extra bonus for exact title matches
            exact_title_matches = [m for m in matches if 'title_exact' in m]
            if exact_title_matches:
                accuracy_score += len(exact_title_matches) * 3

        # Cap accuracy score
        accuracy_score = min(max(accuracy_score, 60), 98)  # Min 60%, Max 98% 

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
    """Convert source key to display name with library names"""
    source_map = {
        'loc': 'Library of Congress (US)',
        'uw': 'UW-Madison Library',
        'oclc': 'OCLC WorldCat',
        'local': 'Thư viện nội bộ'
    }
    return source_map.get(source_key, source_key)



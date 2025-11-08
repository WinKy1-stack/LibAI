"""
Koha Context Provider - Cung cấp context từ Koha ILS cho AI
"""
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


def build_koha_context_for_patron(patron_id: str) -> str:
    """
    Xây dựng context về thông tin bạn đọc từ Koha
    
    Args:
        patron_id: ID của bạn đọc
        
    Returns:
        Context string cho AI
    """
    logger.info("🔍 BUILD CONTEXT FOR PATRON: patron_id=%s", patron_id)
    
    try:
        from app.services.library.koha_tools import (
            get_patron_info_ai,
            get_patron_checkouts_ai,
            get_patron_holds_ai
        )
        
        # Lấy thông tin patron
        patron_info_res = get_patron_info_ai(patron_id)
        if not patron_info_res or not patron_info_res.get('success'):
            logger.warning("⚠️ PATRON NOT FOUND: patron_id=%s", patron_id)
            return ""
        patron_info = patron_info_res.get('patron', {})
        
        logger.info("✅ PATRON INFO LOADED from Koha")
        
        context_parts = []
        
        # Thông tin cơ bản
        context_parts.append(f"THÔNG TIN BẠN ĐỌC:")
        context_parts.append(f"- Tên: {patron_info.get('name', 'N/A')}")
        context_parts.append(f"- Thẻ số: {patron_info.get('card_number', 'N/A')}")
        context_parts.append(f"- Email: {patron_info.get('email', 'N/A')}")
        context_parts.append(f"- Thư viện: {patron_info.get('library', 'N/A')}")
        context_parts.append(f"- Trạng thái: {patron_info.get('status', 'N/A')}")
        
        # Sách đang mượn
        checkouts = get_patron_checkouts_ai(patron_id)
        if checkouts and checkouts.get('count', 0) > 0:
            context_parts.append(f"\nSÁCH ĐANG MƯỢN ({checkouts['count']} cuốn):")
            for checkout in checkouts.get('checkouts', [])[:5]:  # Limit 5
                title = checkout.get('title', 'N/A')
                due_date = checkout.get('due_date', 'N/A')
                overdue = " [QUÁ HẠN]" if checkout.get('overdue', False) else ""
                context_parts.append(f"  - {title} (Hạn trả: {due_date}){overdue}")
        else:
            context_parts.append(f"\nSÁCH ĐANG MƯỢN: Không có")
        
        # Sách đang giữ chỗ
        holds = get_patron_holds_ai(patron_id)
        if holds and holds.get('count', 0) > 0:
            context_parts.append(f"\nSÁCH ĐANG GIỮ CHỖ ({holds['count']} cuốn):")
            for hold in holds.get('holds', [])[:5]:  # Limit 5
                title = hold.get('title', 'N/A')
                status = hold.get('status', 'N/A')
                pickup = hold.get('pickup_library', 'N/A')
                context_parts.append(f"  - {title} (Trạng thái: {status}, Nhận tại: {pickup})")
        else:
            context_parts.append(f"\nSÁCH ĐANG GIỮ CHỖ: Không có")
        
        return "\n".join(context_parts)
        
    except Exception as e:
        logger.error(f"Error building Koha context for patron {patron_id}: {e}")
        return ""


def build_koha_context_for_books(query: str, limit: int = 5) -> str:
    """
    Xây dựng context về sách từ Koha khi AI cần tìm kiếm
    
    Args:
        query: Từ khóa tìm kiếm
        limit: Số lượng sách tối đa
        
    Returns:
        Context string cho AI
    """
    logger.info("🔍 BUILD CONTEXT FOR BOOKS: query='%s', limit=%d", query, limit)
    
    try:
        from app.services.library.koha_tools import search_books_ai
        
        # Tìm kiếm sách
        result = search_books_ai(query, limit=limit)
        
        if not result or result.get('count', 0) == 0:
            logger.warning("⚠️ NO BOOKS FOUND for query '%s'", query)
            return f"KẾT QUẢ TÌM KIẾM '{query}': Không tìm thấy sách nào phù hợp."
        
        logger.info("✅ FOUND %d BOOKS from Koha, building context...", result['count'])
        
        context_parts = []
        context_parts.append(f"KẾT QUẢ TÌM KIẾM '{query}' ({result['count']} cuốn tìm thấy):")
        context_parts.append("")
        
        for book in result.get('results', []):
            book_id = book.get('id', 'N/A')
            title = book.get('title', 'N/A')
            authors = book.get('authors', [])
            author_str = ", ".join(authors) if authors else 'N/A'
            publisher = book.get('publisher', 'N/A')
            year = book.get('year', 'N/A')
            isbn = book.get('isbn', 'N/A')
            
            context_parts.append(f"📚 {title}")
            context_parts.append(f"   Tác giả: {author_str}")
            context_parts.append(f"   NXB: {publisher} ({year})")
            if isbn != 'N/A':
                context_parts.append(f"   ISBN: {isbn}")
            context_parts.append(f"   ID: {book_id}")
            context_parts.append("")
        
        final_context = "\n".join(context_parts)
        logger.info("✅ CONTEXT BUILT: %d characters", len(final_context))
        return final_context
        
    except Exception as e:
        logger.error(f"❌ ERROR building Koha context for books '{query}': {e}")
        return f"Lỗi khi tìm kiếm sách: {str(e)}"


def build_koha_context_for_book_detail(biblio_id: str) -> str:
    """
    Xây dựng context chi tiết về một cuốn sách
    
    Args:
        biblio_id: ID của biblio record
        
    Returns:
        Context string cho AI
    """
    logger.info("🔍 BUILD CONTEXT FOR BOOK DETAIL: biblio_id=%s", biblio_id)
    
    try:
        from app.services.library.koha_tools import (
            get_book_detail_ai,
            get_item_availability_ai
        )
        
        # Lấy thông tin chi tiết
        book_detail_res = get_book_detail_ai(biblio_id)
        if not book_detail_res or not book_detail_res.get('success'):
            logger.warning("⚠️ BOOK NOT FOUND: biblio_id=%s", biblio_id)
            return f"Không tìm thấy thông tin sách ID {biblio_id}."
        book_detail = book_detail_res.get('summary', {})
        
        logger.info("✅ BOOK DETAIL LOADED from Koha")
        
        context_parts = []
        context_parts.append(f"THÔNG TIN CHI TIẾT SÁCH:")
        context_parts.append(f"ID: {book_detail.get('id', 'N/A')}")
        context_parts.append(f"Tên sách: {book_detail.get('title', 'N/A')}")
        
        authors = book_detail.get('authors', [])
        if authors:
            context_parts.append(f"Tác giả: {', '.join(authors)}")
        
        publisher = book_detail.get('publisher', 'N/A')
        year = book_detail.get('year', 'N/A')
        context_parts.append(f"Nhà xuất bản: {publisher} ({year})")
        
        isbn = book_detail.get('isbn', 'N/A')
        if isbn != 'N/A':
            context_parts.append(f"ISBN: {isbn}")
        
        abstract = book_detail.get('abstract', '')
        if abstract:
            context_parts.append(f"Tóm tắt: {abstract[:300]}...")
        
        # Thông tin tình trạng
        holdings = book_detail.get('holdings_count', 0)
        context_parts.append(f"\nTÌNH TRẠNG:")
        context_parts.append(f"- Tổng số bản: {holdings}")
        
        availability = get_item_availability_ai(biblio_id)
        if availability and availability.get('success'):
            available = availability.get('available', 0)
            checked_out = availability.get('checked_out', 0)
            on_hold = availability.get('on_hold', 0)
            
            context_parts.append(f"- Có sẵn: {available} bản")
            context_parts.append(f"- Đang mượn: {checked_out} bản")
            context_parts.append(f"- Đang giữ: {on_hold} bản")
        
        return "\n".join(context_parts)
        
    except Exception as e:
        logger.error(f"Error building Koha context for book {biblio_id}: {e}")
        return f"Lỗi khi lấy thông tin sách: {str(e)}"


def build_faq_context(limit: int = 10) -> str:
    """
    Xây dựng context từ FAQ
    
    Args:
        limit: Số lượng FAQ tối đa
        
    Returns:
        Context string cho AI
    """
    try:
        from app.services.library.koha_tools import get_faqs_for_ai
        
        faqs = get_faqs_for_ai(limit=limit)
        
        if not faqs or faqs.get('count', 0) == 0:
            return "CÂUHỎI THƯỜNG GẶP: Không có dữ liệu."
        
        context_parts = []
        context_parts.append(f"CÂU HỎI THƯỜNG GẶP ({faqs['count']} câu):")
        context_parts.append("")
        
        for faq in faqs.get('faqs', []):
            question = faq.get('question', 'N/A')
            answer = faq.get('answer', 'N/A')
            category = faq.get('category', 'General')
            
            context_parts.append(f"Q: {question} [{category}]")
            context_parts.append(f"A: {answer}")
            context_parts.append("")
        
        return "\n".join(context_parts)
        
    except Exception as e:
        logger.error(f"Error building FAQ context: {e}")
        return "Lỗi khi lấy FAQ."

"""AI-facing Koha tools

This module exposes simple functions the AI / prompt service can call to fetch
useful library data from Koha.

Functions:
- search_books_ai(query, limit=10, offset=0)
- get_book_detail_ai(biblio_id)
- get_item_availability_ai(biblio_id)
- get_patron_info_ai(patron_id)
- get_patron_checkouts_ai(patron_id)
- get_patron_holds_ai(patron_id)

For FAQ functions, see: app.services.library.faq_tools

These functions return JSON-serializable dicts suitable for inclusion in prompts
or for returning to a frontend.
"""
from typing import List, Dict, Any, Optional
from app.services.library.koha_client import get_koha_client
import logging

logger = logging.getLogger(__name__)

# Import FAQ tools from separate module
from .faq_tools import (
    get_faqs_for_ai,
    search_faqs_by_keyword,
    get_faq_by_category
)

# Re-export for backward compatibility
__all__ = [
    'get_faqs_for_ai',
    'search_faqs_by_keyword', 
    'get_faq_by_category',
    'search_books_ai',
    'get_book_detail_ai',
    'get_item_availability_ai',
    'get_patron_info_ai',
    'get_patron_checkouts_ai',
    'get_patron_holds_ai'
]

# ---------- Book search / detail ----------

def _extract_basic_biblio(rec: Dict[str, Any]) -> Dict[str, Any]:
    """Try to extract common fields from Koha biblio record."""
    title = rec.get('title') or rec.get('record', {}).get('title')
    # authors may be a list or string; Koha REST often uses single 'author'
    authors_raw = rec.get('authors') or rec.get('author') or rec.get('record', {}).get('author')
    if isinstance(authors_raw, str):
        authors = [authors_raw]
    elif isinstance(authors_raw, list):
        authors = authors_raw
    else:
        authors = []
    publisher = rec.get('publisher') or rec.get('record', {}).get('publisher') or rec.get('publication_place')
    # Prefer explicit publication_year then copyright_date
    year = rec.get('publication_year') or rec.get('copyright_date') or rec.get('year') or rec.get('record', {}).get('year')
    isbn = None
    if isinstance(rec, dict):
        isbn = rec.get('isbn') or rec.get('020')
    # Add abstract for richer context
    abstract = rec.get('abstract')
    return {
        'id': rec.get('id') or rec.get('biblio_id') or rec.get('biblionumber') or rec.get('record', {}).get('biblionumber'),
        'title': title,
        'authors': authors,
        'publisher': publisher,
        'year': year,
        'isbn': isbn,
        'abstract': abstract,
        'raw': rec
    }


def search_books_ai(query: str, limit: int = 10, offset: int = 0) -> Dict[str, Any]:
    """Search Koha biblios and return simplified results for AI consumption."""
    logger.info("🤖 AI SEARCH REQUEST: query='%s', limit=%d", query, limit)
    
    client = get_koha_client()
    try:
        raw = client.search_biblios(query=query, limit=limit, offset=offset)
    except Exception as e:
        logger.exception("Koha search failed")
        logger.error("❌ AI SEARCH FAILED: %s", str(e))
        return {'success': False, 'message': str(e)}

    results = []
    raw_list = raw.get('results') if isinstance(raw, dict) else raw
    if not isinstance(raw_list, list):
        # try common key names
        raw_list = raw.get('items') if isinstance(raw, dict) else []

    for r in raw_list:
        results.append(_extract_basic_biblio(r))

    logger.info("✅ AI SEARCH SUCCESS: Found %d books from Koha API", len(results))
    return {'success': True, 'query': query, 'count': raw.get('count', len(results)), 'results': results}


def get_book_detail_ai(biblio_id: str) -> Dict[str, Any]:
    """Fetch full biblio detail and present a cleaned summary for AI."""
    logger.info("🤖 AI GET BOOK DETAIL: biblio_id=%s", biblio_id)
    
    client = get_koha_client()
    try:
        raw = client.get_biblio(biblio_id)
    except Exception as e:
        logger.exception("Koha get biblio failed")
        logger.error("❌ AI GET BOOK FAILED: %s", str(e))
        return {'success': False, 'message': str(e)}

    rec = raw.get('record') if isinstance(raw, dict) else raw
    summary = _extract_basic_biblio(rec if isinstance(rec, dict) else {'record': rec})
    # Ensure id present
    if not summary.get('id'):
        summary['id'] = raw.get('id') or biblio_id
    # include holdings/items summary
    try:
        items = client.get_items_by_biblio(biblio_id)
        summary['holdings_count'] = items.get('count', 0)
        # include simple availability summary
        availability = []
        for it in items.get('items', []):
            availability.append({
                'item_id': it.get('item_id') or it.get('itemnumber') or it.get('id'),
                'barcode': it.get('barcode'),
                'checked_out_date': it.get('checked_out_date'),
                'location': it.get('location') or it.get('permanent_location'),
                'lost_status': it.get('lost_status'),
                'not_for_loan_status': it.get('not_for_loan_status'),
            })
        summary['items'] = availability
    except Exception:
        logger.debug("Could not fetch items for biblio %s", biblio_id)

    logger.info("✅ AI GET BOOK SUCCESS: biblio_id=%s, title='%s'", biblio_id, summary.get('title'))
    return {'success': True, 'biblio_id': biblio_id, 'summary': summary}


def get_item_availability_ai(biblio_id: str) -> Dict[str, Any]:
    """Return a compact availability summary for a biblio (counts by status)."""
    client = get_koha_client()
    try:
        items = client.get_items_by_biblio(biblio_id)
    except Exception as e:
        logger.exception("Koha get items failed")
        return {'success': False, 'message': str(e)}

    status_counts: Dict[str, int] = {}
    available = 0
    checked_out = 0
    on_hold = 0
    for it in items.get('items', []):
        # Derive pseudo status
        if it.get('checked_out_date'):
            checked_out += 1
            st = 'checked_out'
        elif it.get('lost_status') and it.get('lost_status') != 0:
            st = 'lost'
        elif it.get('not_for_loan_status') and it.get('not_for_loan_status') != 0:
            st = 'not_for_loan'
        else:
            available += 1
            st = 'available'
        if it.get('holds_count'):  # Koha may expose holds_count
            try:
                if int(it.get('holds_count')) > 0:
                    on_hold += 1
            except Exception:
                pass
        status_counts[st] = status_counts.get(st, 0) + 1

    return {
        'success': True,
        'biblio_id': biblio_id,
        'available': available,
        'checked_out': checked_out,
        'on_hold': on_hold,
        'counts_by_status': status_counts,
        'total': items.get('count', len(items.get('items', [])))
    }


# ---------- Patron (bạn đọc) helpers for AI ----------
def get_patron_info_ai(patron_id: str) -> Dict[str, Any]:
    """Lấy thông tin bạn đọc cho AI."""
    client = get_koha_client()
    try:
        data = client.get_patron(patron_id)
        patron = data.get('patron', {})
        simplified = {
            'id': patron.get('patron_id'),
            'name': f"{patron.get('firstname', '')} {patron.get('surname', '')}".strip() or patron.get('userid'),
            'email': patron.get('email') or patron.get('secondary_email'),
            'card_number': patron.get('cardnumber'),
            'category': patron.get('category_id'),
            'library': patron.get('library_id'),
            'status': 'active' if not patron.get('restricted') and not patron.get('patron_card_lost') else 'inactive'
        }
        return {'success': True, 'patron_id': patron_id, 'patron': simplified}
    except Exception as e:
        logger.exception("Failed to fetch patron info for %s", patron_id)
        return {'success': False, 'message': str(e)}


def get_patron_checkouts_ai(patron_id: str) -> Dict[str, Any]:
    """Lấy danh sách sách đang mượn của bạn đọc cho AI."""
    client = get_koha_client()
    try:
        data = client.get_patron_checkouts(patron_id)
        checkouts = data.get('checkouts', [])
        
        simplified = []
        for c in checkouts:
            simplified.append({
                'checkout_id': c.get('checkout_id') or c.get('issue_id'),
                'item_id': c.get('item_id') or c.get('itemnumber'),
                'biblio_id': c.get('biblio_id') or c.get('biblionumber'),
                'title': c.get('title'),
                'barcode': c.get('barcode'),
                'checkout_date': c.get('issuedate') or c.get('date_due'),
                'due_date': c.get('date_due') or c.get('duedate'),
                'overdue': c.get('overdue', False)
            })
        
        return {
            'success': True,
            'patron_id': patron_id,
            'count': len(simplified),
            'checkouts': simplified
        }
    except Exception as e:
        logger.exception("Failed to fetch checkouts for patron %s", patron_id)
        return {'success': False, 'message': str(e)}


def get_patron_holds_ai(patron_id: str) -> Dict[str, Any]:
    """Lấy danh sách holds/đặt chỗ của bạn đọc cho AI."""
    client = get_koha_client()
    try:
        data = client.get_patron_holds(patron_id)
        holds = data.get('holds', [])
        
        simplified = []
        for h in holds:
            simplified.append({
                'hold_id': h.get('reserve_id') or h.get('hold_id'),
                'biblio_id': h.get('biblio_id') or h.get('biblionumber'),
                'title': h.get('title'),
                'pickup_library': h.get('pickup_library_id') or h.get('branchcode'),
                'hold_date': h.get('reservedate') or h.get('hold_date'),
                'expiration_date': h.get('expirationdate'),
                'priority': h.get('priority'),
                'status': h.get('status') or ('waiting' if h.get('found') == 'W' else 'pending')
            })
        
        return {
            'success': True,
            'patron_id': patron_id,
            'count': len(simplified),
            'holds': simplified
        }
    except Exception as e:
        logger.exception("Failed to fetch holds for patron %s", patron_id)
        return {'success': False, 'message': str(e)}


# ---------- Loan / circulation helpers for AI (backward compat) ----------
def get_current_loans_ai(borrower_id: str) -> Dict[str, Any]:
    """Deprecated: dùng get_patron_checkouts_ai() thay thế.
    
    Wrapper cho backward compatibility.
    """
    logger.warning("get_current_loans_ai is deprecated, use get_patron_checkouts_ai")
    result = get_patron_checkouts_ai(borrower_id)
    if result.get('success'):
        result['current_loans'] = result.pop('checkouts', [])
        result['borrower_id'] = result.pop('patron_id')
    return result


def get_loan_history_ai(borrower_id: str, limit: int = 100) -> Dict[str, Any]:
    """Deprecated: Koha REST API không có endpoint lịch sử mượn chung.
    
    Hiện tại chỉ có get_patron_checkouts (sách đang mượn).
    Để lấy lịch sử cần query riêng hoặc dùng Koha Reports.
    """
    logger.warning("get_loan_history_ai: Koha REST API does not provide loan history endpoint")
    return {
        'success': False, 
        'message': 'Koha REST API does not provide checkout history. Use get_patron_checkouts_ai for current loans.',
        'borrower_id': borrower_id,
        'count': 0,
        'history': []
    }


def get_loans_for_item_ai(item_id: str) -> Dict[str, Any]:
    """Deprecated: dùng get_item() trong koha_client để lấy status item."""
    logger.warning("get_loans_for_item_ai is deprecated")
    client = get_koha_client()
    try:
        item_data = client.get_item(item_id)
        item = item_data.get('item', {})
        return {
            'success': True,
            'item_id': item_id,
            'status': item.get('status'),
            'note': 'Use get_item for current item status'
        }
    except Exception as e:
        return {'success': False, 'message': str(e)}


def get_recent_loans_ai(limit: int = 50) -> Dict[str, Any]:
    """Deprecated: Koha REST API không có endpoint này."""
    logger.warning("get_recent_loans_ai: not available in Koha REST API")
    return {
        'success': False,
        'message': 'Koha REST API does not provide system-wide recent loans endpoint',
        'count': 0,
        'loans': []
    }

"""
Koha Search Workaround - Tìm kiếm sách qua MongoDB shadow collection

Vì Koha search API không hoạt động (trả về 400/500), ta cần một giải pháp thay thế:
- Tạo shadow collection trong MongoDB chứa biblio data từ Koha
- Cho phép search qua MongoDB (text search hoặc regex)
- Định kỳ sync từ Koha vào MongoDB

Cách sử dụng:
1. Run script sync một lần: python -m app.services.library.koha_search_workaround sync
2. Sau đó search thông qua: search_books_mongo(query)
"""
import logging
from typing import List, Dict, Any, Optional
from app.utils.mongo_helper import MongoHelper
from app.services.library.koha_client import get_koha_client
import re

logger = logging.getLogger(__name__)

COLLECTION_NAME = 'koha_biblios_cache'

def sync_all_biblios_to_mongo(start_id: int = 1, end_id: int = 100):
    """
    Sync biblios từ Koha vào MongoDB collection.
    
    Vì không có search API, ta phải fetch từng biblio by ID và cache vào Mongo.
    
    Args:
        start_id: Biblio ID bắt đầu
        end_id: Biblio ID kết thúc
    """
    client = get_koha_client()
    synced = 0
    failed = 0
    
    logger.info(f"Starting sync biblios {start_id} to {end_id} from Koha to MongoDB")
    
    for biblio_id in range(start_id, end_id + 1):
        try:
            # Fetch from Koha
            result = client.get_biblio(biblio_id)
            if not result or not result.get('record'):
                logger.debug(f"Biblio {biblio_id} not found or empty")
                failed += 1
                continue
            
            record = result['record']
            
            # Prepare document for MongoDB
            doc = {
                '_id': str(biblio_id),  # Use biblio_id as _id
                'biblio_id': biblio_id,
                'title': record.get('title', ''),
                'author': record.get('author', ''),
                'publisher': record.get('publisher', ''),
                'publication_place': record.get('publication_place', ''),
                'publication_year': record.get('publication_year'),
                'copyright_date': record.get('copyright_date'),
                'isbn': record.get('isbn', ''),
                'abstract': record.get('abstract', ''),
                'item_type': record.get('item_type', ''),
                'pages': record.get('pages', ''),
                'edition_statement': record.get('edition_statement', ''),
                # Searchable text (combine all text fields)
                'search_text': ' '.join(filter(None, [
                    record.get('title', ''),
                    record.get('author', ''),
                    record.get('publisher', ''),
                    record.get('abstract', ''),
                    record.get('isbn', ''),
                ])).lower(),
                # Keep raw record for reference
                'raw_record': record
            }
            
            # Upsert to MongoDB
            MongoHelper.update_one(
                COLLECTION_NAME,
                {'_id': str(biblio_id)},
                {'$set': doc},
                upsert=True
            )
            
            synced += 1
            if synced % 10 == 0:
                logger.info(f"Synced {synced} biblios...")
                
        except Exception as e:
            logger.debug(f"Failed to sync biblio {biblio_id}: {e}")
            failed += 1
            continue
    
    logger.info(f"Sync completed: {synced} synced, {failed} failed")
    
    # Create text index for search
    try:
        MongoHelper.get_collection(COLLECTION_NAME).create_index([
            ('search_text', 'text'),
            ('title', 'text'),
            ('author', 'text'),
        ], name='search_index')
        logger.info("Created text search index")
    except Exception as e:
        logger.warning(f"Failed to create index: {e}")
    
    return {'synced': synced, 'failed': failed}


def search_books_mongo(query: str, limit: int = 10) -> Dict[str, Any]:
    """
    Tìm kiếm sách trong MongoDB cache (thay thế cho Koha search API).
    
    Args:
        query: Từ khóa tìm kiếm
        limit: Số lượng kết quả tối đa
        
    Returns:
        Dict với format tương tự search_books_ai
    """
    if not query or len(query) < 2:
        return {'success': False, 'message': 'Từ khóa quá ngắn', 'query': query, 'count': 0, 'results': []}
    
    try:
        # Try MongoDB text search first
        results = list(MongoHelper.find_many(
            COLLECTION_NAME,
            query={'$text': {'$search': query}},
            limit=limit,
            projection={
                'biblio_id': 1,
                'title': 1,
                'author': 1,
                'publisher': 1,
                'copyright_date': 1,
                'publication_year': 1,
                'isbn': 1,
                'abstract': 1,
                'score': {'$meta': 'textScore'}
            },
            sort=[('score', {'$meta': 'textScore'})]
        ))
        
        # If text search fails or returns nothing, try regex fallback
        if not results:
            logger.debug(f"Text search returned nothing for '{query}', trying regex")
            pattern = re.compile(query, re.IGNORECASE)
            results = list(MongoHelper.find_many(
                COLLECTION_NAME,
                query={'$or': [
                    {'title': pattern},
                    {'author': pattern},
                    {'publisher': pattern},
                    {'abstract': pattern},
                ]},
                limit=limit
            ))
        
        # Format results similar to koha_tools format
        formatted = []
        for r in results:
            formatted.append({
                'id': r.get('biblio_id'),
                'title': r.get('title', 'N/A'),
                'authors': [r.get('author')] if r.get('author') else [],
                'publisher': r.get('publisher'),
                'year': r.get('publication_year') or r.get('copyright_date'),
                'isbn': r.get('isbn'),
                'abstract': r.get('abstract'),
            })
        
        return {
            'success': True,
            'query': query,
            'count': len(formatted),
            'results': formatted,
            'source': 'mongodb_cache'
        }
        
    except Exception as e:
        logger.exception(f"MongoDB search failed for '{query}'")
        return {
            'success': False,
            'message': f'Lỗi tìm kiếm: {str(e)}',
            'query': query,
            'count': 0,
            'results': []
        }


def get_cache_stats() -> Dict[str, Any]:
    """Lấy thống kê về cache collection"""
    try:
        count = MongoHelper.count_documents(COLLECTION_NAME, {})
        
        # Sample recent
        recent = list(MongoHelper.find_many(
            COLLECTION_NAME,
            query={},
            limit=5,
            sort=[('biblio_id', -1)]
        ))
        
        return {
            'total_biblios': count,
            'collection': COLLECTION_NAME,
            'sample_ids': [r.get('biblio_id') for r in recent],
        }
    except Exception as e:
        logger.exception("Failed to get cache stats")
        return {'error': str(e)}


if __name__ == '__main__':
    import sys
    from pathlib import Path
    from dotenv import load_dotenv
    
    # Setup
    backend = Path(__file__).parent.parent.parent.parent
    load_dotenv(backend / '.env')
    
    if len(sys.argv) > 1 and sys.argv[1] == 'sync':
        # Sync mode
        start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        end = int(sys.argv[3]) if len(sys.argv) > 3 else 100
        print(f"Syncing biblios {start} to {end}...")
        result = sync_all_biblios_to_mongo(start, end)
        print(f"✓ Done: {result}")
        
        # Show stats
        stats = get_cache_stats()
        print(f"✓ Cache stats: {stats}")
    else:
        # Test search
        print("Testing search...")
        result = search_books_mongo('toán')
        import json
        print(json.dumps(result, indent=2, ensure_ascii=False))

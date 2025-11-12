"""FAQ Tools for AI

This module provides FAQ-related functions that AI can use to fetch
frequently asked questions from MongoDB.

Functions:
- get_faqs_for_ai(limit=10)
- search_faqs_by_keyword(keyword, limit=10)
- get_faq_by_category(category, limit=10)
"""
from typing import Dict, Any, List
from app.utils.mongo_helper import MongoHelper
import logging

logger = logging.getLogger(__name__)


def get_faqs_for_ai(limit: int = 10) -> Dict[str, Any]:
    """Return recent FAQ entries from local MongoDB (collection 'faq').
    
    Args:
        limit: Maximum number of FAQs to return (default: 10)
    
    Returns:
        Dict containing:
        - source: 'local_faq'
        - count: number of FAQs returned
        - faqs: list of FAQ objects with question, answer, tags, updated_at
    
    Example:
        >>> result = get_faqs_for_ai(limit=5)
        >>> print(result['count'])
        5
        >>> print(result['faqs'][0]['question'])
        'Giờ mở cửa thư viện?'
    """
    try:
        faqs = MongoHelper.find_many('faq', query={}, sort=[('updated_at', -1)], limit=limit)
        simplified = []
        for f in faqs:
            simplified.append({
                'id': str(f.get('_id')),
                'question': f.get('question') or f.get('q') or f.get('title'),
                'answer': f.get('answer') or f.get('a') or f.get('content'),
                'tags': f.get('tags', []),
                'updated_at': f.get('updated_at')
            })
        
        logger.info(f"✅ Retrieved {len(simplified)} FAQs from MongoDB")
        return {'source': 'local_faq', 'count': len(simplified), 'faqs': simplified}
    
    except Exception as e:
        logger.exception(f"Failed to retrieve FAQs: {e}")
        return {'source': 'local_faq', 'count': 0, 'faqs': [], 'error': str(e)}


def search_faqs_by_keyword(keyword: str, limit: int = 10) -> Dict[str, Any]:
    """Search FAQs by keyword in question or answer.
    
    Args:
        keyword: Search keyword
        limit: Maximum number of results (default: 10)
    
    Returns:
        Dict containing matching FAQs
    """
    try:
        # Search in both question and answer fields
        query = {
            '$or': [
                {'question': {'$regex': keyword, '$options': 'i'}},
                {'answer': {'$regex': keyword, '$options': 'i'}},
                {'tags': {'$regex': keyword, '$options': 'i'}}
            ]
        }
        
        faqs = MongoHelper.find_many('faq', query=query, sort=[('updated_at', -1)], limit=limit)
        simplified = []
        for f in faqs:
            simplified.append({
                'id': str(f.get('_id')),
                'question': f.get('question'),
                'answer': f.get('answer'),
                'tags': f.get('tags', []),
                'updated_at': f.get('updated_at')
            })
        
        logger.info(f"✅ Found {len(simplified)} FAQs matching keyword: {keyword}")
        return {'source': 'local_faq', 'keyword': keyword, 'count': len(simplified), 'faqs': simplified}
    
    except Exception as e:
        logger.exception(f"Failed to search FAQs with keyword '{keyword}': {e}")
        return {'source': 'local_faq', 'keyword': keyword, 'count': 0, 'faqs': [], 'error': str(e)}


def get_faq_by_category(category: str, limit: int = 10) -> Dict[str, Any]:
    """Get FAQs by category.
    
    Args:
        category: FAQ category (e.g., 'hours', 'rules', 'borrowing')
        limit: Maximum number of results (default: 10)
    
    Returns:
        Dict containing FAQs in the specified category
    """
    try:
        query = {'category': category}
        faqs = MongoHelper.find_many('faq', query=query, sort=[('updated_at', -1)], limit=limit)
        simplified = []
        for f in faqs:
            simplified.append({
                'id': str(f.get('_id')),
                'category': f.get('category'),
                'question': f.get('question'),
                'answer': f.get('answer'),
                'tags': f.get('tags', []),
                'updated_at': f.get('updated_at')
            })
        
        logger.info(f"✅ Found {len(simplified)} FAQs in category: {category}")
        return {'source': 'local_faq', 'category': category, 'count': len(simplified), 'faqs': simplified}
    
    except Exception as e:
        logger.exception(f"Failed to get FAQs for category '{category}': {e}")
        return {'source': 'local_faq', 'category': category, 'count': 0, 'faqs': [], 'error': str(e)}

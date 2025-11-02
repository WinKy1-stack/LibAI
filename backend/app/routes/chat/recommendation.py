"""
Recommendation Routes - Book recommendations và AI search
"""
import logging
from flask import Blueprint, jsonify

from app.services.prompt import get_prompt_service  # type: ignore
from app.services.exceptions import ChatServiceError, ValidationError, GeminiAPIError  # type: ignore
from app.utils.decorators import token_required  # type: ignore
from app.routes.helpers import (  # type: ignore
    build_error_response,
    validate_request_data,
    build_success_response
)

logger = logging.getLogger(__name__)

recommendation_bp = Blueprint('chat_recommendation', __name__)


@recommendation_bp.route('/recommend', methods=['POST'])
@token_required
def get_book_recommendations(current_user):
    """
    Nhận gợi ý sách dựa trên sở thích
    
    Request Body:
        {
            "preferences": dict - Sở thích người dùng,
            "available_books": list - Danh sách sách có sẵn
        }
    """
    try:
        data = validate_request_data()
        
        preferences = data.get('preferences', {})
        available_books = data.get('available_books', [])
        
        if not available_books:
            raise ValidationError("Danh sách sách không được để trống")
        
        logger.info(
            "User %s requested recommendations for %d books",
            current_user['id'],
            len(available_books)
        )
        
        # Generate recommendations
        prompt_service = get_prompt_service()
        recommendations = prompt_service.generate_book_recommendation(
            user_preferences=preferences,
            available_books=available_books
        )
        
        response_data = build_success_response(
            data={'recommendations': recommendations},
            user_id=current_user['id'],
            metadata={
                'books_analyzed': len(available_books),
                'preferences_count': len(preferences)
            }
        )
        
        logger.info("Recommendations generated for user %s", current_user['id'])
        return jsonify(response_data), 200
        
    except (ValidationError, GeminiAPIError, ChatServiceError) as e:
        return build_error_response(e)
    except Exception as e:  # pylint: disable=broad-except
        return build_error_response(e)


@recommendation_bp.route('/search', methods=['POST'])
@token_required
def search_books_with_ai(current_user):
    """
    Tìm kiếm sách thông minh với AI
    
    Request Body:
        {
            "query": str (required) - Yêu cầu tìm kiếm,
            "books_data": list (required) - Dữ liệu sách
        }
    """
    try:
        data = validate_request_data(required_fields=['query'])
        
        query = data['query'].strip()
        books_data = data.get('books_data', [])
        
        if not books_data:
            raise ValidationError("Dữ liệu sách không được để trống")
        
        logger.info(
            "User %s searching: %s... in %d books",
            current_user['id'],
            query[:50],
            len(books_data)
        )
        
        # Search with AI
        prompt_service = get_prompt_service()
        search_results = prompt_service.search_books_with_ai(
            query=query,
            books_data=books_data
        )
        
        response_data = build_success_response(
            data={
                'results': search_results,
                'query': query
            },
            user_id=current_user['id'],
            metadata={
                'books_searched': len(books_data),
                'query_length': len(query)
            }
        )
        
        logger.info("Search completed for user %s", current_user['id'])
        return jsonify(response_data), 200
        
    except (ValidationError, GeminiAPIError, ChatServiceError) as e:
        return build_error_response(e)
    except Exception as e:  # pylint: disable=broad-except
        return build_error_response(e)

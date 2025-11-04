"""
Health Route - Service health check
"""
import logging
from datetime import datetime
from flask import Blueprint, jsonify

from app.services.prompt import get_prompt_service
from app.exceptions import ApiError

logger = logging.getLogger(__name__)

health_bp = Blueprint('chat_health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """Kiểm tra trạng thái của chat service"""
    try:
        prompt_service = get_prompt_service()
        
        health_data = {
            'success': True,
            'data': {
                'status': 'healthy',
                'service': 'chat',
                'model': prompt_service.model_id,
                'timestamp': datetime.utcnow().isoformat(),
                'config': {
                    'max_tokens': prompt_service.config.get('GEMINI_MAX_TOKENS', 1000),
                    'temperature': prompt_service.config.get('GEMINI_TEMPERATURE', 0.7),
                    'max_books_context': prompt_service.config.get('MAX_BOOKS_IN_CONTEXT', 30)
                }
            }
        }
        
        logger.debug("Health check passed")
        return jsonify(health_data), 200
        
    except Exception as e:  # pylint: disable=broad-except
        logger.error("Health check failed: %s", str(e))
        raise ApiError(f'Service không khả dụng: {str(e)}', status_code=503)

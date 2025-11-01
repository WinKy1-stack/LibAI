"""
Health Route - Service health check
"""
import logging
from datetime import datetime
from flask import Blueprint, jsonify

from app.services.prompt import get_prompt_service  # type: ignore

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
                    'max_tokens': prompt_service.config.max_output_tokens,
                    'temperature': prompt_service.config.temperature,
                    'max_books_context': prompt_service.config.max_books_in_context
                }
            }
        }
        
        logger.debug("Health check passed")
        return jsonify(health_data), 200
        
    except Exception as e:  # pylint: disable=broad-except
        logger.error("Health check failed: %s", str(e))
        return jsonify({
            'success': False,
            'error': {
                'message': f'Service không khả dụng: {str(e)}',
                'type': 'ServiceUnavailable'
            }
        }), 503

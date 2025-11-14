from flask import Blueprint, jsonify

from .message import message_bp
from .history import history_bp
from .recommendation import recommendation_bp
from .health import health_bp

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')


def register_chat_routes():
    """Register tất cả chat sub-routes vào main blueprint"""
    # Register blueprints
    chat_bp.register_blueprint(message_bp)
    chat_bp.register_blueprint(history_bp)
    chat_bp.register_blueprint(recommendation_bp)
    chat_bp.register_blueprint(health_bp)
    
    # Error handlers
    @chat_bp.errorhandler(404)
    def not_found(error):  # pylint: disable=unused-argument
        """Handle 404 errors"""
        return jsonify({
            'success': False,
            'error': {
                'message': 'Endpoint không tồn tại',
                'type': 'NotFound'
            }
        }), 404

    @chat_bp.errorhandler(405)
    def method_not_allowed(error):  # pylint: disable=unused-argument
        """Handle 405 errors"""
        return jsonify({
            'success': False,
            'error': {
                'message': 'Method không được phép',
                'type': 'MethodNotAllowed'
            }
        }), 405


register_chat_routes()

__all__ = ['chat_bp']

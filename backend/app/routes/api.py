"""
API Routes
"""
from flask import Blueprint, jsonify

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health():
    """Kiểm tra trạng thái API"""
    return jsonify({
        'status': 'ok',
        'message': 'API đang hoạt động'
    }), 200

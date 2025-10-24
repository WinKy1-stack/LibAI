"""
API Routes
"""
from flask import Blueprint, request, jsonify
from app.services.user_service import UserService
from app.utils.validators import validate_user_data

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health():
    """Kiểm tra trạng thái API"""
    return jsonify({
        'status': 'ok',
        'message': 'API đang hoạt động'
    }), 200

@api_bp.route('/users', methods=['GET'])
def get_users():
    """Lấy danh sách users"""
    try:
        users = UserService.get_all_users()
        return jsonify({
            'success': True,
            'data': users
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Lấy thông tin user theo ID"""
    try:
        user = UserService.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy user'
            }), 404

        return jsonify({
            'success': True,
            'data': user
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@api_bp.route('/users', methods=['POST'])
def create_user():
    """Tạo user mới"""
    try:
        data = request.get_json()

        # Validate dữ liệu
        is_valid, error = validate_user_data(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': error
            }), 400

        user = UserService.create_user(data)
        return jsonify({
            'success': True,
            'message': 'Tạo user thành công',
            'data': user
        }), 201
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@api_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Cập nhật thông tin user"""
    try:
        data = request.get_json()
        user = UserService.update_user(user_id, data)

        if not user:
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy user'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Cập nhật user thành công',
            'data': user
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Xóa user"""
    try:
        success = UserService.delete_user(user_id)

        if not success:
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy user'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Xóa user thành công'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

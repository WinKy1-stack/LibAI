"""
User Routes
"""
from flask import request, jsonify
from . import users_bp
from app.services.user import UserService
from app.utils.validators import validate_user_data
from app.exceptions import NotFoundError, ValidationError

@users_bp.route('/users', methods=['GET'])
def get_users():
    """Lấy danh sách users"""
    users = UserService.get_all_users()
    return jsonify({
        'success': True,
        'data': users
    }), 200

@users_bp.route('/users/<string:user_id>', methods=['GET'])
def get_user(user_id):
    """Lấy thông tin user theo ID"""
    user = UserService.get_user_by_id(user_id)
    return jsonify({
        'success': True,
        'data': user
    }), 200

@users_bp.route('/users', methods=['POST'])
def create_user():
    """Tạo user mới"""
    data = request.get_json()

    # Validate dữ liệu
    is_valid, error = validate_user_data(data)
    if not is_valid:
        raise ValidationError(error)

    user = UserService.create_user(data)
    return jsonify({
        'success': True,
        'message': 'Tạo user thành công',
        'data': user
    }), 201

@users_bp.route('/users/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    """Cập nhật thông tin user"""
    data = request.get_json()
    user = UserService.update_user(user_id, data)

    return jsonify({
        'success': True,
        'message': 'Cập nhật user thành công',
        'data': user
    }), 200

@users_bp.route('/users/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Xóa user"""
    success = UserService.delete_user(user_id)

    return jsonify({
        'success': True,
        'message': 'Xóa user thành công'
    }), 200

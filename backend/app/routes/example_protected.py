"""
Example routes with role-based authorization
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import admin_required, librarian_required, role_required
from app.models.user import User, UserRole

example_bp = Blueprint('example', __name__, url_prefix='/api/example')

@example_bp.route('/public', methods=['GET'])
def public_route():
    """Route công khai, không cần đăng nhập"""
    return jsonify({'message': 'Route công khai, ai cũng truy cập được'}), 200

@example_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    """Route yêu cầu đăng nhập, bất kỳ role nào"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({
        'message': 'Bạn đã đăng nhập',
        'user': user.to_dict()
    }), 200

@example_bp.route('/admin-only', methods=['GET'])
@jwt_required()
@admin_required()
def admin_only_route():
    """Route chỉ dành cho admin"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({
        'message': 'Đây là route chỉ dành cho admin',
        'user': user.to_dict()
    }), 200

@example_bp.route('/librarian-access', methods=['GET'])
@jwt_required()
@librarian_required()
def librarian_route():
    """Route dành cho librarian và admin"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({
        'message': 'Đây là route dành cho librarian và admin',
        'user': user.to_dict()
    }), 200

@example_bp.route('/admin-or-user', methods=['GET'])
@jwt_required()
@role_required(UserRole.ADMIN, UserRole.USER)
def multi_role_route():
    """Route cho nhiều role cụ thể"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({
        'message': 'Route này cho phép admin và user, nhưng không cho librarian',
        'user': user.to_dict()
    }), 200

@example_bp.route('/user-info', methods=['GET'])
@jwt_required()
def get_user_info():
    """Lấy thông tin chi tiết user"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'user': user.to_dict(),
        'permissions': {
            'is_admin': user.is_admin(),
            'is_librarian': user.is_librarian(),
            'can_manage_books': user.has_role(UserRole.ADMIN, UserRole.LIBRARIAN),
            'can_manage_users': user.is_admin(),
        }
    }), 200

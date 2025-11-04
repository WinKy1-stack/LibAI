"""
Example routes with role-based authorization (MongoDB Version)
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import admin_required, librarian_required, role_required
from app.models.mongodb_schemas import UserRole
from app.utils.mongo_helper import MongoHelper
from bson import ObjectId

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
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'message': 'Bạn đã đăng nhập',
        'user': {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user.get('role'),
            'student_id': user.get('student_id')
        }
    }), 200

@example_bp.route('/admin-only', methods=['GET'])
@jwt_required()
@admin_required()
def admin_only_route():
    """Route chỉ dành cho admin"""
    current_user_id = get_jwt_identity()
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'message': 'Đây là route chỉ dành cho admin',
        'user': {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user.get('role')
        }
    }), 200

@example_bp.route('/librarian-access', methods=['GET'])
@jwt_required()
@librarian_required()
def librarian_route():
    """Route dành cho librarian và admin"""
    current_user_id = get_jwt_identity()
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'message': 'Đây là route dành cho librarian và admin',
        'user': {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user.get('role')
        }
    }), 200

@example_bp.route('/admin-or-user', methods=['GET'])
@jwt_required()
@role_required(UserRole.ADMIN, UserRole.READER)
def multi_role_route():
    """Route cho nhiều role cụ thể"""
    current_user_id = get_jwt_identity()
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'message': 'Route này cho phép admin và reader, nhưng không cho librarian',
        'user': {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user.get('role')
        }
    }), 200

@example_bp.route('/user-info', methods=['GET'])
@jwt_required()
def get_user_info():
    """Lấy thông tin chi tiết user"""
    current_user_id = get_jwt_identity()
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    
    user_role = user.get('role', UserRole.READER.value)
    
    return jsonify({
        'user': {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user_role,
            'student_id': user.get('student_id'),
            'major': user.get('major'),
            'status': user.get('status')
        },
        'permissions': {
            'is_admin': user_role == UserRole.ADMIN.value,
            'is_librarian': user_role == UserRole.LIBRARIAN.value,
            'can_manage_books': user_role in [UserRole.ADMIN.value, UserRole.LIBRARIAN.value],
            'can_manage_users': user_role == UserRole.ADMIN.value,
        }
    }), 200

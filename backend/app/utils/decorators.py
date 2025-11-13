from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, get_jwt
from app.models.mongodb_schemas import UserRole
from app.utils.mongo_helper import MongoHelper
from bson import ObjectId


def token_required(fn):
    """
    Decorator cơ bản yêu cầu JWT token
    Trả về current_user info trong function
    Usage: @token_required
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        
        # Tạo dict current_user info
        current_user = {
            'id': current_user_id,
            'role': claims.get('role'),
            'username': claims.get('sub')
        }
        
        return fn(current_user, *args, **kwargs)
    return wrapper

def role_required(*roles):
    """
    Decorator để kiểm tra role của user
    Usage: @role_required(UserRole.ADMIN, UserRole.LIBRARIAN)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')
            
            if user_role not in roles:
                return jsonify({
                    'error': 'Bạn không có quyền truy cập tài nguyên này'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required():
    """Decorator yêu cầu role admin"""
    return role_required(UserRole.ADMIN)

def librarian_required():
    """Decorator yêu cầu role librarian hoặc admin"""
    return role_required(UserRole.ADMIN, UserRole.LIBRARIAN)

def active_user_required():
    """Decorator kiểm tra user có đang active không"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
            
            if not user or user.get('status') != 'active':
                return jsonify({
                    'error': 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

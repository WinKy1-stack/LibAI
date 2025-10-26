"""
Authentication Routes - MongoDB Version
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from app.utils.mongo_helper import MongoHelper
from app.models.mongodb_schemas import UserRole, UserStatus
from app.utils.validators import validate_email, validate_password
from datetime import datetime, timezone

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Đăng ký tài khoản mới - MongoDB"""
    try:
        data = request.get_json()
        
        # Validate dữ liệu đầu vào
        if not data:
            return jsonify({'error': 'Không có dữ liệu'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        full_name = data.get('fullName', '').strip()  # Frontend sends 'fullName'
        
        # Kiểm tra các trường bắt buộc
        if not username or not email or not password:
            return jsonify({'error': 'Thiếu thông tin bắt buộc'}), 400
        
        # Validate email
        if not validate_email(email):
            return jsonify({'error': 'Email không hợp lệ'}), 400
        
        # Validate password
        password_valid, password_msg = validate_password(password)
        if not password_valid:
            return jsonify({'error': password_msg}), 400
        
        # Kiểm tra email đã tồn tại trong MongoDB
        existing_user = MongoHelper.find_one('users', {'email': email})
        if existing_user:
            return jsonify({'error': 'Email đã được sử dụng'}), 409
        
        # Tạo user mới trong MongoDB
        new_user = {
            'email': email,
            'student_id': username,  # Use username as student_id
            'name': full_name or username,
            'password_hash': generate_password_hash(password),
            'role': UserRole.READER.value,  # Default role
            'status': UserStatus.ACTIVE.value,
            'major': '',
            'preferences': {'lang': 'vi', 'theme': 'light'},
            'created_at': datetime.now(timezone.utc),
            'last_login': None
        }
        
        user_id = MongoHelper.insert_one('users', new_user)
        
        # Return user data
        new_user['_id'] = str(user_id)
        new_user.pop('password_hash', None)  # Don't return password hash
        
        return jsonify({
            'message': 'Đăng ký thành công',
            'user': {
                'id': str(user_id),
                'email': email,
                'name': full_name or username,
                'role': UserRole.READER.value
            }
        }), 201
        
    except ValueError as e:
        return jsonify({'error': f'Dữ liệu không hợp lệ: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Đăng nhập - MongoDB"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Không có dữ liệu'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Thiếu tên đăng nhập hoặc mật khẩu'}), 400
        
        # Tìm user trong MongoDB (có thể đăng nhập bằng email hoặc student_id)
        user = MongoHelper.find_one('users', {'email': username})
        if not user:
            user = MongoHelper.find_one('users', {'student_id': username})
        
        if not user:
            return jsonify({'error': 'Tên đăng nhập hoặc mật khẩu không đúng'}), 401
        
        # Check if user is active
        if user.get('status') != UserStatus.ACTIVE.value:
            return jsonify({'error': 'Tài khoản đã bị vô hiệu hóa'}), 403
        
        # Verify password
        if not check_password_hash(user.get('password_hash', ''), password):
            return jsonify({'error': 'Tên đăng nhập hoặc mật khẩu không đúng'}), 401
        
        # Update last_login
        MongoHelper.update_one(
            'users',
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.now(timezone.utc)}}
        )
        
        # Tạo tokens
        user_id_str = str(user['_id'])
        access_token = create_access_token(
            identity=user_id_str,
            additional_claims={'role': user.get('role', UserRole.READER.value)}
        )
        refresh_token = create_refresh_token(identity=user_id_str)
        
        return jsonify({
            'message': 'Đăng nhập thành công',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user_id_str,
                'email': user.get('email'),
                'name': user.get('name'),
                'role': user.get('role', UserRole.READER.value),
                'student_id': user.get('student_id'),
                'major': user.get('major', '')
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Làm mới access token - MongoDB"""
    try:
        current_user_id = get_jwt_identity()
        
        # Find user in MongoDB
        user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
        
        if not user or user.get('status') != UserStatus.ACTIVE.value:
            return jsonify({'error': 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'}), 403
        
        access_token = create_access_token(
            identity=current_user_id,
            additional_claims={'role': user.get('role', UserRole.READER.value)}
        )
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Lấy thông tin user hiện tại - MongoDB"""
    try:
        current_user_id = get_jwt_identity()
        user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
        
        if not user:
            return jsonify({'error': 'Không tìm thấy người dùng'}), 404
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'email': user.get('email'),
                'name': user.get('name'),
                'role': user.get('role', UserRole.READER.value),
                'student_id': user.get('student_id'),
                'major': user.get('major', ''),
                'status': user.get('status', UserStatus.ACTIVE.value)
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Đổi mật khẩu - MongoDB"""
    try:
        current_user_id = get_jwt_identity()
        user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})
        
        if not user:
            return jsonify({'error': 'Không tìm thấy người dùng'}), 404
        
        data = request.get_json()
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return jsonify({'error': 'Thiếu thông tin mật khẩu'}), 400
        
        # Verify old password
        if not check_password_hash(user.get('password_hash', ''), old_password):
            return jsonify({'error': 'Mật khẩu cũ không đúng'}), 401
        
        # Validate new password
        password_valid, password_msg = validate_password(new_password)
        if not password_valid:
            return jsonify({'error': password_msg}), 400
        
        # Update password in MongoDB
        MongoHelper.update_one(
            'users',
            {'_id': user['_id']},
            {'$set': {'password_hash': generate_password_hash(new_password)}}
        )
        
        return jsonify({'message': 'Đổi mật khẩu thành công'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Đăng xuất (client sẽ xóa token)"""
    return jsonify({'message': 'Đăng xuất thành công'}), 200

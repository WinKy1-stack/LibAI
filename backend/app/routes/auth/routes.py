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
from bson.errors import InvalidId
from pymongo import ReturnDocument
from app.utils.mongo_helper import MongoHelper
from app.models.mongodb_schemas import UserRole, UserStatus
from app.utils.validators import (
    validate_email, 
    validate_password, 
    validate_object_id,
    validate_name
)
from datetime import datetime, timezone
from app.exceptions import ValidationError, AuthenticationError, NotFoundError

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Đăng ký tài khoản mới - MongoDB"""
    data = request.get_json()

    # Validate dữ liệu đầu vào
    if not data:
        raise ValidationError('Không có dữ liệu')

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('fullName', '').strip()  # Frontend sends 'fullName'

    # Kiểm tra các trường bắt buộc
    if not username or not email or not password:
        raise ValidationError('Thiếu thông tin bắt buộc')

    # Validate email
    if not validate_email(email):
        raise ValidationError('Email không hợp lệ')

    # Validate password
    password_valid, password_msg = validate_password(password)
    if not password_valid:
        raise ValidationError(password_msg)

    # Kiểm tra email đã tồn tại chưa
    existing_user = MongoHelper.find_one('users', {'email': email})
    if existing_user:
        raise ValidationError('Email đã được sử dụng')

    # Kiểm tra username đã tồn tại chưa
    existing_user = MongoHelper.find_one('users', {'student_id': username})
    if existing_user:
        raise ValidationError('Tên đăng nhập đã được sử dụng')

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

    try:
        user_id = MongoHelper.insert_one('users', new_user)
    except Exception as e:
        if 'duplicate key error' in str(e).lower() or 'E11000' in str(e):
            if 'email' in str(e):
                raise ValidationError('Email đã được sử dụng')
            elif 'student_id' in str(e):
                raise ValidationError('Tên đăng nhập đã được sử dụng')
            else:
                raise ValidationError('Dữ liệu trùng lặp')
        raise

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

@auth_bp.route('/login', methods=['POST'])
def login():
    """Đăng nhập - MongoDB"""
    data = request.get_json()

    if not data:
        raise ValidationError('Không có dữ liệu')

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        raise ValidationError('Thiếu tên đăng nhập hoặc mật khẩu')

    # Tìm user trong MongoDB (có thể đăng nhập bằng email hoặc student_id)
    user = MongoHelper.find_one('users', {'email': username})
    if not user:
        user = MongoHelper.find_one('users', {'student_id': username})

    if not user:
        raise AuthenticationError('Tên đăng nhập hoặc mật khẩu không đúng')

    # Check if user is active
    if user.get('status') != UserStatus.ACTIVE.value:
        raise AuthenticationError('Tài khoản đã bị vô hiệu hóa')

    # Verify password
    if not check_password_hash(user.get('password_hash', ''), password):
        raise AuthenticationError('Tên đăng nhập hoặc mật khẩu không đúng')

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

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Làm mới access token - MongoDB"""
    current_user_id = get_jwt_identity()

    # Find user in MongoDB
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})

    if not user or user.get('status') != UserStatus.ACTIVE.value:
        raise AuthenticationError('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa')

    access_token = create_access_token(
        identity=current_user_id,
        additional_claims={'role': user.get('role', UserRole.READER.value)}
    )

    return jsonify({
        'access_token': access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Lấy thông tin user hiện tại - MongoDB"""
    current_user_id = get_jwt_identity()
    user = MongoHelper.find_one('users', {'_id': ObjectId(current_user_id)})

    if not user:
        raise NotFoundError('Không tìm thấy người dùng')

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

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Cập nhật thông tin profile - MongoDB"""
    current_user_id = get_jwt_identity()
    
    # Validate ObjectId
    is_valid, object_id, error_msg = validate_object_id(current_user_id)
    if not is_valid:
        raise ValidationError(error_msg)
    
    user = MongoHelper.find_one('users', {'_id': object_id})
    if not user:
        raise NotFoundError('Không tìm thấy người dùng')

    data = request.get_json()
    if not data:
        raise ValidationError('Không có dữ liệu')
    
    update_fields = {}
    
    # Validate and update name
    if 'name' in data:
        name = data['name'].strip() if data['name'] else ''
        if name:
            is_valid_name, name_error = validate_name(name)
            if not is_valid_name:
                raise ValidationError(name_error)
            update_fields['name'] = name
    
    # Validate and update email
    if 'email' in data:
        new_email = data['email'].strip() if data['email'] else ''
        if new_email and new_email != user.get('email'):
            if not validate_email(new_email):
                raise ValidationError('Email không hợp lệ')
            update_fields['email'] = new_email
    
    # Update preferences
    if 'preferences' in data and isinstance(data['preferences'], dict):
        preferences = dict(user.get('preferences', {}))
        if 'lang' in data['preferences']:
            lang = data['preferences']['lang']
            if lang in ['vi', 'en']:
                preferences['lang'] = lang
        if 'theme' in data['preferences']:
            theme = data['preferences']['theme']
            if theme in ['light', 'dark']:
                preferences['theme'] = theme
        update_fields['preferences'] = preferences
    
    # Block locked fields
    if 'student_id' in data:
        new_student_id = data['student_id'].strip() if data['student_id'] else ''
        current_student_id = user.get('student_id', '') or ''
        if new_student_id and new_student_id != current_student_id:
            raise ValidationError('Không thể thay đổi mã sinh viên')
    
    if 'major' in data:
        new_major = data['major'].strip() if data['major'] else ''
        current_major = user.get('major', '') or ''
        if new_major != current_major:
            raise ValidationError('Không thể thay đổi chuyên ngành')
    
    if 'role' in data and data['role'] != user.get('role'):
        raise ValidationError('Không thể thay đổi quyền hạn')
    
    if 'status' in data and data['status'] != user.get('status'):
        raise ValidationError('Không thể thay đổi trạng thái tài khoản')
    
    if not update_fields:
        raise ValidationError('Không có thông tin để cập nhật')
    
    # Update user
    try:
        updated_user = MongoHelper.find_one_and_update(
            'users',
            {'_id': object_id},
            {'$set': update_fields},
            return_document=ReturnDocument.AFTER
        )
    except Exception as e:
        if 'duplicate key error' in str(e).lower() or 'E11000' in str(e):
            if 'email' in str(e):
                raise ValidationError('Email đã được sử dụng')
            else:
                raise ValidationError('Dữ liệu trùng lặp')
        raise
    
    if not updated_user:
        raise NotFoundError('Không tìm thấy người dùng để cập nhật')
    
    return jsonify({
        'message': 'Cập nhật thông tin thành công',
        'user': {
            'id': str(updated_user['_id']),
            'email': updated_user.get('email'),
            'name': updated_user.get('name'),
            'role': updated_user.get('role'),
            'student_id': updated_user.get('student_id'),
            'major': updated_user.get('major', ''),
            'status': updated_user.get('status')
        }
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Đổi mật khẩu - MongoDB"""
    current_user_id = get_jwt_identity()
    
    # Validate ObjectId
    is_valid, object_id, error_msg = validate_object_id(current_user_id)
    if not is_valid:
        raise ValidationError(error_msg)
    
    user = MongoHelper.find_one('users', {'_id': object_id})
    if not user:
        raise NotFoundError('Không tìm thấy người dùng')

    data = request.get_json()
    if not data:
        raise ValidationError('Không có dữ liệu')
    
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not old_password or not new_password:
        raise ValidationError('Thiếu thông tin mật khẩu')
    
    if len(old_password) > 200 or len(new_password) > 200:
        raise ValidationError('Mật khẩu quá dài')

    if not check_password_hash(user.get('password_hash', ''), old_password):
        raise AuthenticationError('Mật khẩu cũ không đúng')

    password_valid, password_msg = validate_password(new_password)
    if not password_valid:
        raise ValidationError(password_msg)
    
    if check_password_hash(user.get('password_hash', ''), new_password):
        raise ValidationError('Mật khẩu mới phải khác mật khẩu cũ')

    MongoHelper.update_one(
        'users',
        {'_id': object_id},
        {'$set': {'password_hash': generate_password_hash(new_password)}}
    )

    return jsonify({'message': 'Đổi mật khẩu thành công'}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Đăng xuất (client sẽ xóa token)"""
    return jsonify({'message': 'Đăng xuất thành công'}), 200

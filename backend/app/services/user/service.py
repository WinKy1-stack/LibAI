"""
User Service - Business Logic cho User (MongoDB Version)
"""
from app.utils.mongo_helper import MongoHelper
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

class UserService:
    """Service xử lý logic liên quan đến User"""

    @staticmethod
    def get_all_users():
        """Lấy tất cả users"""
        users = MongoHelper.find_many('users', {})
        return [
            {
                'id': str(user['_id']),
                'email': user.get('email'),
                'name': user.get('name'),
                'student_id': user.get('student_id'),
                'role': user.get('role'),
                'status': user.get('status'),
                'created_at': user.get('created_at'),
                'last_login': user.get('last_login')
            }
            for user in users
        ]

    @staticmethod
    def get_user_by_id(user_id):
        """Lấy user theo ID"""
        try:
            user = MongoHelper.find_one('users', {'_id': ObjectId(user_id)})
            if user:
                return {
                    'id': str(user['_id']),
                    'email': user.get('email'),
                    'name': user.get('name'),
                    'student_id': user.get('student_id'),
                    'role': user.get('role'),
                    'status': user.get('status'),
                    'major': user.get('major'),
                    'preferences': user.get('preferences'),
                    'created_at': user.get('created_at'),
                    'last_login': user.get('last_login')
                }
            return None
        except:
            return None

    @staticmethod
    def get_user_by_username(username):
        """Lấy user theo username (student_id)"""
        user = MongoHelper.find_one('users', {'student_id': username})
        if user:
            return {
                'id': str(user['_id']),
                'email': user.get('email'),
                'name': user.get('name'),
                'student_id': user.get('student_id'),
                'role': user.get('role'),
                'status': user.get('status')
            }
        return None

    @staticmethod
    def get_user_by_email(email):
        """Lấy user theo email"""
        user = MongoHelper.find_one('users', {'email': email})
        if user:
            return {
                'id': str(user['_id']),
                'email': user.get('email'),
                'name': user.get('name'),
                'student_id': user.get('student_id'),
                'role': user.get('role'),
                'status': user.get('status')
            }
        return None

    @staticmethod
    def create_user(data):
        """Tạo user mới"""
        # Kiểm tra student_id đã tồn tại chưa
        if MongoHelper.find_one('users', {'student_id': data.get('student_id')}):
            raise ValueError('Student ID đã tồn tại')

        # Kiểm tra email đã tồn tại chưa
        if MongoHelper.find_one('users', {'email': data.get('email')}):
            raise ValueError('Email đã tồn tại')

        # Tạo user mới
        new_user = {
            'email': data.get('email'),
            'student_id': data.get('student_id'),
            'name': data.get('name', ''),
            'password_hash': generate_password_hash(data.get('password')),
            'role': data.get('role', 'reader'),
            'status': 'active',
            'major': data.get('major', ''),
            'preferences': data.get('preferences', {'lang': 'vi', 'theme': 'light'}),
            'created_at': datetime.now(timezone.utc),
            'last_login': None
        }

        user_id = MongoHelper.insert_one('users', new_user)
        new_user['_id'] = user_id
        new_user.pop('password_hash', None)
        
        return {
            'id': str(user_id),
            'email': new_user.get('email'),
            'name': new_user.get('name'),
            'student_id': new_user.get('student_id'),
            'role': new_user.get('role')
        }

    @staticmethod
    def update_user(user_id, data):
        """Cập nhật thông tin user"""
        try:
            user = MongoHelper.find_one('users', {'_id': ObjectId(user_id)})
            if not user:
                return None

            update_data = {}
            
            # Cập nhật các trường nếu có
            if 'email' in data:
                update_data['email'] = data['email']
            if 'name' in data:
                update_data['name'] = data['name']
            if 'password' in data:
                update_data['password_hash'] = generate_password_hash(data['password'])
            if 'status' in data:
                update_data['status'] = data['status']
            if 'major' in data:
                update_data['major'] = data['major']
            if 'preferences' in data:
                update_data['preferences'] = data['preferences']

            if update_data:
                MongoHelper.update_one('users', {'_id': ObjectId(user_id)}, {'$set': update_data})
            
            updated_user = MongoHelper.find_one('users', {'_id': ObjectId(user_id)})
            return {
                'id': str(updated_user['_id']),
                'email': updated_user.get('email'),
                'name': updated_user.get('name'),
                'student_id': updated_user.get('student_id'),
                'role': updated_user.get('role'),
                'status': updated_user.get('status')
            }
        except:
            return None

    @staticmethod
    def delete_user(user_id):
        """Xóa user (soft delete - set status to inactive)"""
        try:
            result = MongoHelper.update_one(
                'users',
                {'_id': ObjectId(user_id)},
                {'$set': {'status': 'inactive'}}
            )
            return result > 0
        except:
            return False

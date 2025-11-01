"""
User Service - Business Logic cho User
"""
from app import db
from app.models.user import User

class UserService:
    """Service xử lý logic liên quan đến User"""

    @staticmethod
    def get_all_users():
        """Lấy tất cả users"""
        users = User.query.all()
        return [user.to_dict() for user in users]

    @staticmethod
    def get_user_by_id(user_id):
        """Lấy user theo ID"""
        user = User.query.get(user_id)
        return user.to_dict() if user else None

    @staticmethod
    def get_user_by_username(username):
        """Lấy user theo username"""
        user = User.query.filter_by(username=username).first()
        return user.to_dict() if user else None

    @staticmethod
    def get_user_by_email(email):
        """Lấy user theo email"""
        user = User.query.filter_by(email=email).first()
        return user.to_dict() if user else None

    @staticmethod
    def create_user(data):
        """Tạo user mới"""
        # Kiểm tra username đã tồn tại chưa
        if User.query.filter_by(username=data.get('username')).first():
            raise ValueError('Username đã tồn tại')

        # Kiểm tra email đã tồn tại chưa
        if User.query.filter_by(email=data.get('email')).first():
            raise ValueError('Email đã tồn tại')

        # Tạo user mới
        user = User(
            username=data.get('username'),
            email=data.get('email'),
            full_name=data.get('full_name')
        )
        user.set_password(data.get('password'))

        db.session.add(user)
        db.session.commit()

        return user.to_dict()

    @staticmethod
    def update_user(user_id, data):
        """Cập nhật thông tin user"""
        user = User.query.get(user_id)

        if not user:
            return None

        # Cập nhật các trường nếu có
        if 'email' in data:
            user.email = data['email']
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'password' in data:
            user.set_password(data['password'])
        if 'is_active' in data:
            user.is_active = data['is_active']

        db.session.commit()
        return user.to_dict()

    @staticmethod
    def delete_user(user_id):
        """Xóa user"""
        user = User.query.get(user_id)

        if not user:
            return False

        db.session.delete(user)
        db.session.commit()
        return True

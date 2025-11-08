"""
User Model
"""
from app import db
from datetime import datetime, timezone
import bcrypt
from enum import Enum

class UserRole(str, Enum):
    """Các vai trò người dùng trong hệ thống"""
    ADMIN = "admin"
    LIBRARIAN = "librarian"
    USER = "user"

class User(db.Model):
    """Model cho bảng users"""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default=UserRole.USER, nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    avatar = db.Column(db.String(255))
    koha_patron_id = db.Column(db.String(50), index=True, comment='ID bạn đọc trong Koha ILS')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        """Hash password trước khi lưu"""
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        """Kiểm tra password có đúng không"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        """Chuyển đổi object thành dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'phone': self.phone,
            'address': self.address,
            'avatar': self.avatar,
            'koha_patron_id': self.koha_patron_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'is_verified': self.is_verified
        }

    def has_role(self, *roles):
        """Kiểm tra user có role trong danh sách roles không"""
        return self.role in roles

    def is_admin(self):
        """Kiểm tra user có phải admin không"""
        return self.role == UserRole.ADMIN

    def is_librarian(self):
        """Kiểm tra user có phải librarian không"""
        return self.role == UserRole.LIBRARIAN

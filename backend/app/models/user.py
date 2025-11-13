from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional

import bcrypt
from app import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    ADMIN = "admin"
    LIBRARIAN = "librarian"
    USER = "user"


def _hash_password(raw_password: str) -> str:
    return bcrypt.hashpw(
        raw_password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def _check_password(raw_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(
        raw_password.encode("utf-8"),
        password_hash.encode("utf-8"),
    )


def _dt_to_iso(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)

    password_hash = db.Column(db.String(255), nullable=False)

    full_name = db.Column(db.String(100))

    role = db.Column(
        db.String(20),
        default=UserRole.USER.value,
        nullable=False,
    )

    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    avatar = db.Column(db.String(255))

    koha_patron_id = db.Column(
        db.String(50),
        index=True,
        comment="ID bạn đọc trong Koha ILS",
    )

    created_at = db.Column(
        db.DateTime,
        default=utcnow,
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime,
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)

    last_login = db.Column(db.DateTime)

    def __repr__(self) -> str:
        return f"<User {self.username}>"

    # -------- Password API --------
    def set_password(self, password: str) -> None:
        self.password_hash = _hash_password(password)

    def check_password(self, password: str) -> bool:
        return _check_password(password, self.password_hash)

    # -------- Role helpers --------
    def has_role(self, *roles: str | UserRole) -> bool:
        role_values = {r.value if isinstance(r, UserRole) else r for r in roles}
        return self.role in role_values

    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value

    def is_librarian(self) -> bool:
        return self.role == UserRole.LIBRARIAN.value

    # -------- Serialization --------
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "phone": self.phone,
            "address": self.address,
            "avatar": self.avatar,
            "koha_patron_id": self.koha_patron_id,
            "created_at": _dt_to_iso(self.created_at),
            "updated_at": _dt_to_iso(self.updated_at),
            "last_login": _dt_to_iso(self.last_login),
            "is_active": self.is_active,
            "is_verified": self.is_verified,
        }

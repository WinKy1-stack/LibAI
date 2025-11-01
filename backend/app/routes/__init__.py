"""
Routes Package - API endpoints organization
"""
from .api import api_bp
from .chat import chat_bp
from .auth import auth_bp
from .library import library_bp

__all__ = [
    'api_bp',
    'chat_bp',
    'auth_bp',
    'library_bp'
]

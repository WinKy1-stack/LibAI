"""
Cấu hình ứng dụng Flask
"""
import os
from datetime import timedelta

class Config:
    """Cấu hình cơ bản cho Flask app"""

    # Secret key cho session và JWT
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

    # MongoDB Configuration
    # Mặc định: localhost (cho development)
    # Cloud: MongoDB Atlas (cho production/sharing)
    USE_CLOUD_MONGODB = os.getenv('USE_CLOUD_MONGODB', 'true')
    
    MONGO_URI_LOCAL = 'mongodb://localhost:27017/library_chatbox'
    MONGO_URI_CLOUD = 'mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0'
    
    MONGO_URI = os.getenv('MONGO_URI', MONGO_URI_CLOUD if USE_CLOUD_MONGODB else MONGO_URI_LOCAL)
    MONGO_DBNAME = os.getenv('MONGO_DBNAME', 'library_chatbox')
    
    # MongoDB Collections
    COLLECTION_USERS = 'users'
    COLLECTION_MARC_RECORDS = 'marc_records'
    COLLECTION_ITEMS = 'items'
    COLLECTION_LOANS = 'loans'
    COLLECTION_CONVERSATIONS = 'conversations'
    COLLECTION_MESSAGES = 'messages'
    COLLECTION_FAQ = 'faq'
    COLLECTION_DOCUMENTS = 'documents'
    COLLECTION_RECOMMEND_EVENTS = 'recommend_events'
    COLLECTION_METRICS = 'metrics'
    COLLECTION_ADMIN_CONFIGS = 'admin_configs'
    COLLECTION_Z3950_CACHE = 'z3950_cache'
    COLLECTION_OAI_RECORDS = 'oai_records'
    COLLECTION_SIP2_EVENTS = 'sip2_events'
    COLLECTION_AUTH_SESSIONS = 'auth_sessions'

    # JWT
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # CORS
    CORS_HEADERS = 'Content-Type'

    # Google Gemini AI Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')

class DevelopmentConfig(Config):
    """Cấu hình cho môi trường development"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Cấu hình cho môi trường production"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Cấu hình cho môi trường testing"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'

"""
Cấu hình ứng dụng Flask (Hợp nhất Backend + Library API)
"""
import os
from datetime import timedelta


class Config:
    """Cấu hình cơ bản cho Flask app"""

    # ========== 🔑 Flask & JWT ==========
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ========== 🧱 SQLAlchemy (cho User/Auth) ==========
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ========== 🍃 MongoDB ==========
    USE_CLOUD_MONGODB = os.getenv('USE_CLOUD_MONGODB', 'false').lower() == 'true'
    
    MONGO_URI_LOCAL = 'mongodb://localhost:27017/library_chatbox'
    MONGO_URI_CLOUD = (
        'mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/'
        'library_chatbox?retryWrites=true&w=majority&appName=Cluster0'
    )
    MONGO_URI = os.getenv('MONGO_URI', MONGO_URI_CLOUD if USE_CLOUD_MONGODB else MONGO_URI_LOCAL)
    MONGO_DBNAME = os.getenv('MONGO_DBNAME', 'library_chatbox')

    # ========== 📚 MongoDB Collections ==========
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

    # ========== 🌐 CORS ==========
    CORS_HEADERS = 'Content-Type'

    # ========== 🤖 Gemini AI ==========
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')

    # ========== 🔎 Z39.50 ==========
    Z3950_SERVERS = {
        # Có thể thêm thư viện Việt Nam sau này
        # "NLV": {
        #     "name": "Thư viện Quốc gia Việt Nam",
        #     "host": "z3950.nlv.gov.vn",
        #     "port": 9999,
        #     "database": "biblio",
        #     "syntax": "USMARC",
        # },
        "LOC": {
            "name": "Thư viện Quốc hội Mỹ (Library of Congress)",
            "host": "z3950.loc.gov",
            "port": 7090,
            "database": "voyager",
            "syntax": "USMARC",
        }
    }

    # ========= 🎯 Trường tìm kiếm theo MARC21 =========
SEARCH_FIELDS = {
    "any": [
        "fields.245.a",  # Nhan đề
        "fields.245.c",  # Trách nhiệm (tác giả trong nhan đề)
        "fields.100.a",  # Tác giả chính
        "fields.700.a",  # Tác giả phụ
        "fields.260.b",  # Nhà xuất bản
        "fields.260.c",  # Năm xuất bản
        "fields.650.a",  # Chủ đề
        "fields.520.a",  # Tóm tắt / mô tả
        "fields.504.a"   # Ghi chú tài liệu tham khảo
    ],
    "title": [
        "fields.245.a",  # Tên sách
        "fields.245.c"   # Phần trách nhiệm
    ],
    "author": [
        "fields.100.a",  # Tác giả chính
        "fields.700.a"   # Tác giả phụ
    ],
    "subject": [
        "fields.650.a"   # Chủ đề / lĩnh vực
    ],
    "publisher": [
        "fields.260.b"   # Nhà xuất bản
    ],
    "year": [
        "fields.260.c"   # Năm xuất bản
    ],
    "summary": [
        "fields.520.a"   # Tóm tắt nội dung
    ],
    "reference": [
        "fields.504.a"   # Thông tin tham khảo
    ],
    "isbn": [
        "fields.020.a"   # ISBN (nếu có)
    ]
}



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

"""
Cấu hình ứng dụng Flask (Hợp nhất Backend + Library API)
"""
import os
from datetime import timedelta
from dataclasses import dataclass

@dataclass
class EnvConfig:
    """Dataclass để quản lý các biến môi trường"""
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    MONGO_URI: str
    MONGO_DBNAME: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    GEMINI_MAX_TOKENS: int
    GEMINI_TEMPERATURE: float
    MAX_BOOKS_IN_CONTEXT: int
    MAX_CHAT_HISTORY: int

    @classmethod
    def from_env(cls) -> 'EnvConfig':
        """Tạo config từ environment variables"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY không được cấu hình trong .env")
        
        # Get MongoDB URI based on USE_CLOUD_MONGODB flag
        use_cloud = os.getenv('USE_CLOUD_MONGODB', 'true').lower() == 'true'
        mongo_uri = os.getenv('MONGO_URI_CLOUD') if use_cloud else os.getenv('MONGO_URI_LOCAL')
        
        if not mongo_uri:
            raise ValueError("MONGO_URI không được cấu hình trong .env")
        
        # Get database name
        mongo_dbname = os.getenv('MONGO_DBNAME', 'library_chatbox')
        
        # Ensure database name is in URI
        if '?' in mongo_uri:
            # URI has query params, insert database before ?
            base_uri = mongo_uri.split('?')[0]
            query_params = mongo_uri.split('?')[1]
            
            # Check if database is already in URI
            if not base_uri.endswith(f'/{mongo_dbname}'):
                if base_uri.endswith('/'):
                    mongo_uri = f"{base_uri}{mongo_dbname}?{query_params}"
                else:
                    mongo_uri = f"{base_uri}/{mongo_dbname}?{query_params}"
            else:
                mongo_uri = f"{base_uri}?{query_params}"
        else:
            # No query params
            if not mongo_uri.endswith(f'/{mongo_dbname}'):
                if mongo_uri.endswith('/'):
                    mongo_uri = f"{mongo_uri}{mongo_dbname}"
                else:
                    mongo_uri = f"{mongo_uri}/{mongo_dbname}"

        return cls(
            SECRET_KEY=os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production'),
            JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production'),
            MONGO_URI=mongo_uri,
            MONGO_DBNAME=mongo_dbname,
            GEMINI_API_KEY=api_key,
            GEMINI_MODEL=os.getenv('GEMINI_MODEL', 'gemini-2.0-flash'),
            GEMINI_MAX_TOKENS=int(os.getenv('GEMINI_MAX_TOKENS', '1000')),
            GEMINI_TEMPERATURE=float(os.getenv('GEMINI_TEMPERATURE', '0.7')),
            MAX_BOOKS_IN_CONTEXT=int(os.getenv('MAX_BOOKS_IN_CONTEXT', '30')),
            MAX_CHAT_HISTORY=int(os.getenv('MAX_CHAT_HISTORY', '10'))
        )

class Config:
    """Cấu hình cơ bản cho Flask app"""
    env_config = EnvConfig.from_env()

    # ========== 🔑 Flask & JWT ==========
    SECRET_KEY = env_config.SECRET_KEY
    JWT_SECRET_KEY = env_config.JWT_SECRET_KEY

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ========== 🍃 MongoDB ==========
    MONGO_URI = env_config.MONGO_URI
    MONGO_DBNAME = env_config.MONGO_DBNAME

    # ========== 📚 MongoDB Collections ==========
    COLLECTION_USERS = 'users'
    COLLECTION_MARC_RECORDS = 'marc_21'
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
    GEMINI_API_KEY = env_config.GEMINI_API_KEY
    GEMINI_MODEL = env_config.GEMINI_MODEL
    GEMINI_MAX_TOKENS = env_config.GEMINI_MAX_TOKENS
    GEMINI_TEMPERATURE = env_config.GEMINI_TEMPERATURE
    MAX_BOOKS_IN_CONTEXT = env_config.MAX_BOOKS_IN_CONTEXT
    MAX_CHAT_HISTORY = env_config.MAX_CHAT_HISTORY

    # ========== 🔎 Z39.50 ==========
    Z3950_SERVERS = {
        "LOC": {
            "name": "Thư viện Quốc hội Mỹ (Library of Congress)",
            "host": "z3950.loc.gov",
            "port": 7090,
            "database": "voyager",
            "syntax": "USMARC",
        }
    }

    # ========== 📚 Koha (ILS) ==========
    # Cấu hình cho staff OPAC, xem thêm: http://45.118.146.109:8082
    KOHA_BASE_URL = os.getenv('KOHA_BASE_URL', '')
    # Chọn chế độ xác thực: api_key | basic
    KOHA_AUTH_MODE = os.getenv('KOHA_AUTH_MODE', 'api_key')
    # API key để truy cập REST API
    KOHA_API_KEY = os.getenv('KOHA_API_KEY')
    # Thông tin xác thực Basic Auth
    KOHA_USERNAME = os.getenv('KOHA_USERNAME')
    KOHA_PASSWORD = os.getenv('KOHA_PASSWORD')

    # ========= 🎯 Trường tìm kiếm theo MARC21 =========
    SEARCH_FIELDS = {
        "any": [
            "title.main",              # Nhan đề chính
            "title.subtitle",          # Phụ đề
            "contributors.name",       # Tác giả/Người đóng góp
            "subjects",                # Chủ đề (array)
            "publication.publisher",   # Nhà xuất bản
            "publication.place",       # Nơi xuất bản
            "publication.year",        # Năm xuất bản
            "notes",                   # Ghi chú (array)
            "identifiers.isbn"         # ISBN (array)
        ],
        "title": [
            "title.main",              # Tên sách
            "title.subtitle"           # Phụ đề
        ],
        "author": [
            "contributors.name"        # Tác giả/Người đóng góp
        ],
        "subject": [
            "subjects"                 # Chủ đề (array)
        ],
        "publisher": [
            "publication.publisher"    # Nhà xuất bản
        ],
        "year": [
            "publication.year"         # Năm xuất bản
        ],
        "summary": [
            "notes"                    # Ghi chú (có thể chứa tóm tắt)
        ],
        "reference": [
            "notes"                    # Ghi chú (có thể chứa thông tin tham khảo)
        ],
        "isbn": [
            "identifiers.isbn"         # ISBN (array)
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

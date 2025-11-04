"""
Khởi tạo Flask application
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from app.config import Config

# Khởi tạo extensions
jwt = JWTManager()
mongo = PyMongo()

def create_app(config_class=Config):
    """
    Application Factory Pattern
    Tạo và cấu hình Flask app
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Khởi tạo extensions
    jwt.init_app(app)
    mongo.init_app(app)

    # Cấu hình CORS chi tiết
    CORS(app,
         resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Đăng ký blueprints
    from app.routes.api import api_bp
    from app.routes.auth import auth_bp
    from app.routes.mongodb_routes import mongodb_bp
    from app.routes.library import library_bp
    from app.routes.library.z3950_routes import z3950_bp
    from app.routes.chat import chat_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(mongodb_bp)  # Legacy books API
    app.register_blueprint(library_bp)  # New library system API
    app.register_blueprint(z3950_bp)    # Z39.50 search API
    app.register_blueprint(chat_bp)     # Chat AI API

    # Root endpoint
    @app.route('/')
    def index():
        return {
            "message": "📚 Library Chatbox API đang chạy!",
            "routes": [
                "/api/auth/register - Đăng ký tài khoản",
                "/api/auth/login - Đăng nhập",
                "/api/auth/me - Lấy thông tin user",
                "/api/mongodb/books - Danh sách sách",
                "/search?keyword=AI - Tìm kiếm",
                "/search/test - Test search",
                "/health - Kiểm tra trạng thái server",
                "/mongodb-test - Test kết nối MongoDB"
            ]
        }, 200

    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'ok', 'message': 'Server đang chạy'}, 200
    
    # MongoDB connection test endpoint
    @app.route('/mongodb-test')
    def mongodb_test():
        try:
            # Test MongoDB connection
            mongo.db.command('ping')
            collections = mongo.db.list_collection_names()
            return {
                'status': 'ok',
                'message': 'MongoDB connected successfully',
                'database': app.config['MONGO_DBNAME'],
                'collections': collections
            }, 200
        except Exception as e:
            return {
                'status': 'error',
                'message': f'MongoDB connection failed: {str(e)}'
            }, 500

    return app

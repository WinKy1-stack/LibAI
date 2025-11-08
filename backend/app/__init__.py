"""
Khởi tạo Flask application
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from app.config import Config
import logging

logger = logging.getLogger(__name__)

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

    # Log MongoDB URI (ẩn password)
    mongo_uri = app.config.get('MONGO_URI', 'NOT SET')
    if mongo_uri and '@' in mongo_uri:
        # Hide password in log
        parts = mongo_uri.split('@')
        if len(parts) == 2:
            credentials = parts[0].split('://')[1]
            if ':' in credentials:
                user = credentials.split(':')[0]
                logger.info(f"MongoDB URI configured for user: {user}")
    else:
        logger.info(f"MongoDB URI: {mongo_uri}")
    
    # Khởi tạo extensions
    jwt.init_app(app)
    
    # Khởi tạo MongoDB
    try:
        mongo.init_app(app)
        # Test connection
        if mongo.db is not None:
            mongo.db.command('ping')
            logger.info("MongoDB connected successfully")
        else:
            logger.error("MongoDB db is None after init_app")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {str(e)}")
        raise

    # Cấu hình CORS chi tiết
    CORS(app,
         resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Đăng ký blueprints
    from app.routes.api import api_bp
    from app.routes.auth import auth_bp
    from app.routes.library import library_bp
    from app.routes.z3950_routes import z3950_bp
    from app.routes.users import users_bp
    from app.routes.chat import chat_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)     # Chat API
    app.register_blueprint(library_bp)  # New library system API
    app.register_blueprint(z3950_bp)    # Z39.50 search service

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

    # Error handlers
    from app.exceptions import ApiError
    from flask import jsonify

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        response = jsonify({
            'success': False,
            'message': error.message
        })
        response.status_code = error.status_code
        return response

    @app.errorhandler(500)
    def handle_internal_error(error):
        response = jsonify({
            'success': False,
            'message': 'Đã có lỗi xảy ra ở server'
        })
        response.status_code = 500
        return response

    return app

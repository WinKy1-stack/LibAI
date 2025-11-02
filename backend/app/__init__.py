"""
Khởi tạo Flask application
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from app.config import Config

# Khởi tạo extensions
db = SQLAlchemy()
migrate = Migrate()
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
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mongo.init_app(app)
    CORS(app)

    # Đăng ký blueprints
    from app.routes.api import api_bp
    from app.routes.auth import auth_bp
    from app.routes.mongodb_routes import mongodb_bp
    from app.routes.library_routes import library_bp
    
    from app.routes.library_routes import library_bp
    from app.routes.z3950_routes import z3950_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(mongodb_bp)  # Legacy books API
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

    return app

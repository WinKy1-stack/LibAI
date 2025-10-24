"""
Khởi tạo Flask application
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config

# Khởi tạo extensions
db = SQLAlchemy()
migrate = Migrate()

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
    CORS(app)

    # Đăng ký blueprints
    from app.routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'ok', 'message': 'Server đang chạy'}, 200

    return app

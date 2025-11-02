"""
File khởi động ứng dụng Flask
"""
import os
import sys
import signal
import logging
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import DevelopmentConfig

# === Load biến môi trường (.env) ===
load_dotenv()

# === Logging cơ bản ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# === Khởi tạo Flask App ===
def create_app():
    """Khởi tạo Flask app và đăng ký các blueprint"""
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    # Bật CORS và JWT
    CORS(app)
    JWTManager(app)

    # === Import và đăng ký các routes ===
    # ⚙️ Sửa đúng đường dẫn import (library nằm trong routes)
    from app.routes.mongodb_routes import mongodb_bp
    from app.routes.library.z3950_routes import z3950_bp  # ✅ Đường dẫn chính xác

    # ⚙️ Đăng ký Blueprint
    app.register_blueprint(mongodb_bp)
    app.register_blueprint(z3950_bp)

    @app.route('/')
    def index():
        return {
            "message": "📚 Library Chatbox API đang chạy!",
            "routes": [
                "/api/mongodb/books",
                "/search?keyword=AI",
                "/search/test"
            ]
        }

    return app


# === Tạo app ===
app = create_app()


# === Xử lý Ctrl+C (SIGINT) ===
def signal_handler(sig, frame):
    print('\n\nServer đang dừng lại...')
    print('Tạm biệt huhu tui buồn quá 😢')
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)


# === Kiểm tra kết nối Gemini API ===
def test_gemini_connection():
    """Test kết nối với Gemini API khi server khởi động"""
    try:
        from app.services.prompt import get_prompt_service

        print("\n" + "=" * 70)
        print("TESTING GEMINI API CONNECTION...")
        print("=" * 70)

        prompt_service = get_prompt_service()

        # Gửi prompt thử
        test_response = prompt_service.generate_response(
            user_message="Hello, are you working?",
            chat_history=[],
            context=None
        )

        print("✅ GEMINI API CONNECTION: SUCCESS")
        print(f"Response: {test_response[:100]}...")
        print("=" * 70 + "\n")

        return True

    except Exception as e:
        print("❌ GEMINI API CONNECTION: FAILED")
        print(f"Error: {str(e)}")
        print("=" * 70 + "\n")
        return False


# === Chạy server ===
if __name__ == '__main__':
    try:
        print("\n" + "=" * 70)
        print("🚀 FLASK SERVER STARTING...")
        print("=" * 70)
        print(f"🌐 Address: http://0.0.0.0:{os.getenv('PORT', 5000)}")
        print(f"🔧 Environment: {os.getenv('FLASK_ENV', 'production')}")
        print("🧠 Press Ctrl+C to stop server")
        print("=" * 70)

        # Kiểm tra Gemini trước khi khởi động
        gemini_ok = test_gemini_connection()

        if gemini_ok:
            print("✅ All systems ready - Starting Flask server...\n")
        else:
            print("⚠️  Warning: Gemini API not available - Chat features may not work\n")

        app.run(
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000)),
            debug=os.getenv('FLASK_ENV') == 'development',
            use_reloader=False  # Tránh conflict với signal handler
        )

    except KeyboardInterrupt:
        print('\n\nServer đang dừng lại...')
        print('Tạm biệt huhu tui buồn quá 😢')
        sys.exit(0)

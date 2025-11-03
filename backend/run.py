"""
File khởi động ứng dụng Flask
"""
import os
import sys
import signal
import logging
from dotenv import load_dotenv

# === Load biến môi trường (.env) ===
load_dotenv()

# === Logging cơ bản ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# === Import create_app từ app/__init__.py ===
from app import create_app
from app.config import DevelopmentConfig

# === Tạo app ===
app = create_app(DevelopmentConfig)


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

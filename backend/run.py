import os
import sys
import signal
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from app import create_app
from app.config import DevelopmentConfig

app = create_app(DevelopmentConfig)

def test_gemini_connection():
    """Test kết nối với Gemini API khi server khởi động"""
    try:
        from app.ai.pipelines.prompt import PromptService

        print("\n" + "=" * 70)
        print("TESTING GEMINI API CONNECTION...")
        print("=" * 70)

        with app.app_context():
            from flask import current_app
            prompt_service = PromptService(current_app.config)

            test_response = prompt_service.generate_response(
                user_message="Hello, are you working?",
                chat_history=[],
                context=None
            )

            print("GEMINI API CONNECTION: SUCCESS")
            print(f"Response: {test_response[:100]}...")
            print("=" * 70 + "\n")

            return True

    except Exception as e:
        print("GEMINI API CONNECTION: FAILED")
        print(f"Error: {str(e)}")
        print("=" * 70 + "\n")
        return False


# === Chạy server ===
if __name__ == '__main__':
    try:
        print("\n" + "=" * 70)
        print("FLASK SERVER STARTING...")
        print("=" * 70)
        print(f"Address: http://0.0.0.0:{os.getenv('PORT', 5000)}")
        print(f"Environment: {os.getenv('FLASK_ENV', 'production')}")
        print("Press Ctrl+C to stop server")
        print("=" * 70)

        # Kiểm tra Gemini trước khi khởi động
        gemini_ok = test_gemini_connection()

        if gemini_ok:
            print("Tất cả hệ thống sẵn sàng - Đang khởi động Flask server...\n")
        else:
            print("Cảnh báo: Gemini API không khả dụng - Các tính năng chat có thể không hoạt động\n")

        app.run(
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000)),
            debug=os.getenv('FLASK_ENV') == 'development',
            use_reloader=False
        )

    except KeyboardInterrupt:
        print('\n\nServer đang dừng lại...')
        print('Tạm biệt huhu tui buồn quá 😢')
        sys.exit(0)

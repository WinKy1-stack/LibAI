"""
File khởi động ứng dụng Flask
"""
from app import create_app
from dotenv import load_dotenv
import os
import signal
import sys
import logging

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = create_app()

def signal_handler(sig, frame):
    """Xử lý tín hiệu khi bấm Ctrl+C"""
    print('\n\nServer đang dừng lại...')
    print('Tạm biệt huhu tui buồn quá!')
    sys.exit(0)

# Đăng ký signal handler cho SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)

def test_gemini_connection():
    """Test kết nối với Gemini API khi server khởi động"""
    try:
        from app.services.prompt import get_prompt_service
        
        print("\n" + "=" * 70)
        print("TESTING GEMINI API CONNECTION...")
        print("=" * 70)
        
        # Khởi tạo service - sẽ tự động log thông tin
        prompt_service = get_prompt_service()
        
        # Test với một prompt đơn giản
        test_response = prompt_service.generate_response(
            user_message="Hello, are you working?",
            chat_history=[],
            context=None
        )
        
        print("GEMINI API CONNECTION: SUCCESS")
        print(f"Test Response: {test_response[:100]}...")
        print("=" * 70)
        print()
        
        return True
    except Exception as e:
        print("GEMINI API CONNECTION: FAILED")
        print(f"Error: {str(e)}")
        print("=" * 70)
        print()
        return False

if __name__ == '__main__':
    try:
        print("\n" + "=" * 70)
        print("FLASK SERVER STARTING...")
        print("=" * 70)
        print(f'Address: http://0.0.0.0:{os.getenv("PORT", 5000)}')
        print(f'Environment: {os.getenv("FLASK_ENV", "production")}')
        print('Press Ctrl+C to stop server')
        print("=" * 70)
        
        # Test Gemini connection
        gemini_ok = test_gemini_connection()
        
        if gemini_ok:
            print("All systems ready - Starting Flask server...\n")
        else:
            print("Warning: Gemini API not available - Chat may not work\n")
        
        app.run(
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000)),
            debug=os.getenv('FLASK_ENV') == 'development',
            use_reloader=False  # Tắt reloader để tránh conflict với signal handler
        )
    except KeyboardInterrupt:
        print('\n\nServer đang dừng lại...')
        print('Tạm biệt huhu tui buồn quá!')
        sys.exit(0)
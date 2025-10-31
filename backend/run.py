"""
File khởi động ứng dụng Flask
"""
from app import create_app
from dotenv import load_dotenv
import os
import signal
import sys

load_dotenv()

app = create_app()

def signal_handler(sig, frame):
    """Xử lý tín hiệu khi bấm Ctrl+C"""
    print('\n\nServer đang dừng lại...')
    print('Tạm biệt huhu tui buồn quá!')
    sys.exit(0)

# Đăng ký signal handler cho SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)

if __name__ == '__main__':
    try:
        print('Server đang khởi động...')
        print(f'Địa chỉ: http://0.0.0.0:{os.getenv("PORT", 5000)}')
        print('Nhấn Ctrl+C để dừng server\n')
        
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

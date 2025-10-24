"""
File khởi động ứng dụng Flask
"""
from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()

app = create_app()

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )

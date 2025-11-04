"""
Script to create initial admin user (MongoDB Version)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.utils.mongo_helper import MongoHelper
from app.models.mongodb_schemas import UserRole, UserStatus
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        admin = MongoHelper.find_one('users', {'email': 'admin@library.com'})
        
        if admin:
            print('❌ Admin user already exists!')
            return
        
        # Create admin user
        admin_user = {
            'email': 'admin@library.com',
            'student_id': 'admin',
            'name': 'Administrator',
            'password_hash': generate_password_hash('Admin123'),
            'role': UserRole.ADMIN.value,
            'status': UserStatus.ACTIVE.value,
            'major': '',
            'preferences': {'lang': 'vi', 'theme': 'light'},
            'created_at': datetime.now(timezone.utc),
            'last_login': None
        }
        
        # Create librarian user
        librarian_user = {
            'email': 'librarian@library.com',
            'student_id': 'librarian',
            'name': 'Librarian User',
            'password_hash': generate_password_hash('Librarian123'),
            'role': UserRole.LIBRARIAN.value,
            'status': UserStatus.ACTIVE.value,
            'major': '',
            'preferences': {'lang': 'vi', 'theme': 'light'},
            'created_at': datetime.now(timezone.utc),
            'last_login': None
        }
        
        # Create regular user
        regular_user = {
            'email': 'user@library.com',
            'student_id': 'user',
            'name': 'Regular User',
            'password_hash': generate_password_hash('User1234'),
            'role': UserRole.READER.value,
            'status': UserStatus.ACTIVE.value,
            'major': '',
            'preferences': {'lang': 'vi', 'theme': 'light'},
            'created_at': datetime.now(timezone.utc),
            'last_login': None
        }
        
        try:
            MongoHelper.insert_one('users', admin_user)
            MongoHelper.insert_one('users', librarian_user)
            MongoHelper.insert_one('users', regular_user)
            
            print('✅ Users created successfully!')
            print('\n📋 Default users:')
            print('=' * 50)
            print('Admin:')
            print('  Username: admin')
            print('  Password: Admin123')
            print('  Email: admin@library.com')
            print()
            print('Librarian:')
            print('  Username: librarian')
            print('  Password: Librarian123')
            print('  Email: librarian@library.com')
            print()
            print('User:')
            print('  Username: user')
            print('  Password: User1234')
            print('  Email: user@library.com')
            print('=' * 50)
            
        except ValueError as e:
            print(f'❌ Error creating users: {str(e)}')
        except Exception as e:
            print(f'❌ Unexpected error: {str(e)}')

if __name__ == '__main__':
    create_admin_user()

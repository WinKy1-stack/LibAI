"""
Script to create initial admin user
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User, UserRole

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            print('❌ Admin user already exists!')
            return
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@library.com',
            full_name='Administrator',
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        admin.set_password('Admin123')
        
        # Create librarian user
        librarian = User(
            username='librarian',
            email='librarian@library.com',
            full_name='Librarian User',
            role=UserRole.LIBRARIAN,
            is_active=True,
            is_verified=True
        )
        librarian.set_password('Librarian123')
        
        # Create regular user
        user = User(
            username='user',
            email='user@library.com',
            full_name='Regular User',
            role=UserRole.USER,
            is_active=True,
            is_verified=True
        )
        user.set_password('User1234')
        
        try:
            db.session.add(admin)
            db.session.add(librarian)
            db.session.add(user)
            db.session.commit()
            
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
            db.session.rollback()
            print(f'❌ Error creating users: {str(e)}')
        except Exception as e:
            db.session.rollback()
            print(f'❌ Unexpected error: {str(e)}')

if __name__ == '__main__':
    create_admin_user()

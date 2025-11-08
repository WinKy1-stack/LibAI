"""
Script để gán koha_patron_id cho users (nếu cần)
Chạy: python update_user_koha_patron_id.py <user_id> <patron_id>
"""
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, mongo
from app.config import DevelopmentConfig
from bson.objectid import ObjectId

def update_user_patron_id(user_id: str, patron_id: str):
    """
    Cập nhật koha_patron_id cho user
    
    Args:
        user_id: ID của user trong MongoDB
        patron_id: ID patron trong Koha
    """
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        # Update user
        result = mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'koha_patron_id': patron_id}}
        )
        
        if result.matched_count == 0:
            print(f"❌ Không tìm thấy user với ID: {user_id}")
            return False
        
        if result.modified_count > 0:
            print(f"✅ Đã cập nhật koha_patron_id={patron_id} cho user {user_id}")
        else:
            print(f"⚠️  User {user_id} đã có koha_patron_id={patron_id}")
        
        return True

def list_users():
    """Liệt kê tất cả users"""
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        users = mongo.db.users.find({}, {'username': 1, 'email': 1, 'koha_patron_id': 1})
        
        print("\n📋 DANH SÁCH USERS:")
        print("-" * 70)
        
        for user in users:
            user_id = str(user['_id'])
            username = user.get('username', 'N/A')
            email = user.get('email', 'N/A')
            patron_id = user.get('koha_patron_id', 'Chưa có')
            
            print(f"ID: {user_id}")
            print(f"  Username: {username}")
            print(f"  Email: {email}")
            print(f"  Koha Patron ID: {patron_id}")
            print()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python update_user_koha_patron_id.py list")
        print("  python update_user_koha_patron_id.py <user_id> <patron_id>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'list':
        list_users()
    elif len(sys.argv) == 3:
        user_id = sys.argv[1]
        patron_id = sys.argv[2]
        update_user_patron_id(user_id, patron_id)
    else:
        print("❌ Invalid arguments!")
        print("Usage:")
        print("  python update_user_koha_patron_id.py list")
        print("  python update_user_koha_patron_id.py <user_id> <patron_id>")
        sys.exit(1)

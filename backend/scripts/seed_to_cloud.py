"""
Script to seed MongoDB CLOUD with library system data
This script connects directly to MongoDB Atlas Cloud

Run: python scripts/seed_to_cloud.py
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from pymongo import MongoClient

# MongoDB Cloud Atlas Connection
MONGO_CLOUD_URI = "mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "library_chatbox"

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.mongodb_schemas import (
    UserRole, UserStatus, ItemStatus, LoanStatus,
    FAQStatus, DocumentType, DocumentSource,
    RecommendEvent, MetricKind, MARCRecordSource
)

def get_cloud_db():
    """Connect to MongoDB Cloud"""
    client = MongoClient(MONGO_CLOUD_URI)
    return client[DB_NAME]

def seed_users(db):
    """Seed sample users"""
    print("👥 Seeding users to Cloud MongoDB...")
    
    # Default password: "Password123"
    default_password_hash = generate_password_hash("Password123")
    
    users = [
        {
            "email": "sv001@ntt.edu.vn",
            "student_id": "SV001",
            "name": "Nguyễn Văn A",
            "password_hash": default_password_hash,
            "role": UserRole.READER.value,
            "major": "IT",
            "status": UserStatus.ACTIVE.value,
            "preferences": {"lang": "vi", "theme": "light"},
            "created_at": datetime.now(timezone.utc),
            "last_login": None
        },
        {
            "email": "sv002@ntt.edu.vn",
            "student_id": "SV002",
            "name": "Trần Thị B",
            "password_hash": default_password_hash,
            "role": UserRole.READER.value,
            "major": "AI",
            "status": UserStatus.ACTIVE.value,
            "preferences": {"lang": "vi", "theme": "dark"},
            "created_at": datetime.now(timezone.utc),
            "last_login": None
        },
        {
            "email": "librarian@ntt.edu.vn",
            "student_id": "LIB001",
            "name": "Lê Thị C (Thủ thư)",
            "password_hash": default_password_hash,
            "role": UserRole.LIBRARIAN.value,
            "major": "Library Science",
            "status": UserStatus.ACTIVE.value,
            "preferences": {"lang": "vi", "theme": "light"},
            "created_at": datetime.now(timezone.utc),
            "last_login": None
        },
        {
            "email": "admin@ntt.edu.vn",
            "student_id": "ADMIN001",
            "name": "Phạm Văn D (Admin)",
            "password_hash": default_password_hash,
            "role": UserRole.ADMIN.value,
            "major": "Management",
            "status": UserStatus.ACTIVE.value,
            "preferences": {"lang": "vi", "theme": "dark"},
            "created_at": datetime.now(timezone.utc),
            "last_login": None
        }
    ]
    
    # Clear existing users
    db.users.delete_many({})
    
    # Insert users
    result = db.users.insert_many(users)
    print(f"✅ Created {len(result.inserted_ids)} users")
    return result.inserted_ids

def seed_marc_records(db):
    """Seed sample MARC records"""
    print("📚 Seeding MARC records to Cloud MongoDB...")
    
    marc_records = [
        {
            "leader": "00000nam  2200000   4500",
            "control_number": "MARC001",
            "control_number_id": "NTT20250001",
            "fixed_length_data": "250101s2024    vm a     |    000 0 vie d",
            "isbn": ["978-0-13-468599-1"],
            "title": "Introduction to Algorithms",
            "author": "Cormen, Thomas H.",
            "publisher": "MIT Press",
            "pub_year": 2024,
            "edition": "4th ed.",
            "physical_desc": "1312 p. : ill. ; 24 cm.",
            "subjects": ["Algorithms", "Computer Science", "Data Structures"],
            "summary": "Comprehensive introduction to algorithms and data structures",
            "language": "eng",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "leader": "00000nam  2200000   4500",
            "control_number": "MARC002",
            "control_number_id": "NTT20250002",
            "fixed_length_data": "250101s2023    vm a     |    000 0 vie d",
            "isbn": ["978-0-13-595705-9"],
            "title": "Artificial Intelligence: A Modern Approach",
            "author": "Russell, Stuart J.; Norvig, Peter",
            "publisher": "Pearson",
            "pub_year": 2023,
            "edition": "4th ed.",
            "physical_desc": "1136 p. : ill. ; 24 cm.",
            "subjects": ["Artificial Intelligence", "Machine Learning", "Deep Learning"],
            "summary": "The most comprehensive, up-to-date introduction to AI",
            "language": "eng",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "leader": "00000nam  2200000   4500",
            "control_number": "MARC003",
            "control_number_id": "NTT20250003",
            "fixed_length_data": "250101s2024    vm a     |    000 0 vie d",
            "isbn": ["978-1-492-05206-7"],
            "title": "Designing Data-Intensive Applications",
            "author": "Kleppmann, Martin",
            "publisher": "O'Reilly Media",
            "pub_year": 2024,
            "edition": "1st ed.",
            "physical_desc": "616 p. : ill. ; 24 cm.",
            "subjects": ["Database Systems", "Distributed Systems", "Big Data"],
            "summary": "The big ideas behind reliable, scalable, and maintainable systems",
            "language": "eng",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "leader": "00000nam  2200000   4500",
            "control_number": "MARC004",
            "control_number_id": "NTT20250004",
            "fixed_length_data": "250101s2023    vm a     |    000 0 vie d",
            "isbn": ["978-0-596-52068-7"],
            "title": "JavaScript: The Good Parts",
            "author": "Crockford, Douglas",
            "publisher": "O'Reilly Media",
            "pub_year": 2023,
            "edition": "1st ed.",
            "physical_desc": "176 p. : ill. ; 21 cm.",
            "subjects": ["JavaScript", "Web Development", "Programming"],
            "summary": "Unearthing the Excellence in JavaScript",
            "language": "eng",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "leader": "00000nam  2200000   4500",
            "control_number": "MARC005",
            "control_number_id": "NTT20250005",
            "fixed_length_data": "250101s2024    vm a     |    000 0 vie d",
            "isbn": ["978-1-484-27207-6"],
            "title": "Python Machine Learning",
            "author": "Raschka, Sebastian; Mirjalili, Vahid",
            "publisher": "Packt Publishing",
            "pub_year": 2024,
            "edition": "3rd ed.",
            "physical_desc": "770 p. : ill. ; 24 cm.",
            "subjects": ["Python", "Machine Learning", "Data Science"],
            "summary": "Machine Learning and Deep Learning with Python, scikit-learn, and TensorFlow",
            "language": "eng",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    # Clear existing MARC records
    db.marc_records.delete_many({})
    
    # Insert MARC records
    result = db.marc_records.insert_many(marc_records)
    print(f"✅ Created {len(result.inserted_ids)} MARC records")
    return result.inserted_ids

def seed_items(db, marc_ids):
    """Seed sample items"""
    print("📦 Seeding items to Cloud MongoDB...")
    
    items = []
    for i, marc_id in enumerate(marc_ids, start=1):
        # Create 2 copies for each MARC record
        for copy in range(1, 3):
            items.append({
                "marc_id": marc_id,
                "barcode": f"BC{i:03d}{copy}",
                "call_number": f"IT.{i:03d}.{copy}",
                "location": "Kho chính" if copy == 1 else "Kho phụ",
                "status": ItemStatus.AVAILABLE.value if copy == 1 else ItemStatus.AVAILABLE.value,
                "price": 25.00 + (i * 5),
                "acquisition_date": datetime.now(timezone.utc) - timedelta(days=30*i),
                "notes": f"Bản sao {copy}",
                "created_at": datetime.now(timezone.utc)
            })
    
    # Clear existing items
    db.items.delete_many({})
    
    # Insert items
    result = db.items.insert_many(items)
    print(f"✅ Created {len(result.inserted_ids)} items")
    return result.inserted_ids

def seed_faq(db):
    """Seed FAQ data"""
    print("❓ Seeding FAQ to Cloud MongoDB...")
    
    faq_data = [
        {
            "question": "Làm thế nào để mượn sách?",
            "answer": "Bạn có thể mượn sách bằng cách: 1) Tìm kiếm sách trên hệ thống, 2) Kiểm tra tình trạng sách (Available), 3) Liên hệ thủ thư hoặc dùng hệ thống tự động để mượn.",
            "category": "borrowing",
            "status": FAQStatus.PUBLISHED.value,
            "order": 1,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "question": "Thời gian mượn sách là bao lâu?",
            "answer": "Thời gian mượn sách tiêu chuẩn là 14 ngày. Bạn có thể gia hạn thêm 14 ngày nếu không có người khác đặt trước.",
            "category": "borrowing",
            "status": FAQStatus.PUBLISHED.value,
            "order": 2,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "question": "Tôi bị phạt khi trả sách trễ không?",
            "answer": "Có, phí phạt trễ hạn là 5.000 VNĐ/ngày. Nếu quá 30 ngày, tài khoản sẽ bị tạm khóa cho đến khi trả sách và nộp phạt.",
            "category": "policies",
            "status": FAQStatus.PUBLISHED.value,
            "order": 3,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "question": "Làm thế nào để đặt trước sách đang được mượn?",
            "answer": "Bạn có thể đặt trước sách bằng cách nhấn nút 'Reserve' trên trang chi tiết sách. Hệ thống sẽ thông báo khi sách sẵn sàng.",
            "category": "borrowing",
            "status": FAQStatus.PUBLISHED.value,
            "order": 4,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "question": "Tôi có thể mượn bao nhiêu cuốn sách cùng lúc?",
            "answer": "Sinh viên được mượn tối đa 5 cuốn sách. Giảng viên và cán bộ được mượn tối đa 10 cuốn.",
            "category": "policies",
            "status": FAQStatus.PUBLISHED.value,
            "order": 5,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    # Clear existing FAQ
    db.faq.delete_many({})
    
    # Insert FAQ
    result = db.faq.insert_many(faq_data)
    print(f"✅ Created {len(result.inserted_ids)} FAQ entries")
    return result.inserted_ids

def seed_admin_configs(db):
    """Seed admin configurations"""
    print("⚙️ Seeding admin configs to Cloud MongoDB...")
    
    configs = [
        {
            "key": "loan_duration_days",
            "value": 14,
            "description": "Số ngày mượn sách tiêu chuẩn",
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "key": "max_loans_per_user",
            "value": 5,
            "description": "Số sách tối đa một user có thể mượn",
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "key": "overdue_fine_per_day",
            "value": 5000,
            "description": "Phí phạt trễ hạn (VNĐ/ngày)",
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    # Clear existing configs
    db.admin_configs.delete_many({})
    
    # Insert configs
    result = db.admin_configs.insert_many(configs)
    print(f"✅ Created {len(result.inserted_ids)} admin configs")
    return result.inserted_ids

def seed_documents(db):
    """Seed knowledge base documents"""
    print("📄 Seeding documents to Cloud MongoDB...")
    
    documents = [
        {
            "title": "Quy định mượn trả sách",
            "content": "Quy định chi tiết về việc mượn và trả sách tại thư viện...",
            "type": DocumentType.TXT.value,
            "source": DocumentSource.INTERNAL.value,
            "url": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "title": "Hướng dẫn sử dụng hệ thống",
            "content": "Hướng dẫn từng bước để sử dụng hệ thống thư viện...",
            "type": DocumentType.HTML.value,
            "source": DocumentSource.INTERNAL.value,
            "url": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    # Clear existing documents
    db.documents.delete_many({})
    
    # Insert documents
    result = db.documents.insert_many(documents)
    print(f"✅ Created {len(result.inserted_ids)} documents")
    return result.inserted_ids

def main():
    """Main seeding function"""
    print("🚀 Starting Cloud MongoDB seeding process...")
    print(f"📡 Connecting to: {MONGO_CLOUD_URI[:50]}...")
    
    try:
        # Connect to MongoDB Cloud
        db = get_cloud_db()
        
        # Test connection
        db.command('ping')
        print("✅ Connected to MongoDB Cloud successfully!\n")
        
        # Seed data
        user_ids = seed_users(db)
        marc_ids = seed_marc_records(db)
        item_ids = seed_items(db, marc_ids)
        faq_ids = seed_faq(db)
        config_ids = seed_admin_configs(db)
        doc_ids = seed_documents(db)
        
        print("\n" + "="*50)
        print("✅ Cloud MongoDB seeding completed successfully!")
        print("="*50)
        print(f"👥 Users: {len(user_ids)}")
        print(f"📚 MARC Records: {len(marc_ids)}")
        print(f"📦 Items: {len(item_ids)}")
        print(f"❓ FAQ: {len(faq_ids)}")
        print(f"⚙️ Admin Configs: {len(config_ids)}")
        print(f"📄 Documents: {len(doc_ids)}")
        print("\n🔐 Test Accounts (Password: Password123):")
        print("   - sv001@ntt.edu.vn (Reader)")
        print("   - sv002@ntt.edu.vn (Reader)")
        print("   - librarian@ntt.edu.vn (Librarian)")
        print("   - admin@ntt.edu.vn (Admin)")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

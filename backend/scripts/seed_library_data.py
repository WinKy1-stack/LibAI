"""
Script to seed MongoDB with library system data
Run: python scripts/seed_library_data.py
"""

import sys
import os
from datetime import datetime, timedelta, timezone
import hashlib
from werkzeug.security import generate_password_hash

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.utils.mongo_helper import MongoHelper
from app.models.mongodb_schemas import (
    UserRole, UserStatus, ItemStatus, LoanStatus,
    FAQStatus, DocumentType, DocumentSource,
    RecommendEvent, MetricKind, MARCRecordSource
)

def seed_users():
    """Seed sample users"""
    print("👥 Seeding users...")
    
    # Default password for all test users: "Password123"
    # Hashed using bcrypt
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
            "created_at": datetime.now(timezone.utc)
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
            "created_at": datetime.now(timezone.utc)
        },
        {
            "email": "librarian@ntt.edu.vn",
            "student_id": "LIB001",
            "name": "Phạm Thị C",
            "password_hash": default_password_hash,
            "role": UserRole.LIBRARIAN.value,
            "major": "Library Science",
            "status": UserStatus.ACTIVE.value,
            "preferences": {"lang": "vi", "theme": "light"},
            "created_at": datetime.now(timezone.utc)
        },
        {
            "email": "admin@ntt.edu.vn",
            "student_id": "ADM001",
            "name": "Lê Văn D",
            "password_hash": default_password_hash,
            "role": UserRole.ADMIN.value,
            "major": "IT",
            "status": UserStatus.ACTIVE.value,
            "preferences": {"lang": "vi", "theme": "dark"},
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    MongoHelper.delete_many('users', {})
    user_ids = MongoHelper.insert_many('users', users)
    print(f"  ✅ Created {len(user_ids)} users")
    print(f"  🔑 Default password for all users: Password123")
    return user_ids

def seed_marc_records():
    """Seed sample MARC records (MARC21 Book Record format)"""
    print("\n📚 Seeding MARC records...")

    import uuid
    from datetime import datetime, timezone
    from app.models.mongodb_schemas import MARCRecordSource
    
    now = datetime.now(timezone.utc).isoformat()
    
    records = [
        {
            "record_id": str(uuid.uuid4()),
            "leader": "01359nam a2200301 a 4500",
            "control_number": "MARC001",
            "agency_code": "NTT",
            "updated_at": now,
            "created_at": now,
            "source": MARCRecordSource.LOCAL.value,
            "rights": {
                "access": "",
                "format": []
            },
            "fixed_fields": {
                "date_entered": "240101",
                "type_of_record": "a",
                "language": "vie",
                "publication_year": "2022"
            },
            "identifiers": {
                "isbn": ["978-6040000001"],
                "other": []
            },
            "title": {
                "main": "Nhập môn Cơ sở dữ liệu",
                "subtitle": "Lý thuyết & thực hành"
            },
            "contributors": [
                {"role": "author", "name": "Nguyễn Văn X"}
            ],
            "edition": "",
            "publication": {
                "publisher": "NXB Giáo Dục",
                "place": "Hà Nội",
                "year": "2022"
            },
            "physical_description": {
                "extent": "350 trang",
                "size": "24 cm",
                "illustration": "minh họa"
            },
            "notes": [
                "Sách giáo trình đại học"
            ],
            "subjects": [
                "Cơ sở dữ liệu",
                "SQL"
            ],
            "classification": {
                "ddc": "005.75",
                "lcc": ""
            },
            "holdings": [
                {
                    "location": "Main Library",
                    "call_number": "001.1/NH",
                    "copies": 5,
                    "available": 3
                }
            ],
            "access": {
                "online_url": "",
                "restrictions": ""
            },
            "format": ["book"],
            "image_url": ""
        },
        {
            "record_id": str(uuid.uuid4()),
            "leader": "01359nam a2200301 a 4500",
            "control_number": "MARC002",
            "agency_code": "NTT",
            "updated_at": now,
            "created_at": now,
            "source": MARCRecordSource.LOCAL.value,
            "rights": {
                "access": "",
                "format": []
            },
            "fixed_fields": {
                "date_entered": "240101",
                "type_of_record": "a",
                "language": "vie",
                "publication_year": "2023"
            },
            "identifiers": {
                "isbn": ["978-6040000002"],
                "other": []
            },
            "title": {
                "main": "Machine Learning cơ bản",
                "subtitle": "Python & Scikit-learn"
            },
            "contributors": [
                {"role": "author", "name": "Vũ Hữu Tiệp"}
            ],
            "edition": "1",
            "publication": {
                "publisher": "NXB Trẻ",
                "place": "TP.HCM",
                "year": "2023"
            },
            "physical_description": {
                "extent": "420 trang",
                "size": "25 cm",
                "illustration": "minh họa, bảng biểu"
            },
            "notes": [
                "Sách tham khảo cho sinh viên ngành Khoa học Máy tính"
            ],
            "subjects": [
                "Machine Learning",
                "Python",
                "AI"
            ],
            "classification": {
                "ddc": "006.31",
                "lcc": ""
            },
            "holdings": [
                {
                    "location": "Science Library",
                    "call_number": "002.1/ML",
                    "copies": 3,
                    "available": 2
                }
            ],
            "access": {
                "online_url": "",
                "restrictions": ""
            },
            "format": ["book"],
            "image_url": ""
        },
        {
            "record_id": str(uuid.uuid4()),
            "leader": "01359nam a2200301 a 4500",
            "control_number": "MARC003",
            "agency_code": "NTT",
            "updated_at": now,
            "created_at": now,
            "source": MARCRecordSource.LOCAL.value,
            "rights": {
                "access": "",
                "format": []
            },
            "fixed_fields": {
                "date_entered": "240101",
                "type_of_record": "a",
                "language": "vie",
                "publication_year": "2024"
            },
            "identifiers": {
                "isbn": ["978-6040000003"],
                "other": []
            },
            "title": {
                "main": "Lập trình Web hiện đại",
                "subtitle": "React & Node.js"
            },
            "contributors": [
                {"role": "author", "name": "Trần Minh Y"}
            ],
            "edition": "2",
            "publication": {
                "publisher": "NXB Bách Khoa",
                "place": "Hà Nội",
                "year": "2024"
            },
            "physical_description": {
                "extent": "580 trang",
                "size": "26 cm",
                "illustration": "minh họa"
            },
            "notes": [
                "Sách hướng dẫn lập trình web fullstack"
            ],
            "subjects": [
                "Web Development",
                "React",
                "JavaScript"
            ],
            "classification": {
                "ddc": "005.276",
                "lcc": ""
            },
            "holdings": [
                {
                    "location": "IT Library",
                    "call_number": "003.1/WEB",
                    "copies": 4,
                    "available": 4
                }
            ],
            "access": {
                "online_url": "",
                "restrictions": ""
            },
            "format": ["book"],
            "image_url": ""
        },
        {
            "record_id": str(uuid.uuid4()),
            "leader": "01359nam a2200301 a 4500",
            "control_number": "MARC004",
            "agency_code": "NTT",
            "updated_at": now,
            "created_at": now,
            "source": MARCRecordSource.LOCAL.value,
            "rights": {
                "access": "",
                "format": []
            },
            "fixed_fields": {
                "date_entered": "240101",
                "type_of_record": "a",
                "language": "vie",
                "publication_year": "2023"
            },
            "identifiers": {
                "isbn": ["978-6040000004"],
                "other": []
            },
            "title": {
                "main": "Deep Learning từ cơ bản đến nâng cao",
                "subtitle": None
            },
            "contributors": [
                {"role": "author", "name": "Lê Hoàng Z"}
            ],
            "edition": "1",
            "publication": {
                "publisher": "NXB Đại Học Quốc Gia",
                "place": "Hà Nội",
                "year": "2023"
            },
            "physical_description": {
                "extent": "650 trang",
                "size": "27 cm",
                "illustration": "minh họa, sơ đồ"
            },
            "notes": [
                "Sách chuyên sâu về Deep Learning và Neural Networks"
            ],
            "subjects": [
                "Deep Learning",
                "Neural Networks",
                "AI"
            ],
            "classification": {
                "ddc": "006.32",
                "lcc": ""
            },
            "holdings": [
                {
                    "location": "Science Library",
                    "call_number": "004.1/DL",
                    "copies": 2,
                    "available": 1
                }
            ],
            "access": {
                "online_url": "",
                "restrictions": ""
            },
            "format": ["book"],
            "image_url": ""
        },
        {
            "record_id": str(uuid.uuid4()),
            "leader": "01359nam a2200301 a 4500",
            "control_number": "MARC005",
            "agency_code": "NTT",
            "updated_at": now,
            "created_at": now,
            "source": MARCRecordSource.LOCAL.value,
            "rights": {
                "access": "",
                "format": []
            },
            "fixed_fields": {
                "date_entered": "240101",
                "type_of_record": "a",
                "language": "vie",
                "publication_year": "2022"
            },
            "identifiers": {
                "isbn": ["978-6040000005"],
                "other": []
            },
            "title": {
                "main": "Cấu trúc dữ liệu và Giải thuật",
                "subtitle": "C++ Implementation"
            },
            "contributors": [
                {"role": "author", "name": "Phạm Thị K"}
            ],
            "edition": "3",
            "publication": {
                "publisher": "NXB Thống Kê",
                "place": "TP.HCM",
                "year": "2022"
            },
            "physical_description": {
                "extent": "520 trang",
                "size": "24 cm",
                "illustration": "minh họa"
            },
            "notes": [
                "Sách giáo trình về cấu trúc dữ liệu và giải thuật"
            ],
            "subjects": [
                "Data Structures",
                "Algorithms",
                "C++"
            ],
            "classification": {
                "ddc": "005.133",
                "lcc": ""
            },
            "holdings": [
                {
                    "location": "IT Library",
                    "call_number": "005.1/DSA",
                    "copies": 6,
                    "available": 5
                }
            ],
            "access": {
                "online_url": "",
                "restrictions": ""
            },
            "format": ["book"],
            "image_url": ""
        }
    ]
    
    # Enrich with Google Books API if available
    from app.services.z3950.z3950_service import Z3950Service
    for record in records:
        try:
            record = Z3950Service._enrich_with_google_books(record)
        except Exception as e:
            # Continue without Google Books data if there's an error
            pass
    
    MongoHelper.delete_many('marc_21', {})
    record_ids = MongoHelper.insert_many('marc_21', records)
    print(f"  ✅ Created {len(record_ids)} MARC records")
    return record_ids

def seed_items(record_ids):
    """Seed sample items (physical books)"""
    print("\n📖 Seeding items...")
    
    items = []
    branches = ["Main Library", "Science Library", "IT Library"]
    
    for i, record_id in enumerate(record_ids):
        # Create 2-3 copies per record
        for copy in range(1, 3):
            items.append({
                "record_id": record_id,
                "barcode": f"BRC{str(i+1).zfill(3)}{str(copy).zfill(2)}",
                "status": ItemStatus.AVAILABLE.value if copy == 1 else ItemStatus.ON_LOAN.value,
                "location": {
                    "branch": branches[i % 3],
                    "shelf": f"A{i+1}-{copy}"
                },
                "call_number": f"00{i+1}.{copy}/NH",
                "updated_at": datetime.now(timezone.utc)
            })
    
    MongoHelper.delete_many('items', {})
    item_ids = MongoHelper.insert_many('items', items)
    print(f"  ✅ Created {len(item_ids)} items")
    return item_ids

def seed_loans(user_ids, item_ids):
    """Seed sample loans"""
    print("\n📋 Seeding loans...")
    
    loans = []
    now = datetime.now(timezone.utc)
    
    # Create 3 ongoing loans
    for i in range(3):
        loans.append({
            "user_id": user_ids[0],  # SV001
            "item_id": item_ids[i],
            "loan_date": now - timedelta(days=7),
            "due_date": now + timedelta(days=7),
            "return_date": None,
            "status": LoanStatus.ONGOING.value,
            "sip2": {
                "last_txn_id": f"SIP2-{str(i+1).zfill(4)}",
                "code": "00"
            }
        })
    
    # Create 1 overdue loan
    loans.append({
        "user_id": user_ids[1],  # SV002
        "item_id": item_ids[3],
        "loan_date": now - timedelta(days=20),
        "due_date": now - timedelta(days=6),
        "return_date": None,
        "status": LoanStatus.OVERDUE.value,
        "sip2": {
            "last_txn_id": "SIP2-0004",
            "code": "00"
        }
    })
    
    # Create 2 returned loans
    for i in range(2):
        loans.append({
            "user_id": user_ids[0],
            "item_id": item_ids[i + 4],
            "loan_date": now - timedelta(days=30),
            "due_date": now - timedelta(days=16),
            "return_date": now - timedelta(days=20),
            "status": LoanStatus.RETURNED.value,
            "sip2": {
                "last_txn_id": f"SIP2-{str(i+5).zfill(4)}",
                "code": "00"
            }
        })
    
    MongoHelper.delete_many('loans', {})
    loan_ids = MongoHelper.insert_many('loans', loans)
    print(f"  ✅ Created {len(loan_ids)} loans")
    return loan_ids

def seed_faq():
    """Seed FAQ data"""
    print("\n❓ Seeding FAQ...")
    
    faqs = [
        {
            "category": "hours",
            "question": "Thư viện mở cửa lúc mấy giờ?",
            "answer": "Thư viện mở cửa Thứ 2 - Thứ 6: 8:00 - 17:00. Thứ 7: 8:00 - 12:00. Chủ nhật nghỉ.",
            "tags": ["giờ", "mở cửa", "thời gian"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "rules",
            "question": "Mượn sách tối đa bao nhiêu cuốn?",
            "answer": "Sinh viên được mượn tối đa 5 cuốn/lần. Thời hạn mượn: 14 ngày. Có thể gia hạn 1 lần.",
            "tags": ["mượn sách", "quy định", "số lượng"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "howto",
            "question": "Làm thế nào để tìm sách?",
            "answer": "Bạn có thể: 1) Tìm kiếm trên website, 2) Hỏi chatbox AI, 3) Liên hệ thủ thư.",
            "tags": ["tìm kiếm", "hướng dẫn", "tra cứu"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "rules",
            "question": "Phạt trả sách muộn bao nhiêu?",
            "answer": "Phạt 5.000đ/ngày/cuốn. Trả muộn quá 30 ngày sẽ bị khóa tài khoản.",
            "tags": ["phạt", "trễ hạn", "quy định"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "howto",
            "question": "Cách đăng ký thẻ thư viện?",
            "answer": "Sinh viên mới đăng ký tại quầy với: CMND/CCCD + Thẻ sinh viên + 1 ảnh 3x4.",
            "tags": ["đăng ký", "thẻ", "hướng dẫn"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    MongoHelper.delete_many('faq', {})
    faq_ids = MongoHelper.insert_many('faq', faqs)
    print(f"  ✅ Created {len(faq_ids)} FAQ entries")
    return faq_ids

def seed_documents():
    """Seed documents for chatbox"""
    print("\n📄 Seeding documents...")
    
    docs = [
        {
            "title": "Nội quy thư viện 2025",
            "type": DocumentType.PDF.value,
            "source": DocumentSource.INTERNAL.value,
            "lang": "vi",
            "chunks": [
                {"seq": 0, "text": "Điều 1: Sinh viên phải xuất trình thẻ khi vào thư viện."},
                {"seq": 1, "text": "Điều 2: Không mang đồ ăn, thức uống vào phòng đọc."},
                {"seq": 2, "text": "Điều 3: Giữ im lặng, không làm ồn trong thư viện."}
            ],
            "file_ref": "gridfs://docs/noiquy2025.pdf",
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "title": "Hướng dẫn tra cứu MARC21",
            "type": DocumentType.HTML.value,
            "source": DocumentSource.INTERNAL.value,
            "lang": "vi",
            "chunks": [
                {"seq": 0, "text": "MARC21 là chuẩn mô tả thư mục quốc tế."},
                {"seq": 1, "text": "Field 245 chứa thông tin tên sách, field 100 là tác giả chính."},
                {"seq": 2, "text": "Field 650 chứa chủ đề, field 020 chứa ISBN."}
            ],
            "file_ref": "gridfs://docs/marc21_guide.html",
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    MongoHelper.delete_many('documents', {})
    doc_ids = MongoHelper.insert_many('documents', docs)
    print(f"  ✅ Created {len(doc_ids)} documents")
    return doc_ids

def seed_admin_configs():
    """Seed admin configurations"""
    print("\n⚙️  Seeding admin configs...")
    
    configs = [
        {
            "key": "ai.router",
            "value": {
                "search_threshold": 0.7,
                "model_pref": ["gpt-4o", "gemini-1.5"],
                "max_tokens": 4000
            },
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        },
        {
            "key": "system.limits",
            "value": {
                "max_loan_items": 5,
                "loan_days": 14,
                "max_renewals": 1,
                "overdue_fine_per_day": 5000
            },
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        },
        {
            "key": "chatbox.settings",
            "value": {
                "lang": "vi",
                "temperature": 0.7,
                "enable_citations": True,
                "max_chat_history": 10
            },
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        }
    ]
    
    MongoHelper.delete_many('admin_configs', {})
    config_ids = MongoHelper.insert_many('admin_configs', configs)
    print(f"  ✅ Created {len(config_ids)} admin configs")
    return config_ids

def seed_conversations(user_ids):
    """Seed sample conversations"""
    print("\n💬 Seeding conversations...")
    
    conversations = [
        {
            "user_id": user_ids[0],
            "started_at": datetime.now(timezone.utc) - timedelta(hours=2),
            "ended_at": datetime.now(timezone.utc) - timedelta(hours=1, minutes=50),
            "meta": {
                "channel": "web",
                "model": "gpt-4o",
                "lang": "vi"
            }
        },
        {
            "user_id": user_ids[1],
            "started_at": datetime.now(timezone.utc) - timedelta(minutes=30),
            "ended_at": None,
            "meta": {
                "channel": "web",
                "model": "gpt-4o",
                "lang": "vi"
            }
        }
    ]
    
    MongoHelper.delete_many('conversations', {})
    conv_ids = MongoHelper.insert_many('conversations', conversations)
    print(f"  ✅ Created {len(conv_ids)} conversations")
    return conv_ids

def seed_messages(conv_ids, record_ids):
    """Seed sample messages"""
    print("\n💭 Seeding messages...")
    
    messages = [
        # Conversation 1
        {
            "conversation_id": conv_ids[0],
            "role": "user",
            "content": "Tìm sách về Machine Learning",
            "citations": [],
            "latency_ms": 120,
            "ts": datetime.now(timezone.utc) - timedelta(hours=2)
        },
        {
            "conversation_id": conv_ids[0],
            "role": "assistant",
            "content": "Tôi tìm thấy cuốn 'Machine Learning cơ bản' của Vũ Hữu Tiệp (2023).",
            "citations": [
                {"type": "marc", "record_id": str(record_ids[1])}
            ],
            "latency_ms": 850,
            "ts": datetime.now(timezone.utc) - timedelta(hours=1, minutes=59)
        },
        # Conversation 2
        {
            "conversation_id": conv_ids[1],
            "role": "user",
            "content": "Giờ mở cửa thư viện là mấy giờ?",
            "citations": [],
            "latency_ms": 95,
            "ts": datetime.now(timezone.utc) - timedelta(minutes=30)
        },
        {
            "conversation_id": conv_ids[1],
            "role": "assistant",
            "content": "Thư viện mở cửa Thứ 2 - Thứ 6: 8:00 - 17:00. Thứ 7: 8:00 - 12:00.",
            "citations": [
                {"type": "faq", "category": "hours"}
            ],
            "latency_ms": 420,
            "ts": datetime.now(timezone.utc) - timedelta(minutes=29, seconds=55)
        }
    ]
    
    MongoHelper.delete_many('messages', {})
    msg_ids = MongoHelper.insert_many('messages', messages)
    print(f"  ✅ Created {len(msg_ids)} messages")
    return msg_ids

def seed_metrics():
    """Seed sample metrics"""
    print("\n📊 Seeding metrics...")
    
    metrics = []
    now = datetime.now(timezone.utc)
    
    # LLM cost metrics
    for i in range(10):
        metrics.append({
            "kind": MetricKind.LLM_COST.value,
            "labels": {"model": "gpt-4o", "route": "/chat"},
            "value": 0.01 + (i * 0.005),
            "unit": "usd",
            "ts": now - timedelta(minutes=i*10),
            "window": "minute"
        })
    
    # Latency metrics
    for i in range(10):
        metrics.append({
            "kind": MetricKind.LATENCY.value,
            "labels": {"route": "/api/search"},
            "value": 150 + (i * 50),
            "unit": "ms",
            "ts": now - timedelta(minutes=i*5),
            "window": "minute"
        })
    
    MongoHelper.delete_many('metrics', {})
    metric_ids = MongoHelper.insert_many('metrics', metrics)
    print(f"  ✅ Created {len(metric_ids)} metrics")
    return metric_ids

def print_statistics():
    """Print database statistics"""
    print("\n" + "=" * 70)
    print("📊 Database Statistics")
    print("=" * 70)
    
    collections = {
        'users': '👥 Users',
        'marc_21': '📚 MARC Records',
        'items': '📖 Items',
        'loans': '📋 Loans',
        'conversations': '💬 Conversations',
        'messages': '💭 Messages',
        'faq': '❓ FAQ',
        'documents': '📄 Documents',
        'admin_configs': '⚙️  Admin Configs',
        'metrics': '📊 Metrics'
    }
    
    for collection_name, label in collections.items():
        count = MongoHelper.count_documents(collection_name, {})
        print(f"{label}: {count}")

def main():
    """Main seeding function"""
    print("=" * 70)
    print("🌱 MongoDB Library System Seeding")
    print("=" * 70)
    
    app = create_app()
    
    with app.app_context():
        try:
            # Test connection
            print("\n🔌 Testing MongoDB connection...")
            from app import mongo
            mongo.cx.admin.command('ping')
            print("  ✅ MongoDB connected successfully\n")
            
            # Seed all collections
            user_ids = seed_users()
            record_ids = seed_marc_records()
            item_ids = seed_items(record_ids)
            loan_ids = seed_loans(user_ids, item_ids)
            faq_ids = seed_faq()
            doc_ids = seed_documents()
            config_ids = seed_admin_configs()
            conv_ids = seed_conversations(user_ids)
            msg_ids = seed_messages(conv_ids, record_ids)
            metric_ids = seed_metrics()
            
            # Print statistics
            print_statistics()
            
            print("\n" + "=" * 70)
            print("✅ Seeding completed successfully!")
            print("=" * 70)
            print("\n💡 Next steps:")
            print("  1. Test API endpoints")
            print("  2. Test MongoDB connection: http://localhost:5000/mongodb-test")
            print("  3. View in MongoDB Compass: mongodb://localhost:27017/library_chatbox")
            print(f"  🔑 Default password for all users: Password123")
            print("\n📝 Sample Users:")
            print("  - sv001@ntt.edu.vn (Reader)")
            print("  - librarian@ntt.edu.vn (Librarian)")
            print("  - admin@ntt.edu.vn (Admin)")
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == '__main__':
    main()

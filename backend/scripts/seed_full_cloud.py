"""
Script to seed FULL MongoDB Cloud with ALL 15 collections
This includes: users, marc_records, items, loans, conversations, messages,
faq, documents, recommend_events, metrics, admin_configs, z3950_cache,
oai_records, sip2_events, auth_sessions

Run: python scripts/seed_full_cloud.py
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from pymongo import MongoClient
import hashlib

# MongoDB Cloud Atlas Connection
MONGO_CLOUD_URI = "mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "library_chatbox"

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.mongodb_schemas import (
    UserRole, UserStatus, ItemStatus, LoanStatus,
    FAQStatus, DocumentType, DocumentSource,
    RecommendEvent, MetricKind, MARCRecordSource,
    MessageRole, SIP2EventType
)

def get_cloud_db():
    """Connect to MongoDB Cloud"""
    client = MongoClient(MONGO_CLOUD_URI)
    return client[DB_NAME]

def seed_users(db):
    """Seed sample users"""
    print("👥 Seeding users...")
    
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
            "last_login": datetime.now(timezone.utc) - timedelta(days=1)
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
            "last_login": datetime.now(timezone.utc)
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
            "last_login": datetime.now(timezone.utc)
        }
    ]
    
    db.users.delete_many({})
    result = db.users.insert_many(users)
    print(f"  ✅ Created {len(result.inserted_ids)} users")
    return result.inserted_ids

def seed_marc_records(db):
    """Seed MARC records with full MARC21 structure"""
    print("📚 Seeding MARC records...")
    
    marc_records = [
        {
            "control_number": "MARC001",
            "control_number_id": "NTT20250001",
            "leader": "01359nam a2200301 a 4500",
            "fields": {
                "245": {"a": "Introduction to Algorithms", "b": "Third Edition"},
                "100": {"a": "Cormen, Thomas H."},
                "260": {"a": "Cambridge", "b": "MIT Press", "c": "2024"},
                "650": [
                    {"a": "Algorithms"},
                    {"a": "Computer Science"},
                    {"a": "Data Structures"}
                ]
            },
            "normalized": {
                "isbn": ["978-0-13-468599-1"],
                "title": "Introduction to Algorithms",
                "authors": ["Cormen, Thomas H."],
                "publisher": "MIT Press",
                "year": 2024,
                "subjects": ["Algorithms", "Computer Science", "Data Structures"]
            },
            "raw_mrc_ref": "gridfs://mrc/MARC001.mrc",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "control_number": "MARC002",
            "control_number_id": "NTT20250002",
            "leader": "01245nam a2200289 a 4500",
            "fields": {
                "245": {"a": "Artificial Intelligence", "b": "A Modern Approach"},
                "100": {"a": "Russell, Stuart J."},
                "700": {"a": "Norvig, Peter"},
                "260": {"a": "Upper Saddle River", "b": "Pearson", "c": "2023"},
                "650": [
                    {"a": "Artificial Intelligence"},
                    {"a": "Machine Learning"}
                ]
            },
            "normalized": {
                "isbn": ["978-0-13-595705-9"],
                "title": "Artificial Intelligence: A Modern Approach",
                "authors": ["Russell, Stuart J.", "Norvig, Peter"],
                "publisher": "Pearson",
                "year": 2023,
                "subjects": ["Artificial Intelligence", "Machine Learning"]
            },
            "raw_mrc_ref": "gridfs://mrc/MARC002.mrc",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "control_number": "MARC003",
            "control_number_id": "NTT20250003",
            "leader": "01180nam a2200277 a 4500",
            "fields": {
                "245": {"a": "Designing Data-Intensive Applications"},
                "100": {"a": "Kleppmann, Martin"},
                "260": {"a": "Sebastopol", "b": "O'Reilly Media", "c": "2024"},
                "650": [
                    {"a": "Database Systems"},
                    {"a": "Distributed Systems"}
                ]
            },
            "normalized": {
                "isbn": ["978-1-492-05206-7"],
                "title": "Designing Data-Intensive Applications",
                "authors": ["Kleppmann, Martin"],
                "publisher": "O'Reilly Media",
                "year": 2024,
                "subjects": ["Database Systems", "Distributed Systems", "Big Data"]
            },
            "raw_mrc_ref": "gridfs://mrc/MARC003.mrc",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "control_number": "MARC004",
            "control_number_id": "NTT20250004",
            "leader": "00950nam a2200241 a 4500",
            "fields": {
                "245": {"a": "JavaScript: The Good Parts"},
                "100": {"a": "Crockford, Douglas"},
                "260": {"a": "Sebastopol", "b": "O'Reilly Media", "c": "2023"},
                "650": [
                    {"a": "JavaScript"},
                    {"a": "Web Development"}
                ]
            },
            "normalized": {
                "isbn": ["978-0-596-52068-7"],
                "title": "JavaScript: The Good Parts",
                "authors": ["Crockford, Douglas"],
                "publisher": "O'Reilly Media",
                "year": 2023,
                "subjects": ["JavaScript", "Web Development", "Programming"]
            },
            "raw_mrc_ref": "gridfs://mrc/MARC004.mrc",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "control_number": "MARC005",
            "control_number_id": "NTT20250005",
            "leader": "01210nam a2200265 a 4500",
            "fields": {
                "245": {"a": "Python Machine Learning", "b": "Third Edition"},
                "100": {"a": "Raschka, Sebastian"},
                "700": {"a": "Mirjalili, Vahid"},
                "260": {"a": "Birmingham", "b": "Packt Publishing", "c": "2024"},
                "650": [
                    {"a": "Python"},
                    {"a": "Machine Learning"}
                ]
            },
            "normalized": {
                "isbn": ["978-1-484-27207-6"],
                "title": "Python Machine Learning",
                "authors": ["Raschka, Sebastian", "Mirjalili, Vahid"],
                "publisher": "Packt Publishing",
                "year": 2024,
                "subjects": ["Python", "Machine Learning", "Data Science"]
            },
            "raw_mrc_ref": "gridfs://mrc/MARC005.mrc",
            "source": MARCRecordSource.LOCAL.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    db.marc_records.delete_many({})
    result = db.marc_records.insert_many(marc_records)
    print(f"  ✅ Created {len(result.inserted_ids)} MARC records")
    return result.inserted_ids

def seed_items(db, marc_ids):
    """Seed physical items"""
    print("📦 Seeding items...")
    
    items = []
    for i, marc_id in enumerate(marc_ids, start=1):
        for copy in range(1, 3):  # 2 copies each
            items.append({
                "record_id": marc_id,
                "barcode": f"BRC{i:03d}{copy}",
                "status": ItemStatus.AVAILABLE.value if copy == 1 else ItemStatus.AVAILABLE.value,
                "location": {
                    "branch": "Main" if copy == 1 else "Branch A",
                    "shelf": f"A3-{i:02d}"
                },
                "call_number": f"IT.{i:03d}.{copy}",
                "updated_at": datetime.now(timezone.utc)
            })
    
    db.items.delete_many({})
    result = db.items.insert_many(items)
    print(f"  ✅ Created {len(result.inserted_ids)} items")
    return result.inserted_ids

def seed_loans(db, user_ids, item_ids):
    """Seed loan records"""
    print("📝 Seeding loans...")
    
    loans = [
        {
            "user_id": user_ids[1],  # SV002
            "item_id": item_ids[0],  # First item
            "loan_date": datetime.now(timezone.utc) - timedelta(days=5),
            "due_date": datetime.now(timezone.utc) + timedelta(days=9),
            "return_date": None,
            "status": LoanStatus.ONGOING.value,
            "sip2": {
                "last_txn_id": "SIP2-TX-001",
                "code": "00"
            }
        },
        {
            "user_id": user_ids[1],  # SV002
            "item_id": item_ids[2],  # Third item
            "loan_date": datetime.now(timezone.utc) - timedelta(days=20),
            "due_date": datetime.now(timezone.utc) - timedelta(days=6),
            "return_date": None,
            "status": LoanStatus.OVERDUE.value,
            "sip2": {
                "last_txn_id": "SIP2-TX-002",
                "code": "00"
            }
        }
    ]
    
    db.loans.delete_many({})
    result = db.loans.insert_many(loans)
    print(f"  ✅ Created {len(result.inserted_ids)} loans")
    return result.inserted_ids

def seed_conversations(db, user_ids):
    """Seed chat conversations"""
    print("💬 Seeding conversations...")
    
    conversations = [
        {
            "user_id": user_ids[1],  # SV002
            "started_at": datetime.now(timezone.utc) - timedelta(hours=2),
            "ended_at": None,
            "meta": {
                "channel": "web",
                "model": "gpt-4o",
                "lang": "vi"
            }
        }
    ]
    
    db.conversations.delete_many({})
    result = db.conversations.insert_many(conversations)
    print(f"  ✅ Created {len(result.inserted_ids)} conversations")
    return result.inserted_ids

def seed_messages(db, conversation_ids, marc_ids):
    """Seed chat messages"""
    print("✉️ Seeding messages...")
    
    messages = [
        {
            "conversation_id": conversation_ids[0],
            "role": MessageRole.USER.value,
            "content": "Tìm sách về Machine Learning",
            "citations": [],
            "latency_ms": 0,
            "ts": datetime.now(timezone.utc) - timedelta(hours=2)
        },
        {
            "conversation_id": conversation_ids[0],
            "role": MessageRole.ASSISTANT.value,
            "content": "Tôi tìm thấy một số sách về Machine Learning trong thư viện...",
            "citations": [
                {"type": "marc", "record_id": str(marc_ids[1])},
                {"type": "marc", "record_id": str(marc_ids[4])}
            ],
            "latency_ms": 820,
            "ts": datetime.now(timezone.utc) - timedelta(hours=2) + timedelta(seconds=1)
        }
    ]
    
    db.messages.delete_many({})
    result = db.messages.insert_many(messages)
    print(f"  ✅ Created {len(result.inserted_ids)} messages")
    return result.inserted_ids

def seed_faq(db):
    """Seed FAQ"""
    print("❓ Seeding FAQ...")
    
    faq_data = [
        {
            "category": "rules",
            "question": "Giờ mở cửa thư viện?",
            "answer": "Thư viện mở cửa từ Thứ 2 đến Thứ 6: 8:00-17:00. Thứ 7: 8:00-12:00. Nghỉ Chủ nhật.",
            "tags": ["giờ", "mở cửa", "thời gian"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "borrowing",
            "question": "Làm thế nào để mượn sách?",
            "answer": "Bạn tìm sách trên hệ thống, kiểm tra tình trạng Available, sau đó đến quầy thủ thư hoặc dùng hệ thống tự động để mượn.",
            "tags": ["mượn", "sách"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "borrowing",
            "question": "Thời gian mượn sách là bao lâu?",
            "answer": "14 ngày cho sách thông thường. Có thể gia hạn thêm 14 ngày nếu không có người đặt trước.",
            "tags": ["thời gian", "mượn"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "policies",
            "question": "Phí phạt trễ hạn là bao nhiêu?",
            "answer": "5.000 VNĐ/ngày. Quá 30 ngày sẽ bị khóa tài khoản cho đến khi trả sách và nộp phạt.",
            "tags": ["phạt", "trễ hạn"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "category": "policies",
            "question": "Mượn tối đa bao nhiêu cuốn?",
            "answer": "Sinh viên: 5 cuốn. Giảng viên và cán bộ: 10 cuốn.",
            "tags": ["giới hạn", "mượn"],
            "status": FAQStatus.PUBLISHED.value,
            "updated_by": None,
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    db.faq.delete_many({})
    result = db.faq.insert_many(faq_data)
    print(f"  ✅ Created {len(result.inserted_ids)} FAQ entries")
    return result.inserted_ids

def seed_documents(db):
    """Seed knowledge base documents"""
    print("📄 Seeding documents...")
    
    documents = [
        {
            "title": "Quy định mượn trả sách",
            "type": DocumentType.TXT.value,
            "source": DocumentSource.INTERNAL.value,
            "lang": "vi",
            "chunks": [
                {"seq": 0, "text": "Điều 1: Sinh viên được mượn tối đa 5 cuốn sách cùng lúc."},
                {"seq": 1, "text": "Điều 2: Thời gian mượn là 14 ngày, có thể gia hạn 1 lần."},
                {"seq": 2, "text": "Điều 3: Phí phạt trễ hạn là 5.000đ/ngày."}
            ],
            "file_ref": "gridfs://docs/quydinh.txt",
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "title": "Hướng dẫn sử dụng hệ thống",
            "type": DocumentType.HTML.value,
            "source": DocumentSource.INTERNAL.value,
            "lang": "vi",
            "chunks": [
                {"seq": 0, "text": "Bước 1: Đăng nhập bằng email trường"},
                {"seq": 1, "text": "Bước 2: Tìm kiếm sách qua thanh tìm kiếm"},
                {"seq": 2, "text": "Bước 3: Đặt trước hoặc mượn sách"}
            ],
            "file_ref": "gridfs://docs/huongdan.html",
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    db.documents.delete_many({})
    result = db.documents.insert_many(documents)
    print(f"  ✅ Created {len(result.inserted_ids)} documents")
    return result.inserted_ids

def seed_recommend_events(db, user_ids, marc_ids):
    """Seed recommendation events"""
    print("🎯 Seeding recommend events...")
    
    events = [
        {
            "user_id": user_ids[1],  # SV002
            "record_id": marc_ids[1],  # AI book
            "event": RecommendEvent.VIEW.value,
            "score": 1.0,
            "context": {"query": "artificial intelligence", "major": "AI"},
            "ts": datetime.now(timezone.utc) - timedelta(days=2)
        },
        {
            "user_id": user_ids[1],
            "record_id": marc_ids[4],  # Python ML
            "event": RecommendEvent.VIEW.value,
            "score": 1.0,
            "context": {"query": "machine learning", "major": "AI"},
            "ts": datetime.now(timezone.utc) - timedelta(days=1)
        },
        {
            "user_id": user_ids[1],
            "record_id": marc_ids[0],  # Algorithms
            "event": RecommendEvent.BORROW.value,
            "score": 2.0,
            "context": {"major": "AI"},
            "ts": datetime.now(timezone.utc) - timedelta(days=5)
        }
    ]
    
    db.recommend_events.delete_many({})
    result = db.recommend_events.insert_many(events)
    print(f"  ✅ Created {len(result.inserted_ids)} recommend events")
    return result.inserted_ids

def seed_metrics(db):
    """Seed system metrics"""
    print("📊 Seeding metrics...")
    
    metrics = [
        {
            "kind": MetricKind.LLM_COST.value,
            "labels": {"model": "gpt-4o", "route": "/chat"},
            "value": 0.0123,
            "unit": "usd",
            "ts": datetime.now(timezone.utc),
            "window": "minute"
        },
        {
            "kind": MetricKind.LATENCY.value,
            "labels": {"route": "/api/search"},
            "value": 245,
            "unit": "ms",
            "ts": datetime.now(timezone.utc),
            "window": "minute"
        },
        {
            "kind": MetricKind.TRAFFIC.value,
            "labels": {"route": "/api/auth/login"},
            "value": 15,
            "unit": "count",
            "ts": datetime.now(timezone.utc),
            "window": "hour"
        }
    ]
    
    db.metrics.delete_many({})
    result = db.metrics.insert_many(metrics)
    print(f"  ✅ Created {len(result.inserted_ids)} metrics")
    return result.inserted_ids

def seed_admin_configs(db):
    """Seed admin configurations"""
    print("⚙️ Seeding admin configs...")
    
    configs = [
        {
            "key": "ai.router",
            "value": {
                "search_threshold": 0.7,
                "model_pref": ["gpt-4o", "gemini-1.5"]
            },
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        },
        {
            "key": "loan.duration_days",
            "value": 14,
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        },
        {
            "key": "loan.max_books_per_user",
            "value": 5,
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        },
        {
            "key": "loan.overdue_fine_per_day",
            "value": 5000,
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None
        }
    ]
    
    db.admin_configs.delete_many({})
    result = db.admin_configs.insert_many(configs)
    print(f"  ✅ Created {len(result.inserted_ids)} admin configs")
    return result.inserted_ids

def seed_z3950_cache(db):
    """Seed Z39.50 cache"""
    print("🔍 Seeding Z39.50 cache...")
    
    query_string = "title:algorithms author:cormen"
    query_hash = hashlib.sha256(query_string.encode()).hexdigest()
    
    cache_entries = [
        {
            "query_hash": query_hash,
            "results": [
                {
                    "control_number": "LOC123456",
                    "match_score": 0.95,
                    "snapshot": {
                        "title": "Introduction to Algorithms",
                        "author": "Cormen, Thomas H.",
                        "year": 2024
                    }
                }
            ],
            "expired_at": datetime.now(timezone.utc) + timedelta(hours=24),
            "source_host": "z3950.loc.gov"
        }
    ]
    
    db.z3950_cache.delete_many({})
    result = db.z3950_cache.insert_many(cache_entries)
    print(f"  ✅ Created {len(result.inserted_ids)} Z39.50 cache entries")
    return result.inserted_ids

def seed_oai_records(db, marc_ids):
    """Seed OAI-PMH records"""
    print("📡 Seeding OAI records...")
    
    oai_records = [
        {
            "oai_identifier": "oai:ntt.edu.vn:thesis-001",
            "datestamp": "2025-10-15",
            "setSpec": ["thesis", "cs"],
            "metadata": {
                "dc:title": "Deep Learning Applications in Computer Vision",
                "dc:creator": "Nguyễn Văn X",
                "dc:date": "2025"
            },
            "mapped_record_id": marc_ids[1],
            "harvest_log": [
                {
                    "ts": datetime.now(timezone.utc) - timedelta(days=10),
                    "status": "ok",
                    "note": "Initial harvest"
                }
            ]
        }
    ]
    
    db.oai_records.delete_many({})
    result = db.oai_records.insert_many(oai_records)
    print(f"  ✅ Created {len(result.inserted_ids)} OAI records")
    return result.inserted_ids

def seed_sip2_events(db, user_ids, item_ids):
    """Seed SIP2 protocol events"""
    print("🔌 Seeding SIP2 events...")
    
    sip2_events = [
        {
            "type": SIP2EventType.CHECKOUT.value,
            "request": {"payload": "11YN20251027    143000AO|AA2|AB|AC|"},
            "response": {"payload": "12YNY20251027    143001AO|AA2|AB|AJ|", "code": "00"},
            "user_id": user_ids[1],
            "item_id": item_ids[0],
            "ts": datetime.now(timezone.utc) - timedelta(days=5)
        },
        {
            "type": SIP2EventType.STATUS.value,
            "request": {"payload": "17<patron status>20251027|AO|AA|AC|AD|"},
            "response": {"payload": "24              00120251027|AO|AA|", "code": "00"},
            "user_id": user_ids[1],
            "item_id": None,
            "ts": datetime.now(timezone.utc) - timedelta(hours=2)
        }
    ]
    
    db.sip2_events.delete_many({})
    result = db.sip2_events.insert_many(sip2_events)
    print(f"  ✅ Created {len(result.inserted_ids)} SIP2 events")
    return result.inserted_ids

def seed_auth_sessions(db, user_ids):
    """Seed authentication sessions"""
    print("🔐 Seeding auth sessions...")
    
    sessions = [
        {
            "user_id": user_ids[1],  # SV002
            "refresh_token": "refresh_token_abc123xyz",
            "device": "Chrome 130 - Windows 11",
            "ip": "192.168.1.100",
            "created_at": datetime.now(timezone.utc) - timedelta(hours=3),
            "expired_at": datetime.now(timezone.utc) + timedelta(days=30)
        },
        {
            "user_id": user_ids[3],  # Admin
            "refresh_token": "refresh_token_def456uvw",
            "device": "Firefox 120 - macOS",
            "ip": "192.168.1.101",
            "created_at": datetime.now(timezone.utc) - timedelta(hours=1),
            "expired_at": datetime.now(timezone.utc) + timedelta(days=30)
        }
    ]
    
    db.auth_sessions.delete_many({})
    result = db.auth_sessions.insert_many(sessions)
    print(f"  ✅ Created {len(result.inserted_ids)} auth sessions")
    return result.inserted_ids

def main():
    """Main seeding function"""
    print("="*70)
    print("🚀 FULL MongoDB Cloud Seeding - All 15 Collections")
    print("="*70)
    print(f"📡 Connecting to: {MONGO_CLOUD_URI[:50]}...\n")
    
    try:
        db = get_cloud_db()
        db.command('ping')
        print("✅ Connected to MongoDB Cloud successfully!\n")
        print("="*70 + "\n")
        
        # Seed all collections
        user_ids = seed_users(db)
        marc_ids = seed_marc_records(db)
        item_ids = seed_items(db, marc_ids)
        loan_ids = seed_loans(db, user_ids, item_ids)
        conv_ids = seed_conversations(db, user_ids)
        msg_ids = seed_messages(db, conv_ids, marc_ids)
        faq_ids = seed_faq(db)
        doc_ids = seed_documents(db)
        rec_ids = seed_recommend_events(db, user_ids, marc_ids)
        metric_ids = seed_metrics(db)
        config_ids = seed_admin_configs(db)
        cache_ids = seed_z3950_cache(db)
        oai_ids = seed_oai_records(db, marc_ids)
        sip2_ids = seed_sip2_events(db, user_ids, item_ids)
        session_ids = seed_auth_sessions(db, user_ids)
        
        print("\n" + "="*70)
        print("✅ ALL COLLECTIONS SEEDED SUCCESSFULLY!")
        print("="*70)
        print("\n📊 Summary:")
        print(f"  👥 Users: {len(user_ids)}")
        print(f"  📚 MARC Records: {len(marc_ids)}")
        print(f"  📦 Items: {len(item_ids)}")
        print(f"  📝 Loans: {len(loan_ids)}")
        print(f"  💬 Conversations: {len(conv_ids)}")
        print(f"  ✉️  Messages: {len(msg_ids)}")
        print(f"  ❓ FAQ: {len(faq_ids)}")
        print(f"  📄 Documents: {len(doc_ids)}")
        print(f"  🎯 Recommend Events: {len(rec_ids)}")
        print(f"  📊 Metrics: {len(metric_ids)}")
        print(f"  ⚙️  Admin Configs: {len(config_ids)}")
        print(f"  🔍 Z39.50 Cache: {len(cache_ids)}")
        print(f"  📡 OAI Records: {len(oai_ids)}")
        print(f"  🔌 SIP2 Events: {len(sip2_ids)}")
        print(f"  🔐 Auth Sessions: {len(session_ids)}")
        
        print("\n🔐 Test Accounts (Password: Password123):")
        print("  - admin@ntt.edu.vn (Admin)")
        print("  - librarian@ntt.edu.vn (Librarian)")
        print("  - sv001@ntt.edu.vn (Reader)")
        print("  - sv002@ntt.edu.vn (Reader - has active loans)")
        
        print("\n💡 Database fully seeded and ready for:")
        print("  ✅ Authentication & Authorization")
        print("  ✅ MARC21 catalog search")
        print("  ✅ Loan management (with SIP2)")
        print("  ✅ AI Chatbox with citations")
        print("  ✅ Academic recommendations")
        print("  ✅ Z39.50 & OAI-PMH integration")
        print("  ✅ Metrics & monitoring")
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

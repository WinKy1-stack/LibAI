"""
Script to initialize MongoDB indexes for Library Chatbox System
Run: python scripts/init_mongodb_indexes.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.utils.mongo_helper import MongoHelper

def create_users_indexes():
    """Create indexes for users collection"""
    print("📝 Creating indexes for 'users'...")
    
    MongoHelper.create_index('users', [('email', 1)], unique=True)
    MongoHelper.create_index('users', [('student_id', 1)], unique=True)
    MongoHelper.create_index('users', [('role', 1), ('status', 1)])
    
    print("  ✅ Users indexes created")

def create_marc_records_indexes():
    """Create indexes for marc_records collection"""
    print("📝 Creating indexes for 'marc_records'...")

    # Text search index for new schema
    MongoHelper.create_index('marc_records', [
        ('title.main', 'text'),
        ('title.subtitle', 'text'),
        ('contributors.name', 'text'),
        ('subjects.term', 'text')
    ])

    MongoHelper.create_index('marc_records', [('publication.year', 1), ('publication.publisher', 1)])
    MongoHelper.create_index('marc_records', [('record_id', 1)], unique=True)
    MongoHelper.create_index('marc_records', [('identifiers.isbn.value', 1)])
    MongoHelper.create_index('marc_records', [('subjects.term', 1)])
    MongoHelper.create_index('marc_records', [('contributors.name', 1)])

    print("  ✅ MARC records indexes created")

def create_items_indexes():
    """Create indexes for items collection"""
    print("📝 Creating indexes for 'items'...")
    
    MongoHelper.create_index('items', [('barcode', 1)], unique=True)
    MongoHelper.create_index('items', [('record_id', 1)])
    MongoHelper.create_index('items', [('status', 1), ('location.branch', 1)])
    
    print("  ✅ Items indexes created")

def create_loans_indexes():
    """Create indexes for loans collection"""
    print("📝 Creating indexes for 'loans'...")
    
    MongoHelper.create_index('loans', [('user_id', 1), ('status', 1)])
    MongoHelper.create_index('loans', [('item_id', 1), ('status', 1)])
    MongoHelper.create_index('loans', [('due_date', 1)])
    
    print("  ✅ Loans indexes created")

def create_conversations_indexes():
    """Create indexes for conversations collection"""
    print("📝 Creating indexes for 'conversations'...")
    
    MongoHelper.create_index('conversations', [('user_id', 1), ('started_at', -1)])
    
    print("  ✅ Conversations indexes created")

def create_messages_indexes():
    """Create indexes for messages collection"""
    print("📝 Creating indexes for 'messages'...")
    
    MongoHelper.create_index('messages', [('conversation_id', 1), ('ts', 1)])
    
    print("  ✅ Messages indexes created")

def create_faq_indexes():
    """Create indexes for faq collection"""
    print("📝 Creating indexes for 'faq'...")
    
    # Text search index
    MongoHelper.create_index('faq', [
        ('question', 'text'),
        ('answer', 'text'),
        ('tags', 'text')
    ])
    
    MongoHelper.create_index('faq', [('category', 1), ('status', 1)])
    
    print("  ✅ FAQ indexes created")

def create_documents_indexes():
    """Create indexes for documents collection"""
    print("📝 Creating indexes for 'documents'...")
    
    MongoHelper.create_index('documents', [('title', 'text'), ('lang', 1)])
    
    print("  ✅ Documents indexes created")

def create_recommend_events_indexes():
    """Create indexes for recommend_events collection"""
    print("📝 Creating indexes for 'recommend_events'...")
    
    MongoHelper.create_index('recommend_events', [('user_id', 1), ('ts', -1)])
    MongoHelper.create_index('recommend_events', [('record_id', 1), ('event', 1)])
    
    print("  ✅ Recommend events indexes created")

def create_metrics_indexes():
    """Create indexes for metrics collection"""
    print("📝 Creating indexes for 'metrics'...")
    
    MongoHelper.create_index('metrics', [('kind', 1), ('ts', -1)])
    MongoHelper.create_index('metrics', [('labels.model', 1), ('ts', -1)])
    
    print("  ✅ Metrics indexes created")

def create_admin_configs_indexes():
    """Create indexes for admin_configs collection"""
    print("📝 Creating indexes for 'admin_configs'...")
    
    MongoHelper.create_index('admin_configs', [('key', 1)], unique=True)
    
    print("  ✅ Admin configs indexes created")

def create_z3950_cache_indexes():
    """Create indexes for z3950_cache collection"""
    print("📝 Creating indexes for 'z3950_cache'...")
    
    MongoHelper.create_index('z3950_cache', [('query_hash', 1)], unique=True)
    # TTL index - auto delete expired cache
    MongoHelper.create_index('z3950_cache', [('expired_at', 1)], expireAfterSeconds=0)
    
    print("  ✅ Z39.50 cache indexes created")

def create_oai_records_indexes():
    """Create indexes for oai_records collection"""
    print("📝 Creating indexes for 'oai_records'...")
    
    MongoHelper.create_index('oai_records', [('oai_identifier', 1)], unique=True)
    MongoHelper.create_index('oai_records', [('datestamp', -1)])
    
    print("  ✅ OAI records indexes created")

def create_sip2_events_indexes():
    """Create indexes for sip2_events collection"""
    print("📝 Creating indexes for 'sip2_events'...")
    
    MongoHelper.create_index('sip2_events', [('type', 1), ('ts', -1)])
    
    print("  ✅ SIP2 events indexes created")

def create_auth_sessions_indexes():
    """Create indexes for auth_sessions collection"""
    print("📝 Creating indexes for 'auth_sessions'...")
    
    MongoHelper.create_index('auth_sessions', [('user_id', 1), ('expired_at', 1)])
    # TTL index - auto delete expired sessions
    MongoHelper.create_index('auth_sessions', [('expired_at', 1)], expireAfterSeconds=0)
    
    print("  ✅ Auth sessions indexes created")

def list_all_indexes():
    """List all indexes in all collections"""
    print("\n📊 Index Summary:")
    
    collections = [
        'users', 'marc_records', 'items', 'loans', 
        'conversations', 'messages', 'faq', 'documents',
        'recommend_events', 'metrics', 'admin_configs',
        'z3950_cache', 'oai_records', 'sip2_events', 'auth_sessions'
    ]
    
    from app import mongo
    
    for collection_name in collections:
        try:
            collection = mongo.db[collection_name]
            indexes = list(collection.list_indexes())
            print(f"\n  📁 {collection_name}: {len(indexes)} indexes")
            for idx in indexes:
                keys = list(idx.get('key', {}).keys())
                unique = " [UNIQUE]" if idx.get('unique') else ""
                text = " [TEXT]" if any('text' in str(v) for v in idx.get('key', {}).values()) else ""
                ttl = f" [TTL: {idx.get('expireAfterSeconds')}s]" if 'expireAfterSeconds' in idx else ""
                print(f"    - {', '.join(keys)}{unique}{text}{ttl}")
        except Exception as e:
            print(f"  ❌ Error listing indexes for {collection_name}: {str(e)}")

def main():
    """Main function to create all indexes"""
    print("=" * 70)
    print("🔧 MongoDB Indexes Initialization")
    print("=" * 70)
    
    app = create_app()
    
    with app.app_context():
        try:
            # Test connection
            print("\n🔌 Testing MongoDB connection...")
            from app import mongo
            mongo.cx.admin.command('ping')
            print("  ✅ MongoDB connected successfully\n")
            
            # Create all indexes
            create_users_indexes()
            create_marc_records_indexes()
            create_items_indexes()
            create_loans_indexes()
            create_conversations_indexes()
            create_messages_indexes()
            create_faq_indexes()
            create_documents_indexes()
            create_recommend_events_indexes()
            create_metrics_indexes()
            create_admin_configs_indexes()
            create_z3950_cache_indexes()
            create_oai_records_indexes()
            create_sip2_events_indexes()
            create_auth_sessions_indexes()
            
            # List all indexes
            list_all_indexes()
            
            print("\n" + "=" * 70)
            print("✅ All indexes created successfully!")
            print("=" * 70)
            print("\n💡 Next steps:")
            print("  1. Run seeding script: python scripts/seed_library_data.py")
            print("  2. Start backend: python run.py")
            print("  3. Test API endpoints")
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("\nTroubleshooting:")
            print("  1. Make sure MongoDB is running: net start MongoDB")
            print("  2. Check .env file has correct MONGO_URI")
            print("  3. Verify MongoDB is listening on localhost:27017")
            sys.exit(1)

if __name__ == '__main__':
    main()

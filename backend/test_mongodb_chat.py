"""
Test script to check if conversations are saved in MongoDB
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# Connect to MongoDB
mongo_uri = os.getenv('MONGO_URI_CLOUD')
client = MongoClient(mongo_uri)
db = client['library_chatbox']

print("=" * 70)
print("CHECKING MONGODB CONVERSATIONS")
print("=" * 70)

# Check conversations collection
conversations_collection = db['conversations']
conversations_count = conversations_collection.count_documents({})
print(f"\n✓ Total conversations: {conversations_count}")

if conversations_count > 0:
    print("\nLast 5 conversations:")
    conversations = conversations_collection.find().sort('started_at', -1).limit(5)
    for conv in conversations:
        print(f"  - ID: {conv.get('conversation_id', conv.get('_id', 'N/A'))}")
        print(f"    User: {conv.get('user_id', 'N/A')}")
        print(f"    Started: {conv.get('started_at', 'N/A')}")
        print(f"    Model: {conv.get('meta', {}).get('model', 'N/A')}")
        print(f"    Full data: {conv}")
        print()

# Check messages collection
messages_collection = db['messages']
messages_count = messages_collection.count_documents({})
print(f"✓ Total messages: {messages_count}")

if messages_count > 0:
    print("\nLast 5 messages:")
    messages = messages_collection.find().sort('timestamp', -1).limit(5)
    for msg in messages:
        print(f"  - Conversation: {msg.get('conversation_id', 'N/A')}")
        print(f"    Role: {msg.get('role', 'N/A')}")
        content = msg.get('content', '')
        print(f"    Content: {content[:50] if content else 'N/A'}...")
        print(f"    Timestamp: {msg.get('timestamp', 'N/A')}")
        print(f"    Full data: {msg}")
        print()

print("=" * 70)

# Close connection
client.close()

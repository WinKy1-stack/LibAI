"""
Script to seed AI configuration into MongoDB
Run this to initialize AI config with default values
"""
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app import create_app, mongo
from app.ai.pipelines.prompt.instructions import SYSTEM_INSTRUCTIONS

def seed_ai_config():
    """Seed AI configuration into database with default values"""
    
    app = create_app()
    
    with app.app_context():
        try:
            collection = mongo.db['admin_configs']
            
            ai_config_data = {
                'model': os.getenv('GEMINI_MODEL', 'gemini-2.0-flash'),
                'temperature': float(os.getenv('GEMINI_TEMPERATURE', '0.7')),
                'maxTokens': int(os.getenv('GEMINI_MAX_TOKENS', '2000')),
                'topP': float(os.getenv('GEMINI_TOP_P', '0.9')),
                'topK': int(os.getenv('GEMINI_TOP_K', '40')),
                'systemPrompt': SYSTEM_INSTRUCTIONS['default'],
                'enableStreaming': True,
                'enableCache': True,
                'maxBooksInContext': int(os.getenv('MAX_BOOKS_IN_CONTEXT', '30')),
                'maxChatHistory': int(os.getenv('MAX_CHAT_HISTORY', '10')),
                'maxMessageLength': int(os.getenv('MAX_MESSAGE_LENGTH', '2000'))
            }
            
            existing = collection.find_one({'type': 'ai'})
            
            if existing:
                print("⚠️  AI config already exists in database")
                print("Current config:")
                for key, value in existing.get('data', {}).items():
                    if key == 'apiKey':
                        print(f"  - {key}: {'*' * 20} (hidden)")
                    elif key == 'systemPrompt':
                        print(f"  - {key}: {value[:80]}...")
                    else:
                        print(f"  - {key}: {value}")
                
                response = input("\nDo you want to UPDATE it with new defaults? (yes/no): ")
                if response.lower() not in ['yes', 'y']:
                    print("❌ Cancelled. No changes made.")
                    return
                
                collection.update_one(
                    {'type': 'ai'},
                    {
                        '$set': {
                            'data': ai_config_data,
                            'updated_at': datetime.utcnow()
                        }
                    }
                )
                print("✅ AI config UPDATED successfully!")
                
            else:
                collection.insert_one({
                    'type': 'ai',
                    'data': ai_config_data,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                })
                print("✅ AI config CREATED successfully!")
            
            print("\n" + "=" * 60)
            print("SEEDED AI CONFIGURATION")
            print("=" * 60)
            print(f"✓ Model: {ai_config_data['model']}")
            print(f"✓ Temperature: {ai_config_data['temperature']}")
            print(f"✓ Max Tokens: {ai_config_data['maxTokens']}")
            print(f"✓ Top P: {ai_config_data['topP']}")
            print(f"✓ Top K: {ai_config_data['topK']}")
            print(f"✓ Max Books in Context: {ai_config_data['maxBooksInContext']}")
            print(f"✓ Max Chat History: {ai_config_data['maxChatHistory']}")
            print(f"✓ Max Message Length: {ai_config_data['maxMessageLength']}")
            print(f"✓ System Prompt: {ai_config_data['systemPrompt'][:80]}...")
            print(f"✓ Enable Streaming: {ai_config_data['enableStreaming']}")
            print(f"✓ Enable Cache: {ai_config_data['enableCache']}")
            print("=" * 60)
            
            print("\n⚠️  NOTE: API Key is NOT stored in database for security.")
            print("   It will be loaded from environment variable GEMINI_API_KEY")
            print("\n💡 TIP: You can now edit these values via Admin UI > Settings > AI Config")
            
        except Exception as e:
            print(f"❌ Error seeding AI config: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("AI CONFIG SEEDER")
    print("=" * 60)
    print("This will initialize AI configuration in MongoDB")
    print("Values will be loaded from .env file")
    print()
    
    seed_ai_config()

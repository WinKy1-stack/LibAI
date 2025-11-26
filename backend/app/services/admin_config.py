import logging
from datetime import datetime
from app import mongo
from app.config import Config
from app.ai.pipelines.prompt.instructions import SYSTEM_INSTRUCTIONS

logger = logging.getLogger(__name__)

class AdminConfigService:
    COLLECTION = 'admin_configs'

    @classmethod
    def get_ai_config(cls):
        """Get AI configuration from DB or return defaults"""
        try:
            config = mongo.db[cls.COLLECTION].find_one({'type': 'ai'})
            data = config.get('data', {}) if config else {}
            
            # Default AI configuration
            defaults = {
                'model': 'gemini-2.0-flash',
                'temperature': 0.7,
                'maxTokens': 2000,
                'topP': 0.9,
                'topK': 40,
                'systemPrompt': SYSTEM_INSTRUCTIONS.get('default', ''),
                'maxBooksInContext': 30,
                'maxChatHistory': 10,
                'maxMessageLength': 2000,
                'enableStreaming': True,
                'enableCache': True
            }
            
            # Merge defaults with data (data overrides defaults)
            return {**defaults, **data}
        except Exception as e:
            logger.error(f"Error fetching AI config: {str(e)}")
            return {}

    @classmethod
    def update_ai_config(cls, data):
        """Update AI configuration"""
        try:
            mongo.db[cls.COLLECTION].update_one(
                {'type': 'ai'},
                {'$set': {'data': data, 'updated_at': datetime.utcnow()}},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error updating AI config: {str(e)}")
            return False

    @classmethod
    def get_system_config(cls):
        """Get System configuration from DB or return defaults"""
        try:
            config = mongo.db[cls.COLLECTION].find_one({'type': 'system'})
            if config:
                return config.get('data', {})
            return {}
        except Exception as e:
            logger.error(f"Error fetching System config: {str(e)}")
            return {}

    @classmethod
    def update_system_config(cls, data):
        """Update System configuration"""
        try:
            mongo.db[cls.COLLECTION].update_one(
                {'type': 'system'},
                {'$set': {'data': data, 'updated_at': datetime.utcnow()}},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error updating System config: {str(e)}")
            return False

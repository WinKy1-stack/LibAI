"""
Conversation Operations - Quản lý conversations trong MongoDB
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.utils.mongo_helper import MongoHelper  # type: ignore
from app.models.mongodb_schemas import get_conversation_schema  # type: ignore

logger = logging.getLogger(__name__)


class ConversationManager:
    """Quản lý conversation operations"""
    
    COLLECTION_NAME = 'conversations'
    
    @staticmethod
    def create(
        user_id: str,
        channel: str = "web",
        model: str = "gemini-2.0-flash-exp",
        lang: str = "vi"
    ) -> str:
        """
        Tạo conversation mới
        
        Args:
            user_id: ID của user
            channel: Kênh chat (web, mobile)
            model: Model AI đang dùng
            lang: Ngôn ngữ
            
        Returns:
            conversation_id (str)
        """
        try:
            conversation = get_conversation_schema()
            
            # Convert user_id string to ObjectId if valid
            try:
                conversation['user_id'] = ObjectId(user_id)
            except Exception:
                conversation['user_id'] = user_id
            
            conversation['started_at'] = datetime.now(timezone.utc)
            conversation['meta'] = {
                'channel': channel,
                'model': model,
                'lang': lang
            }
            
            conversation_id = MongoHelper.insert_one(
                ConversationManager.COLLECTION_NAME,
                conversation
            )
            
            # Ensure conversation_id is string (not ObjectId)
            conversation_id_str = str(conversation_id)
            
            logger.info("Created conversation %s for user %s", conversation_id_str, user_id)
            return conversation_id_str
            
        except Exception as e:
            logger.error("Error creating conversation: %s", str(e))
            raise
    
    @staticmethod
    def get_by_user(
        user_id: str,
        limit: int = 20,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Lấy danh sách conversations của user với message count
        
        Args:
            user_id: ID của user
            limit: Số lượng conversations
            skip: Bỏ qua bao nhiêu conversations
            
        Returns:
            List of conversations with formatted fields and message counts
        """
        try:
            # Convert to ObjectId
            try:
                uid = ObjectId(user_id)
            except Exception:
                uid = user_id
            
            conversations = MongoHelper.find_many(
                ConversationManager.COLLECTION_NAME,
                query={'user_id': uid},
                sort=[('started_at', -1)],  # Descending order
                limit=limit,
                skip=skip
            )
            
            # Get message counts for all conversations
            conv_ids = [ObjectId(conv['_id']) for conv in conversations]
            message_counts = {}
            
            if conv_ids:
                # Aggregation pipeline to count messages per conversation
                pipeline = [
                    {'$match': {'conversation_id': {'$in': conv_ids}}},
                    {'$group': {
                        '_id': '$conversation_id',
                        'count': {'$sum': 1}
                    }}
                ]
                counts = MongoHelper.aggregate('messages', pipeline)
                message_counts = {str(c['_id']): c['count'] for c in counts}
            
            # Format conversations for frontend
            formatted_conversations = []
            for conv in conversations:
                # Convert _id to both id and conversation_id for frontend compatibility
                conv_id = conv['_id']
                formatted_conv = {
                    'id': conv_id,
                    'conversation_id': conv_id,
                    'user_id': str(conv.get('user_id', '')),
                    'started_at': conv.get('started_at'),
                    'ended_at': conv.get('ended_at'),
                    'meta': conv.get('meta', {}),
                    'message_count': message_counts.get(conv_id, 0)
                }
                formatted_conversations.append(formatted_conv)
            
            logger.debug(
                "Retrieved %d conversations for user %s",
                len(formatted_conversations),
                user_id
            )
            
            return formatted_conversations
            
        except Exception as e:
            logger.error("Error getting user conversations: %s", str(e))
            return []
    
    @staticmethod
    def end(conversation_id: str) -> bool:
        """
        Đánh dấu conversation đã kết thúc
        
        Args:
            conversation_id: ID của conversation
            
        Returns:
            True if successful
        """
        try:
            result = MongoHelper.update_one(
                ConversationManager.COLLECTION_NAME,
                query={'_id': conversation_id},
                update={'ended_at': datetime.now(timezone.utc)}
            )
            
            logger.info("Ended conversation %s", conversation_id)
            return result > 0
            
        except Exception as e:
            logger.error("Error ending conversation: %s", str(e))
            return False
    
    @staticmethod
    def get_stats(user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Lấy thống kê về conversations
        
        Args:
            user_id: Nếu có, chỉ thống kê của user này
            
        Returns:
            Dict chứa các số liệu thống kê
        """
        try:
            query = {}
            if user_id:
                try:
                    query['user_id'] = ObjectId(user_id)
                except Exception:
                    query['user_id'] = user_id
            
            total_conversations = MongoHelper.count_documents(
                ConversationManager.COLLECTION_NAME,
                query
            )
            
            # Count active vs completed
            active_query = {**query, 'ended_at': None}
            active_count = MongoHelper.count_documents(
                ConversationManager.COLLECTION_NAME,
                active_query
            )
            
            stats = {
                'total_conversations': total_conversations,
                'active_conversations': active_count,
                'completed_conversations': total_conversations - active_count
            }
            
            if user_id:
                stats['user_id'] = user_id
            
            logger.debug("Generated conversation stats: %s", stats)
            return stats
            
        except Exception as e:
            logger.error("Error getting conversation stats: %s", str(e))
            return {
                'total_conversations': 0,
                'active_conversations': 0,
                'completed_conversations': 0
            }
    
    @staticmethod
    def get_all_ids_by_user(user_id: str) -> List[ObjectId]:
        """
        Lấy tất cả conversation IDs của user
        
        Args:
            user_id: ID của user
            
        Returns:
            List of ObjectIds
        """
        try:
            try:
                uid = ObjectId(user_id)
            except Exception:
                uid = user_id
            
            conversations = MongoHelper.find_many(
                ConversationManager.COLLECTION_NAME,
                query={'user_id': uid},
                projection={'_id': 1}
            )
            
            return [ObjectId(c['_id']) for c in conversations]
            
        except Exception as e:
            logger.error("Error getting conversation IDs: %s", str(e))
            return []
    
    @staticmethod
    def belongs_to_user(conversation_id: str, user_id: str) -> bool:
        """
        Kiểm tra xem conversation này có thuộc user hiện tại không
        
        Args:
            conversation_id: ID của conversation
            user_id: ID của user
            
        Returns:
            True nếu conversation thuộc user, False otherwise
        """
        try:
            try:
                conv_id = ObjectId(conversation_id)
            except Exception:
                conv_id = conversation_id
            
            try:
                uid = ObjectId(user_id)
            except Exception:
                uid = user_id
            
            conversation = MongoHelper.find_one(
                ConversationManager.COLLECTION_NAME,
                query={'_id': conv_id, 'user_id': uid}
            )
            
            result = conversation is not None
            logger.debug(f"Conversation {conversation_id} belongs to user {user_id}: {result}")
            return result
            
        except Exception as e:
            logger.error("Error checking conversation ownership: %s", str(e))
            return False

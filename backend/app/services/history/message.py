"""
Message Operations - Quản lý messages trong MongoDB
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.utils.mongo_helper import MongoHelper  # type: ignore
from app.models.mongodb_schemas import get_message_schema, MessageRole  # type: ignore

logger = logging.getLogger(__name__)


class MessageManager:
    """Quản lý message operations"""
    
    COLLECTION_NAME = 'messages'
    
    @staticmethod
    def save(
        conversation_id: str,
        role: str,
        content: str,
        latency_ms: int = 0,
        citations: List[Dict] = None
    ) -> str:
        """
        Lưu một message vào conversation
        
        Args:
            conversation_id: ID của conversation
            role: user/assistant/system
            content: Nội dung tin nhắn
            latency_ms: Thời gian phản hồi (ms)
            citations: Danh sách trích dẫn
            
        Returns:
            message_id (str)
        """
        try:
            message = get_message_schema()
            
            # Convert conversation_id to ObjectId
            try:
                message['conversation_id'] = ObjectId(conversation_id)
            except Exception:
                message['conversation_id'] = conversation_id
            
            message['role'] = role
            message['content'] = content
            message['latency_ms'] = latency_ms
            message['citations'] = citations or []
            message['ts'] = datetime.now(timezone.utc)
            
            message_id = MongoHelper.insert_one(
                MessageManager.COLLECTION_NAME,
                message
            )
            
            # Ensure message_id is string (not ObjectId)
            message_id_str = str(message_id)
            
            logger.debug("Saved message %s to conversation %s", message_id_str, conversation_id)
            return message_id_str
            
        except Exception as e:
            logger.error("Error saving message: %s", str(e))
            raise
    
    @staticmethod
    def save_exchange(
        conversation_id: str,
        user_message: str,
        assistant_message: str,
        latency_ms: int = 0
    ) -> Dict[str, str]:
        """
        Lưu cả user message và assistant response
        
        Args:
            conversation_id: ID của conversation
            user_message: Tin nhắn từ user
            assistant_message: Phản hồi từ AI
            latency_ms: Thời gian phản hồi
            
        Returns:
            Dict với user_message_id và assistant_message_id
        """
        try:
            # Save user message
            user_msg_id = MessageManager.save(
                conversation_id=conversation_id,
                role=MessageRole.USER.value,
                content=user_message,
                latency_ms=0
            )
            
            # Save assistant message
            assistant_msg_id = MessageManager.save(
                conversation_id=conversation_id,
                role=MessageRole.ASSISTANT.value,
                content=assistant_message,
                latency_ms=latency_ms
            )
            
            logger.info(
                "Saved chat exchange to conversation %s",
                conversation_id
            )
            
            # Ensure IDs are strings (not ObjectId)
            return {
                'user_message_id': str(user_msg_id),
                'assistant_message_id': str(assistant_msg_id)
            }
            
        except Exception as e:
            logger.error("Error saving chat exchange: %s", str(e))
            raise
    
    @staticmethod
    def get_by_conversation(
        conversation_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Lấy lịch sử messages của conversation với formatted fields
        
        Args:
            conversation_id: ID của conversation
            limit: Số lượng messages tối đa
            
        Returns:
            List of formatted messages
        """
        try:
            # Convert to ObjectId
            try:
                conv_id = ObjectId(conversation_id)
            except Exception:
                conv_id = conversation_id
            
            messages = MongoHelper.find_many(
                MessageManager.COLLECTION_NAME,
                query={'conversation_id': conv_id},
                sort=[('ts', 1)],
                limit=limit
            )
            
            if messages is None:
                logger.warning("No messages found or DB error for conversation %s", conversation_id)
                return []
            
            formatted_messages = []
            for msg in messages:
                formatted_msg = {
                    'id': msg['_id'],
                    'conversation_id': str(msg.get('conversation_id', '')),
                    'role': msg.get('role', 'user'),
                    'content': msg.get('content', ''),
                    'timestamp': msg.get('ts'),
                    'citations': msg.get('citations', []),
                    'latency_ms': msg.get('latency_ms', 0)
                }
                formatted_messages.append(formatted_msg)
            
            logger.debug(
                "Retrieved %d messages from conversation %s",
                len(formatted_messages),
                conversation_id
            )
            
            return formatted_messages
            
        except Exception as e:
            logger.error("Error getting conversation history: %s", str(e))
            return []
    
    @staticmethod
    def get_stats(conversation_ids: Optional[List[ObjectId]] = None) -> Dict[str, Any]:
        """
        Lấy thống kê về messages
        
        Args:
            conversation_ids: List of conversation IDs để lọc
            
        Returns:
            Dict chứa các số liệu thống kê
        """
        try:
            query = {}
            if conversation_ids:
                query['conversation_id'] = {'$in': conversation_ids}
            
            total_messages = MongoHelper.count_documents(
                MessageManager.COLLECTION_NAME,
                query
            )
            
            # Calculate average latency
            pipeline = [
                {'$match': query} if query else {'$match': {}},
                {'$match': {'latency_ms': {'$gt': 0}}},
                {'$group': {
                    '_id': None,
                    'avg_latency': {'$avg': '$latency_ms'}
                }}
            ]
            
            result = MongoHelper.aggregate(
                MessageManager.COLLECTION_NAME,
                pipeline
            )
            
            avg_latency = None
            if result:
                avg_latency = result[0].get('avg_latency')
            
            stats = {
                'total_messages': total_messages
            }
            
            if avg_latency is not None:
                stats['average_latency_ms'] = avg_latency
            
            logger.debug("Generated message stats: %s", stats)
            return stats
            
        except Exception as e:
            logger.error("Error getting message stats: %s", str(e))
            return {'total_messages': 0}

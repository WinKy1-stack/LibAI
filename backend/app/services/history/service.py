"""
Chat History Service - Facade pattern cho conversation và message operations
"""
import logging
from typing import List, Dict, Optional, Any

from .conversation import ConversationManager
from .message import MessageManager

logger = logging.getLogger(__name__)


class ChatHistoryService:
    """
    Service tổng hợp cho chat history
    Sử dụng ConversationManager và MessageManager
    """
    
    # Conversation operations
    @staticmethod
    def create_conversation(
        user_id: str,
        channel: str = "web",
        model: str = "gemini-2.0-flash-exp",
        lang: str = "vi"
    ) -> str:
        """Tạo conversation mới"""
        return ConversationManager.create(user_id, channel, model, lang)
    
    @staticmethod
    def get_user_conversations(
        user_id: str,
        limit: int = 20,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Lấy danh sách conversations của user"""
        return ConversationManager.get_by_user(user_id, limit, skip)
    
    @staticmethod
    def end_conversation(conversation_id: str) -> bool:
        """Kết thúc conversation"""
        return ConversationManager.end(conversation_id)
    
    # Message operations
    @staticmethod
    def save_message(
        conversation_id: str,
        role: str,
        content: str,
        latency_ms: int = 0,
        citations: List[Dict] = None
    ) -> str:
        """Lưu một message"""
        return MessageManager.save(
            conversation_id, role, content, latency_ms, citations
        )
    
    @staticmethod
    def save_chat_exchange(
        conversation_id: str,
        user_message: str,
        assistant_message: str,
        latency_ms: int = 0
    ) -> Dict[str, str]:
        """Lưu cả user message và AI response"""
        return MessageManager.save_exchange(
            conversation_id, user_message, assistant_message, latency_ms
        )
    
    @staticmethod
    def get_conversation_history(
        conversation_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Lấy lịch sử messages của conversation"""
        return MessageManager.get_by_conversation(conversation_id, limit)
    
    # Validation operations
    @staticmethod
    def conversation_belongs_to_user(conversation_id: str, user_id: str) -> bool:
        """Kiểm tra xem conversation này có thuộc user không"""
        return ConversationManager.belongs_to_user(conversation_id, user_id)
    
    # Combined stats
    @staticmethod
    def get_conversation_stats(user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Lấy thống kê tổng hợp về conversations và messages
        
        Args:
            user_id: Nếu có, chỉ thống kê của user này
            
        Returns:
            Dict chứa các số liệu thống kê
        """
        try:
            # Get conversation stats
            conv_stats = ConversationManager.get_stats(user_id)
            
            # Get message stats
            if user_id:
                conv_ids = ConversationManager.get_all_ids_by_user(user_id)
                msg_stats = MessageManager.get_stats(conv_ids)
            else:
                msg_stats = MessageManager.get_stats()
            
            # Combine stats
            stats = {
                **conv_stats,
                **msg_stats
            }
            
            # Calculate average messages per conversation
            total_conv = stats.get('total_conversations', 0)
            total_msg = stats.get('total_messages', 0)
            
            if total_conv > 0:
                stats['avg_messages_per_conversation'] = total_msg / total_conv
            else:
                stats['avg_messages_per_conversation'] = 0
            
            return stats
            
        except Exception as e:
            logger.error("Error getting combined stats: %s", str(e))
            return {
                'total_conversations': 0,
                'total_messages': 0,
                'avg_messages_per_conversation': 0
            }


# Singleton instance
_chat_history_service: Optional[ChatHistoryService] = None


def get_chat_history_service() -> ChatHistoryService:
    """Get singleton instance of ChatHistoryService"""
    global _chat_history_service
    
    if _chat_history_service is None:
        _chat_history_service = ChatHistoryService()
        logger.info("ChatHistoryService singleton initialized")
    
    return _chat_history_service

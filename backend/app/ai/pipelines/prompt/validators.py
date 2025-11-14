"""
Prompt Validators - Validation logic cho chat service
"""
import logging
from typing import List, Dict

from app.services.exceptions import ValidationError

logger = logging.getLogger(__name__)


class PromptValidator:
    """Validator cho prompts và messages"""
    
    def __init__(self, max_message_length: int, max_history_length: int):
        """
        Args:
            max_message_length: Độ dài tối đa của message
            max_history_length: Số lượng messages tối đa trong history
        """
        self.max_message_length = max_message_length
        self.max_history_length = max_history_length
    
    def validate_message(self, message: str) -> None:
        """
        Validate user message
        
        Args:
            message: Tin nhắn cần validate
            
        Raises:
            ValidationError: Nếu message không hợp lệ
        """
        if not message or not message.strip():
            raise ValidationError("Tin nhắn không được để trống")
        
        if len(message) > self.max_message_length:
            raise ValidationError(
                f"Tin nhắn quá dài (tối đa {self.max_message_length} ký tự)"
            )
    
    def validate_chat_history(
        self,
        chat_history: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        """
        Validate và giới hạn chat history
        
        Args:
            chat_history: Lịch sử chat cần validate
            
        Returns:
            Validated và truncated chat history
            
        Raises:
            ValidationError: Nếu format không đúng
        """
        if not chat_history:
            return []
        
        # Giới hạn độ dài history
        if len(chat_history) > self.max_history_length:
            logger.debug(
                f"Truncating chat history from {len(chat_history)} "
                f"to {self.max_history_length}"
            )
            chat_history = chat_history[-self.max_history_length:]
        
        # Validate structure
        for msg in chat_history:
            if not isinstance(msg, dict):
                raise ValidationError("Chat history phải là list of dict")
            
            if 'role' not in msg or 'content' not in msg:
                raise ValidationError("Mỗi message phải có 'role' và 'content'")
            
            if msg['role'] not in ['user', 'assistant', 'model']:
                raise ValidationError(f"Invalid role: {msg['role']}")
        
        return chat_history
    
    def validate_books_list(self, books: list) -> None:
        """
        Validate danh sách sách
        
        Args:
            books: Danh sách sách cần validate
            
        Raises:
            ValidationError: Nếu không hợp lệ
        """
        if not books:
            raise ValidationError("Danh sách sách không được để trống")
        
        if not isinstance(books, list):
            raise ValidationError("Books phải là một list")

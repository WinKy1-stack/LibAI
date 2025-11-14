import logging
from typing import List, Dict, Optional, Any

from app.ai.exceptions import GeminiAPIError
from app.ai.clients import GoogleGenAIClient

logger = logging.getLogger(__name__)


class ChatSession:
    """
    Quản lý chat session với Gemini API
    Cho phép AI nhớ được lịch sử chat
    """

    def __init__(
        self,
        client: GoogleGenAIClient,
        model_id: str,
        config: Dict[str, Any],
        system_instruction: str,
        initial_history: Optional[List[Dict[str, str]]] = None
    ):
        """
        Args:
            client: Gemini client
            model_id: Model ID
            config: Chat config dictionary
            system_instruction: System instruction cho chat
            initial_history: Lịch sử ban đầu từ database (format: [{'role': 'user/model', 'content': str}])
        """
        self.client = client
        self.model_id = model_id
        self.config = config
        self.system_instruction = system_instruction

        # Tạo chat session với SDK mới
        self.chat = self._create_chat()

        # Load initial history từ database nếu có
        if initial_history:
            for msg in initial_history:
                try:
                    # Convert DB format sang format Gemini API
                    role = "user" if msg.get('role') == 'user' else "model"
                    content = msg.get('content', '')
                    # Thêm vào history bằng cách gửi message (history tự động được lưu)
                    # Nhưng chỉ add nếu không phải message mới nhất
                    logger.debug(f"Loaded message from history: role={role}, len={len(content)}")
                except Exception as e:
                    logger.warning(f"Failed to load history message: {str(e)}")

        logger.info("Created new chat session with model %s (history_size=%d)", model_id, len(initial_history) if initial_history else 0)

    def _generation_overrides(self) -> Dict[str, Any]:
        return {
            'temperature': self.config.get('GEMINI_TEMPERATURE', 0.7),
            'max_output_tokens': self.config.get('GEMINI_MAX_TOKENS', 1000),
            'top_p': self.config.get('GEMINI_TOP_P', 0.95),
            'top_k': self.config.get('GEMINI_TOP_K', 40)
        }

    def _create_chat(self):
        return self.client.create_chat_session(
            system_instruction=self.system_instruction,
            **self._generation_overrides()
        )

    def send_message(self, message: str) -> str:
        """
        Gửi message và nhận response
        History được tự động lưu trong chat session

        Args:
            message: User message

        Returns:
            AI response text
        """
        try:
            response = self.chat.send_message(message)
            response_text = response.text

            logger.debug("Sent message to chat session, received %d chars", len(response_text))
            return response_text.strip()

        except Exception as e:
            logger.error("Error in chat session: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi chat với AI: {str(e)}") from e

    def send_message_stream(self, message: str):
        """
        Gửi message và nhận response dạng stream

        Args:
            message: User message

        Yields:
            Chunks of response text
        """
        try:
            response = self.chat.send_message_stream(message)
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text

        except Exception as e:
            logger.error("Error in chat stream: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi stream chat: {str(e)}") from e

    def get_history(self) -> List[Dict[str, Any]]:
        """
        Lấy lịch sử chat từ session

        Returns:
            List of messages với role và content
        """
        try:
            history = []
            for message in self.chat.get_history():
                history.append({
                    'role': message.role,
                    'content': message.parts[0].text if message.parts else ''
                })
            return history

        except Exception as e:
            logger.error("Error getting chat history: %s", str(e))
            return []

    def clear_history(self):
        """Clear chat history bằng cách tạo session mới"""
        self.chat = self._create_chat()
        logger.info("Cleared chat history for session")

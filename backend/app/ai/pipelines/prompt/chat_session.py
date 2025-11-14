import logging
from typing import List, Dict, Optional, Any

from app.ai.exceptions import GeminiAPIError
from app.ai.clients import GoogleGenAIClient

logger = logging.getLogger(__name__)


class ChatSession:
    def __init__(
        self,
        client: GoogleGenAIClient,
        model_id: str,
        config: Dict[str, Any],
        system_instruction: str,
        initial_history: Optional[List[Dict[str, str]]] = None
    ):
        self.client = client
        self.model_id = model_id
        self.config = config
        self.system_instruction = system_instruction

        self.chat = self._create_chat()

        logger.info(
            "Created chat session (model=%s, history_size=%d)",
            model_id,
            len(initial_history) if initial_history else 0
        )

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
        try:
            response = self.chat.send_message(message)
            return response.text.strip()
        except Exception as e:
            logger.error("Chat session error: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi chat với AI: {str(e)}") from e

    def send_message_stream(self, message: str):
        try:
            response = self.chat.send_message_stream(message)
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error("Chat stream error: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi stream chat: {str(e)}") from e

    def get_history(self) -> List[Dict[str, Any]]:
        try:
            history = []
            for msg in self.chat.get_history():
                history.append({
                    'role': msg.role,
                    'content': msg.parts[0].text if msg.parts else ''
                })
            return history
        except Exception as e:
            logger.error("Get history error: %s", str(e))
            return []

    def clear_history(self):
        self.chat = self._create_chat()
        logger.info("Chat session history cleared")

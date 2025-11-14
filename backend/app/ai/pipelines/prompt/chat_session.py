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

        if initial_history:
            for msg in initial_history:
                try:
                    role = "user" if msg.get('role') == 'user' else "model"
                    content = msg.get('content', '')
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
        try:
            response = self.chat.send_message(message)
            response_text = response.text
            logger.debug("Sent message to chat session, received %d chars", len(response_text))
            return response_text.strip()
        except Exception as e:
            logger.error("Error in chat session: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi chat với AI: {str(e)}") from e

    def send_message_stream(self, message: str):
        try:
            response = self.chat.send_message_stream(message)
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error("Error in chat stream: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi stream chat: {str(e)}") from e

    def get_history(self) -> List[Dict[str, Any]]:
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
        self.chat = self._create_chat()
        logger.info("Cleared chat history for session")

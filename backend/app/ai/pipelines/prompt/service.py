import logging
import threading
import time
from typing import Dict, Optional

from app.ai.exceptions import (
    GeminiAPIError,
    InvalidConfigurationError,
    ValidationError,
    EmptyResponseError,
)
from app.ai.clients import (
    GeminiClientSettings,
    GoogleGenAIClient,
)
from app.ai.pipelines.prompt.validators import PromptValidator
from app.ai.pipelines.prompt.instructions import SYSTEM_INSTRUCTIONS
from app.ai.pipelines.prompt.chat_session import ChatSession

logger = logging.getLogger(__name__)


def retry_on_503(max_retries=3, base_delay=1.0):
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except GeminiAPIError as e:
                    error_msg = str(e)
                    is_503 = ("503" in error_msg or "UNAVAILABLE" in error_msg or 
                             "overloaded" in error_msg.lower())
                    
                    if not is_503 or attempt == max_retries - 1:
                        raise
                    
                    delay = base_delay * (2 ** attempt)
                    logger.warning(
                        f"API 503 (lần {attempt + 1}/{max_retries}), retry sau {delay}s"
                    )
                    time.sleep(delay)
                    last_exception = e
                except Exception:
                    raise
            
            if last_exception:
                raise last_exception
        return wrapper
    return decorator


class PromptService:
    def __init__(self, config):
        try:
            self.config = config

            settings = GeminiClientSettings(
                model=self.config['GEMINI_MODEL'],
                temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 1000),
                top_p=self.config.get('GEMINI_TOP_P', 0.95),
                top_k=self.config.get('GEMINI_TOP_K', 40),
            )
            self.genai_client = GoogleGenAIClient(
                api_key=self.config['GEMINI_API_KEY'],
                settings=settings
            )
            self.model_id = settings.model

            self.validator = PromptValidator(
                max_message_length=self.config.get('MAX_MESSAGE_LENGTH', 2000),
                max_history_length=self.config.get('MAX_CHAT_HISTORY', 10)
            )

            self._chat_sessions: Dict[str, ChatSession] = {}
            self._sessions_lock = threading.Lock()

            logger.info("=" * 60)
            logger.info("GEMINI AI SERVICE INITIALIZATION")
            logger.info("=" * 60)
            logger.info("✓ Model: %s", self.model_id)
            logger.info("✓ API Key: %s...%s",
                        self.config['GEMINI_API_KEY'][:10],
                        self.config['GEMINI_API_KEY'][-4:])
            logger.info("✓ Gemini API configured successfully")
            logger.info("=" * 60)
            
        except ValueError as e:
            logger.error("Configuration error: %s", str(e))
            raise InvalidConfigurationError(str(e)) from e
        except Exception as e:
            logger.error("Failed to initialize PromptService: %s", str(e))
            raise InvalidConfigurationError(f"Không thể khởi tạo service: {str(e)}") from e
    
    def get_or_create_chat_session(
        self,
        conversation_id: str,
        instruction_type: str = 'default'
    ) -> ChatSession:
        with self._sessions_lock:
            if conversation_id not in self._chat_sessions:
                system_instruction = SYSTEM_INSTRUCTIONS.get(
                    instruction_type,
                    SYSTEM_INSTRUCTIONS['default']
                )

                initial_history = []
                try:
                    from app.services.history import MessageManager

                    db_messages = MessageManager.get_by_conversation(conversation_id, limit=50)
                    initial_history = [
                        {
                            'role': msg.get('role', 'user'),
                            'content': msg.get('content', '')
                        }
                        for msg in db_messages
                    ]
                    logger.info(f"Loaded {len(initial_history)} messages from DB for conversation {conversation_id}")
                except Exception as e:
                    logger.warning(f"Failed to load history from DB: {str(e)}")

                self._chat_sessions[conversation_id] = ChatSession(
                    client=self.genai_client,
                    model_id=self.model_id,
                    config=self.config,
                    system_instruction=system_instruction,
                    initial_history=initial_history
                )

                logger.info("Created chat session for conversation %s with %d history messages", conversation_id, len(initial_history))

            return self._chat_sessions[conversation_id]

    def clear_chat_session(self, conversation_id: str) -> None:
        with self._sessions_lock:
            if conversation_id in self._chat_sessions:
                del self._chat_sessions[conversation_id]
                logger.info("Cleared chat session for conversation %s", conversation_id)
    
    def generate_response_with_session(
        self,
        conversation_id: str,
        user_message: str,
        instruction_type: str = 'default',
        latency_ms: int = 0
    ) -> str:
        """
        Generate text-only response (backward compatible)
        For rich UI with books, use generate_response_structured()
        """
        try:
            self.validator.validate_message(user_message)

            chat_session = self.get_or_create_chat_session(
                conversation_id,
                instruction_type
            )

            logger.debug("Sending message via agent to session %s", conversation_id)
            response_text = chat_session.run(user_message)

            if not response_text or not response_text.strip():
                logger.warning("Empty response text")
                raise EmptyResponseError("AI trả về nội dung trống")

            try:
                from app.services.history import MessageManager

                MessageManager.save_exchange(
                    conversation_id=conversation_id,
                    user_message=user_message,
                    assistant_message=response_text,
                    latency_ms=latency_ms
                )
                logger.debug("Saved exchange to DB for conversation %s", conversation_id)
            except Exception as db_error:
                logger.warning(f"Failed to save to DB: {str(db_error)}")

            logger.info("Generated response: %d characters (with session)", len(response_text))
            return response_text.strip()

        except (ValidationError, EmptyResponseError):
            raise
        except Exception as e:
            logger.error("Error in generate_response_with_session: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e

    def generate_response_structured(
        self,
        conversation_id: str,
        user_message: str,
        instruction_type: str = 'default',
        latency_ms: int = 0
    ) -> Dict[str, any]:
        """
        Generate structured response with text + books data for rich UI

        Returns:
            {
                "text": "AI response",
                "books": [...] or None,
                "metadata": {...} or None
            }
        """
        try:
            self.validator.validate_message(user_message)

            chat_session = self.get_or_create_chat_session(
                conversation_id,
                instruction_type
            )

            logger.debug("Sending message via agent (structured) to session %s", conversation_id)
            structured_response = chat_session.send_message_structured(user_message)

            response_text = structured_response.get('text', '')
            if not response_text or not response_text.strip():
                logger.warning("Empty response text")
                raise EmptyResponseError("AI trả về nội dung trống")

            try:
                from app.services.history import MessageManager

                books = structured_response.get('books')
                metadata = structured_response.get('metadata')

                # Save text exchange to DB with books data
                MessageManager.save_exchange(
                    conversation_id=conversation_id,
                    user_message=user_message,
                    assistant_message=response_text,
                    latency_ms=latency_ms,
                    books=books,
                    metadata=metadata
                )
                logger.debug("Saved exchange to DB for conversation %s (with %d books)", conversation_id, len(books) if books else 0)
            except Exception as db_error:
                logger.warning(f"Failed to save to DB: {str(db_error)}")

            books = structured_response.get('books') or []
            logger.info(
                "Generated structured response: %d chars, %d books",
                len(response_text),
                len(books)
            )
            return structured_response

        except (ValidationError, EmptyResponseError):
            raise
        except Exception as e:
            logger.error("Error in generate_response_structured: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e



_singleton_lock = threading.Lock()

class PromptServiceSingleton:
    """Singleton container cho PromptService"""
    _instance: Optional[PromptService] = None
    
    @classmethod
    def get_instance(cls, config) -> PromptService:
        """Lấy instance của PromptService (Thread-safe)"""
        if cls._instance is None:
            with _singleton_lock:
                if cls._instance is None:
                    logger.info("Initializing PromptService singleton")
                    cls._instance = PromptService(config)
        
        return cls._instance
    
    @classmethod
    def reset(cls) -> None:
        """Reset singleton instance (dùng cho testing)"""
        with _singleton_lock:
            cls._instance = None
            logger.info("PromptService singleton reset")


from flask import current_app

def get_prompt_service() -> PromptService:
    """Lấy instance của PromptService (Singleton)"""
    return PromptServiceSingleton.get_instance(current_app.config)

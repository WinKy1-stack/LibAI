import logging
import threading
from typing import List, Dict, Optional, Any

from app.ai.exceptions import (
    GeminiAPIError,
    InvalidConfigurationError,
    ValidationError,
    EmptyResponseError,
)
from app.ai.clients import (
    DEFAULT_SAFETY_SETTINGS,
    GeminiClientSettings,
    GoogleGenAIClient,
)
from app.ai.pipelines.prompt.validators import PromptValidator
from app.ai.pipelines.prompt.formatters import PromptFormatter
from app.ai.pipelines.prompt.instructions import SYSTEM_INSTRUCTIONS
from app.ai.pipelines.prompt.chat_session import ChatSession

logger = logging.getLogger(__name__)


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
                max_message_length=2000,
                max_history_length=10
            )
            self.formatter = PromptFormatter()

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
        try:
            self.validator.validate_message(user_message)

            chat_session = self.get_or_create_chat_session(
                conversation_id,
                instruction_type
            )

            logger.debug("Sending message to chat session %s", conversation_id)
            response_text = chat_session.send_message(user_message)

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

    def generate_response(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[str] = None,
        instruction_type: str = 'default'
    ) -> str:
        """
        Tạo response từ Gemini API
        
        Args:
            user_message: Tin nhắn từ người dùng
            chat_history: Lịch sử chat trước đó
            context: Context bổ sung
            instruction_type: Loại instruction
        
        Returns:
            Response text từ AI
        """
        try:
            # Validate input
            self.validator.validate_message(user_message)
            chat_history = self.validator.validate_chat_history(chat_history or [])
            
            # Build prompt
            full_prompt = self.formatter.build_prompt(user_message, context)
            contents = self.formatter.build_contents(chat_history, full_prompt)
            
            # Get system instruction
            system_instruction = SYSTEM_INSTRUCTIONS.get(
                instruction_type,
                SYSTEM_INSTRUCTIONS['default']
            )
            
            # Call API
            logger.debug("Calling Gemini API with %d messages", len(contents))
            response = self._call_gemini_api(contents, system_instruction)
            
            # Validate response
            if not response:
                logger.warning("Received null response from Gemini API")
                raise EmptyResponseError()
            
            # Với SDK mới, response có thuộc tính text trực tiếp
            try:
                response_text = response.text
            except (ValueError, AttributeError) as e:
                logger.error("Cannot access response.text: %s", str(e))
                logger.debug("Response object: %s", response)
                raise EmptyResponseError("AI không trả về nội dung hợp lệ") from e
            
            if not response_text or not response_text.strip():
                logger.warning("Empty response text")
                raise EmptyResponseError("AI trả về nội dung trống")
            
            logger.info("Generated response: %d characters", len(response_text))
            return response_text.strip()
                
        except (ValidationError, EmptyResponseError):
            raise
        except Exception as e:
            logger.error("Error in generate_response: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e
    
    def generate_book_recommendation(
        self,
        user_preferences: Dict[str, Any],
        available_books: List[Dict[str, Any]]
    ) -> str:
        """
        Tạo gợi ý sách dựa trên sở thích
        
        Args:
            user_preferences: Sở thích người dùng
            available_books: Danh sách sách có sẵn
        
        Returns:
            Gợi ý sách từ AI
        """
        try:
            self.validator.validate_books_list(available_books)
            
            # Giới hạn số lượng sách
            max_books = self.config.get('MAX_BOOKS_IN_CONTEXT', 30)
            limited_books = available_books[:max_books]
            
            # Build prompt
            prompt = self.formatter.build_recommendation_prompt(
                user_preferences,
                limited_books
            )
            
            logger.debug("Generating recommendations for %d books", len(limited_books))
            return self.generate_response(
                user_message=prompt,
                instruction_type='recommendation'
            )
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error("Error in generate_book_recommendation: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi tạo gợi ý: {str(e)}") from e
    
    def search_books_with_ai(
        self,
        query: str,
        books_data: List[Dict[str, Any]]
    ) -> str:
        """
        Tìm kiếm sách thông minh với AI
        
        Args:
            query: Câu hỏi/yêu cầu tìm kiếm
            books_data: Dữ liệu sách từ database
        
        Returns:
            Kết quả tìm kiếm
        """
        try:
            self.validator.validate_message(query)
            self.validator.validate_books_list(books_data)
            
            # Limit books
            max_books = self.config.get('MAX_BOOKS_IN_CONTEXT', 30)
            limited_books = books_data[:max_books]
            
            # Build prompt
            prompt = self.formatter.build_search_prompt(query, limited_books)
            books_info = self.formatter.format_books_details(limited_books)
            
            logger.debug("Searching in %d books with query: %s...", len(limited_books), query[:50])
            return self.generate_response(
                user_message=prompt,
                context=books_info,
                instruction_type='search'
            )
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error("Error in search_books_with_ai: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi tìm kiếm: {str(e)}") from e
    
    def _call_gemini_api(
        self,
        contents: List[Dict[str, Any]],
        system_instruction: str,
        retry_count: int = 0,
        max_retries: int = 3
    ) -> Any:
        """Call Gemini API với SDK mới (google-genai) - Có retry logic"""
        try:
            # SDK mới: from google import genai
            # Cấu hình safety settings
            safety_settings = list(DEFAULT_SAFETY_SETTINGS)
            
            # Generation config overrides
            generation_kwargs = {
                'temperature': self.config.get('GEMINI_TEMPERATURE', 0.7),
                'max_output_tokens': self.config.get('GEMINI_MAX_TOKENS', 1000),
                'top_p': self.config.get('GEMINI_TOP_P', 0.95),
                'top_k': self.config.get('GEMINI_TOP_K', 40)
            }
            
            # Tách lịch sử và message cuối
            current_message = contents[-1]['parts'][0] if contents else ""
            
            # Với SDK mới, nếu có history thì cần xử lý khác
            # Hiện tại chỉ gửi message đơn với system instruction
            # TODO: Implement chat history properly với SDK mới
            
            # Generate content với SDK mới
            logger.debug(f"[API Call #{retry_count + 1}] Sending request to Gemini {self.model_id}...")
            response = self.genai_client.generate_content(
                contents=current_message,
                system_instruction=system_instruction,
                safety_settings=safety_settings,
                **generation_kwargs
            )
            
            logger.debug("Gemini API call successful")
            return response
            
        except Exception as e:
            error_str = str(e)
            status_code = None
            error_type = "UNKNOWN"
            
            if '503' in error_str or 'Service Unavailable' in error_str or 'UNAVAILABLE' in error_str:
                error_type = "SERVICE_OVERLOADED"
                status_code = 503
                user_message = "AI đang quá tải. Vui lòng thử lại trong vài giây."
                
                # Retry nếu chưa vượt quá max_retries
                if retry_count < max_retries:
                    wait_time = 2 ** (retry_count + 1)  # Exponential backoff: 2s, 4s, 8s
                    logger.warning(f"[Retry {retry_count + 1}/{max_retries}] Service overloaded. Waiting {wait_time}s...")
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                else:
                    logger.error("Max retries reached. Service still overloaded.")
                    
            elif '429' in error_str or 'Rate limit' in error_str or 'RESOURCE_EXHAUSTED' in error_str:
                error_type = "RATE_LIMITED"
                status_code = 429
                user_message = "Yêu cầu quá nhiều. Vui lòng đợi một lát rồi thử lại."
                logger.warning(f"Rate limited by Gemini API. Waiting before retry...")
                if retry_count < max_retries:
                    wait_time = 5 + (2 * retry_count)  # 5s, 7s, 9s
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                    
            elif '401' in error_str or '403' in error_str or 'PERMISSION_DENIED' in error_str:
                error_type = "AUTH_ERROR"
                status_code = 401
                user_message = "Lỗi xác thực. Vui lòng kiểm tra cài đặt API key."
                logger.error("Authentication/Authorization failed with Gemini API")
                
            elif '400' in error_str or 'BadRequest' in error_str or 'INVALID_ARGUMENT' in error_str:
                error_type = "BAD_REQUEST"
                status_code = 400
                user_message = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại tin nhắn."
                logger.error(f"Bad request to Gemini API: {error_str}")
                
            elif 'timeout' in error_str.lower() or 'deadline' in error_str.lower():
                error_type = "TIMEOUT"
                status_code = 504
                user_message = "⏱Yêu cầu quá lâu. Vui lòng thử lại."
                logger.error("Gemini API request timed out")
                if retry_count < max_retries:
                    wait_time = 3
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                    
            elif 'safety' in error_str.lower() or 'blocked' in error_str.lower():
                error_type = "SAFETY_BLOCKED"
                status_code = 400
                user_message = "Tin nhắn bị chặn bởi bộ lọc an toàn. Vui lòng rephrase."
                logger.warning(f"Safety filter blocked message: {error_str}")
                
            elif 'overloaded' in error_str.lower() or 'overloaded' in error_str:
                error_type = "MODEL_OVERLOADED"
                status_code = 503
                user_message = "Model đang quá tải. Vui lòng thử lại sau."
                if retry_count < max_retries:
                    wait_time = 3 + (2 * retry_count)
                    logger.warning(f"Model overloaded. Retry {retry_count + 1}/{max_retries} after {wait_time}s")
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                    
            else:
                error_type = "UNKNOWN_ERROR"
                user_message = f"Lỗi khi xử lý tin nhắn: {error_str[:100]}"
                logger.error(f"Unknown API error: {error_str}")
            
            # Log chi tiết lỗi
            logger.error(f"""
                        ╔═══════════════════════════════════════════════════════════╗
                        ║ GEMINI API ERROR DETAILS
                        ╠═══════════════════════════════════════════════════════════╣
                        ║ Type: {error_type}
                        ║ Status: {status_code}
                        ║ Message: {user_message}
                        ║ Retry: {retry_count}/{max_retries}
                        ║ Original Error: {error_str}
                        ╚═══════════════════════════════════════════════════════════╝
                        """)
            
            raise GeminiAPIError(user_message) from e


# Singleton pattern với class để tránh global statement
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

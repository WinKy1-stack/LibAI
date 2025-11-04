"""
Prompt Service - Core AI logic cho chat system  
Refactored version - sử dụng Validator và Formatter với Chat Session
"""
import logging
import threading
from typing import List, Dict, Optional, Any
from google import genai
from google.genai import types

from app.services.prompt.config import ChatConfig, SYSTEM_INSTRUCTIONS
from app.services.exceptions import (
    GeminiAPIError,
    InvalidConfigurationError,
    ValidationError,
    EmptyResponseError
)
from app.services.prompt.validators import PromptValidator
from app.services.prompt.formatters import PromptFormatter

logger = logging.getLogger(__name__)


class ChatSession:
    """
    Quản lý chat session với Gemini API
    Cho phép AI nhớ được lịch sử chat
    """
    
    def __init__(self, client: genai.Client, model_id: str, config: ChatConfig, system_instruction: str):
        """
        Args:
            client: Gemini client
            model_id: Model ID
            config: Chat config
            system_instruction: System instruction cho chat
        """
        self.client = client
        self.model_id = model_id
        self.config = config
        self.system_instruction = system_instruction
        
        # Tạo chat session với SDK mới
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                temperature=config.temperature,
                max_output_tokens=config.max_output_tokens,
                top_p=config.top_p,
                top_k=config.top_k,
                system_instruction=system_instruction,
            )
        )
        
        logger.info("Created new chat session with model %s", model_id)
    
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
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                temperature=self.config.temperature,
                max_output_tokens=self.config.max_output_tokens,
                top_p=self.config.top_p,
                top_k=self.config.top_k,
                system_instruction=self.system_instruction,
            )
        )
        logger.info("Cleared chat history for session")


class PromptService:
    """Service xử lý prompt và tương tác với Gemini API"""
    
    def __init__(self, config: Optional[ChatConfig] = None):
        """Khởi tạo service với config"""
        try:
            self.config = config or ChatConfig.from_env()
            self.config.validate()
            
            # Configure Gemini với SDK mới (google-genai)
            self.client = genai.Client(api_key=self.config.gemini_api_key)
            self.model_id = self.config.gemini_model
            
            # Khởi tạo validator và formatter
            self.validator = PromptValidator(
                max_message_length=self.config.max_message_length,
                max_history_length=self.config.max_chat_history_length
            )
            self.formatter = PromptFormatter()
            
            # Dictionary để lưu chat sessions theo conversation_id
            self._chat_sessions: Dict[str, ChatSession] = {}
            self._sessions_lock = threading.Lock()
            
            # Test connection với Gemini API
            logger.info("=" * 60)
            logger.info("GEMINI AI SERVICE INITIALIZATION")
            logger.info("=" * 60)
            logger.info("✓ Model: %s", self.model_id)
            logger.info("✓ API Key: %s...%s", 
                       self.config.gemini_api_key[:10], 
                       self.config.gemini_api_key[-4:])
            logger.info("✓ Temperature: %.2f", self.config.temperature)
            logger.info("✓ Max Tokens: %d", self.config.max_output_tokens)
            logger.info("✓ Gemini API configured successfully with new SDK")
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
        """
        Lấy hoặc tạo chat session cho conversation
        
        Args:
            conversation_id: ID của conversation
            instruction_type: Loại system instruction
            
        Returns:
            ChatSession instance
        """
        with self._sessions_lock:
            if conversation_id not in self._chat_sessions:
                system_instruction = SYSTEM_INSTRUCTIONS.get(
                    instruction_type,
                    SYSTEM_INSTRUCTIONS['default']
                )
                
                self._chat_sessions[conversation_id] = ChatSession(
                    client=self.client,
                    model_id=self.model_id,
                    config=self.config,
                    system_instruction=system_instruction
                )
                
                logger.info("Created chat session for conversation %s", conversation_id)
            
            return self._chat_sessions[conversation_id]
    
    def clear_chat_session(self, conversation_id: str) -> None:
        """
        Xóa chat session
        
        Args:
            conversation_id: ID của conversation
        """
        with self._sessions_lock:
            if conversation_id in self._chat_sessions:
                del self._chat_sessions[conversation_id]
                logger.info("Cleared chat session for conversation %s", conversation_id)
    
    def generate_response_with_session(
        self,
        conversation_id: str,
        user_message: str,
        instruction_type: str = 'default'
    ) -> str:
        """
        Tạo response sử dụng chat session (có memory)
        
        Args:
            conversation_id: ID của conversation
            user_message: Tin nhắn từ người dùng
            instruction_type: Loại instruction
        
        Returns:
            Response text từ AI
        """
        try:
            # Validate input
            self.validator.validate_message(user_message)
            
            # Get or create chat session
            chat_session = self.get_or_create_chat_session(conversation_id, instruction_type)
            
            # Send message through session (history tự động được lưu)
            logger.debug("Sending message to chat session %s", conversation_id)
            response_text = chat_session.send_message(user_message)
            
            if not response_text or not response_text.strip():
                logger.warning("Empty response text")
                raise EmptyResponseError("AI trả về nội dung trống")
            
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
            limited_books = available_books[:self.config.max_books_in_context]
            
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
            limited_books = books_data[:self.config.max_books_in_context]
            
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
        system_instruction: str
    ) -> Any:
        """Call Gemini API với SDK mới (google-genai)"""
        try:
            # SDK mới: from google import genai
            # Cấu hình safety settings
            safety_settings = [
                types.SafetySetting(
                    category='HARM_CATEGORY_HARASSMENT',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
                types.SafetySetting(
                    category='HARM_CATEGORY_HATE_SPEECH',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
                types.SafetySetting(
                    category='HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
                types.SafetySetting(
                    category='HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
            ]
            
            # Generation config
            generation_config = types.GenerateContentConfig(
                temperature=self.config.temperature,
                max_output_tokens=self.config.max_output_tokens,
                top_p=self.config.top_p,
                top_k=self.config.top_k,
                system_instruction=system_instruction,
                safety_settings=safety_settings
            )
            
            # Tách lịch sử và message cuối
            current_message = contents[-1]['parts'][0] if contents else ""
            
            # Với SDK mới, nếu có history thì cần xử lý khác
            # Hiện tại chỉ gửi message đơn với system instruction
            # TODO: Implement chat history properly với SDK mới
            
            # Generate content với SDK mới
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=current_message,
                config=generation_config
            )
            
            return response
        except Exception as e:
            logger.error("Gemini API call failed: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Không thể kết nối với AI: {str(e)}") from e


# Singleton pattern với class để tránh global statement
_singleton_lock = threading.Lock()

class PromptServiceSingleton:
    """Singleton container cho PromptService"""
    _instance: Optional[PromptService] = None
    
    @classmethod
    def get_instance(cls, config: Optional[ChatConfig] = None) -> PromptService:
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


def get_prompt_service(config: Optional[ChatConfig] = None) -> PromptService:
    """Lấy instance của PromptService (Singleton)"""
    return PromptServiceSingleton.get_instance(config)


def reset_prompt_service() -> None:
    """Reset singleton instance (dùng cho testing)"""
    PromptServiceSingleton.reset()

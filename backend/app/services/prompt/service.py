"""
Prompt Service - Core AI logic cho chat system  
Refactored version - sử dụng Validator và Formatter
"""
import logging
import threading
from typing import List, Dict, Optional, Any
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

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


class PromptService:
    """Service xử lý prompt và tương tác với Gemini API"""
    
    def __init__(self, config: Optional[ChatConfig] = None):
        """Khởi tạo service với config"""
        try:
            self.config = config or ChatConfig.from_env()
            self.config.validate()
            
            # Configure Gemini với SDK cũ
            genai.configure(api_key=self.config.gemini_api_key)
            self.model_id = self.config.gemini_model
            
            # Khởi tạo validator và formatter
            self.validator = PromptValidator(
                max_message_length=self.config.max_message_length,
                max_history_length=self.config.max_chat_history_length
            )
            self.formatter = PromptFormatter()
            
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
            logger.info("✓ Gemini API configured successfully")
            logger.info("=" * 60)
            
        except ValueError as e:
            logger.error("Configuration error: %s", str(e))
            raise InvalidConfigurationError(str(e)) from e
        except Exception as e:
            logger.error("Failed to initialize PromptService: %s", str(e))
            raise InvalidConfigurationError(f"Không thể khởi tạo service: {str(e)}") from e
    
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
            
            # Validate response and handle finish_reason
            if not response:
                logger.warning("Received null response from Gemini API")
                raise EmptyResponseError()
            
            # Check candidates và finish_reason
            if not response.candidates:
                logger.warning("No candidates in response")
                raise EmptyResponseError("AI không thể tạo phản hồi")
            
            candidate = response.candidates[0]
            finish_reason = candidate.finish_reason
            
            # Log finish_reason for debugging
            logger.debug("Finish reason: %s (type: %s)", finish_reason, type(finish_reason))
            
            # Handle different finish reasons
            # FinishReason enum values:
            # FINISH_REASON_UNSPECIFIED = 0
            # STOP = 1 (normal completion)
            # MAX_TOKENS = 2
            # SAFETY = 3 (blocked by safety filters)
            # RECITATION = 4
            # OTHER = 5
            
            # Convert enum to int for comparison (nếu là enum)
            try:
                finish_reason_value = int(finish_reason)
            except (ValueError, TypeError):
                # Nếu không convert được thì dùng name
                finish_reason_name = str(finish_reason)
                logger.warning("finish_reason type: %s, value: %s", type(finish_reason), finish_reason_name)
                
                if 'SAFETY' in finish_reason_name:
                    logger.warning("Response blocked by safety filters")
                    safety_ratings = candidate.safety_ratings if hasattr(candidate, 'safety_ratings') else []
                    logger.debug("Safety ratings: %s", safety_ratings)
                    raise GeminiAPIError(
                        "Xin lỗi, câu hỏi của bạn có thể chứa nội dung không phù hợp. "
                        "Vui lòng thử lại với câu hỏi khác."
                    )
                
                if 'MAX_TOKENS' in finish_reason_name:
                    logger.warning("Response truncated due to max tokens")
                
                if 'STOP' not in finish_reason_name and 'MAX_TOKENS' not in finish_reason_name:
                    logger.warning("Unexpected finish_reason: %s", finish_reason_name)
            else:
                # Handle as integer
                if finish_reason_value == 3:  # SAFETY
                    logger.warning("Response blocked by safety filters")
                    safety_ratings = candidate.safety_ratings if hasattr(candidate, 'safety_ratings') else []
                    logger.debug("Safety ratings: %s", safety_ratings)
                    raise GeminiAPIError(
                        "Xin lỗi, câu hỏi của bạn có thể chứa nội dung không phù hợp. "
                        "Vui lòng thử lại với câu hỏi khác."
                    )
                
                if finish_reason_value == 2:  # MAX_TOKENS
                    logger.warning("Response truncated due to max tokens")
                
                if finish_reason_value not in [1, 2]:  # Not STOP or MAX_TOKENS
                    logger.warning("Unexpected finish_reason: %s", finish_reason_value)
            
            # Try to get text
            try:
                response_text = response.text
            except (ValueError, AttributeError) as e:
                logger.error("Cannot access response.text: %s", str(e))
                logger.debug("Response object: %s", response)
                logger.debug("Candidate: %s", candidate)
                logger.debug("Candidate content: %s", candidate.content if hasattr(candidate, 'content') else 'N/A')
                logger.debug("Candidate parts: %s", candidate.content.parts if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts') else 'N/A')
                
                # Try to get from parts directly
                if hasattr(candidate, 'content') and candidate.content and hasattr(candidate.content, 'parts') and candidate.content.parts:
                    parts_with_text = [part for part in candidate.content.parts if hasattr(part, 'text')]
                    if parts_with_text:
                        response_text = ''.join(part.text for part in parts_with_text)
                        logger.info("Successfully extracted text from parts: %d chars", len(response_text))
                    else:
                        logger.error("No parts with text attribute found")
                        raise EmptyResponseError("AI không trả về nội dung hợp lệ") from e
                else:
                    logger.error("No valid content.parts in candidate")
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
        """Call Gemini API với SDK cũ (google-generativeai 0.8.3)"""
        try:
            # SDK cũ dùng GenerativeModel với safety settings
            # Sử dụng dict format cho safety_settings
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
            
            model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=system_instruction,
                safety_settings=safety_settings
            )
            
            #  HIỆN TẠI ĐANG DÙNG THƯ VIỆN CŨ CỦA GOOGLE, ĐÂY CHỈ LÀ MẪU MINH HỌA
            #  VUI LÒNG THAY THẾ BẰNG THƯ VIỆN MỚI KHI CÓ SẴN
            # from google import genai

            chat = model.start_chat()

            response = chat.send_message(
                contents=contents,
                generation_config={
                    'temperature': self.config.temperature,
                    'max_output_tokens': self.config.max_output_tokens,
                    'top_p': self.config.top_p,
                    'top_k': self.config.top_k,
                }
            )
            return response
        except Exception as e:
            logger.error("Gemini API call failed: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Không thể kết nối với AI: {str(e)}") from e


# Singleton pattern với class để tránh global statement
class PromptServiceSingleton:
    """Singleton container cho PromptService"""
    _instance: Optional[PromptService] = None
    _lock: Optional[threading.Lock] = None
    
    @classmethod
    def get_instance(cls, config: Optional[ChatConfig] = None) -> PromptService:
        """Lấy instance của PromptService (Thread-safe)"""
        if cls._lock is None:
            cls._lock = threading.Lock()
        
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    logger.info("Initializing PromptService singleton")
                    cls._instance = PromptService(config)
        
        return cls._instance
    
    @classmethod
    def reset(cls) -> None:
        """Reset singleton instance (dùng cho testing)"""
        cls._instance = None
        logger.info("PromptService singleton reset")


def get_prompt_service(config: Optional[ChatConfig] = None) -> PromptService:
    """Lấy instance của PromptService (Singleton)"""
    return PromptServiceSingleton.get_instance(config)


def reset_prompt_service() -> None:
    """Reset singleton instance (dùng cho testing)"""
    PromptServiceSingleton.reset()

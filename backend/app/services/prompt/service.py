"""
Prompt Service - Core AI logic cho chat system  
Refactored version - sử dụng Validator và Formatter với Chat Session
"""
import logging
import threading
from typing import List, Dict, Optional, Any
from google import genai
from google.genai import types

from app.services.exceptions import (
    GeminiAPIError,
    InvalidConfigurationError,
    ValidationError,
    EmptyResponseError
)
from app.services.prompt.validators import PromptValidator
from app.services.prompt.formatters import PromptFormatter

logger = logging.getLogger(__name__)

# System prompts
SYSTEM_INSTRUCTIONS = {
    'default': """Bạn là LibAI Assistant - trợ lý thư viện thông minh, kết nối trực tiếp với hệ thống Koha ILS để hỗ trợ độc giả.

VAI TRÒ:
- Lắng nghe và hiểu nhu cầu đọc sách của người dùng
- Gợi ý sách phù hợp từ kho sách thực tế trong thư viện Koha
- Hỗ trợ tìm kiếm sách theo tác giả, thể loại, chủ đề trong Koha
- Tra cứu thông tin mượn/trả, tình trạng sách thực tế
- Tư vấn về nội dung, giá trị của sách
- Hướng dẫn sử dụng dịch vụ thư viện

PHONG CÁCH:
- Thân thiện, gần gũi, dễ tiếp cận
- Nhiệt tình chia sẻ về sách và kiến thức
- Ngôn ngữ tự nhiên, không cứng nhắc
- Tích cực khuyến khích thói quen đọc sách
- Sử dụng dữ liệu thực từ Koha khi có sẵn trong context

CÁC TÌNH HUỐNG XỬ LÝ:

1. KHI NGƯỜI DÙNG TÌM SÁCH:
   - Xác nhận thể loại, chủ đề họ quan tâm
   - Sử dụng thông tin từ KOHA (nếu có trong context) để đề xuất sách có sẵn thực tế
   - Nêu rõ tình trạng sách: có sẵn, đang mượn, số lượng bản
   - Hỏi thêm về trình độ, mục đích đọc
   - Gợi ý 2-3 cuốn phù hợp với giải thích ngắn gọn

2. KHI NGƯỜI DÙNG HỎI VỀ SÁCH CỤ THỂ:
   - Sử dụng thông tin chi tiết từ Koha nếu có trong context
   - Giới thiệu tóm tắt nội dung chính, tác giả, NXB, năm xuất bản
   - Nêu tình trạng: có bao nhiêu bản, bao nhiêu bản có sẵn
   - Nêu điểm nổi bật, giá trị của sách
   - Đề xuất độc giả phù hợp
   - Gợi ý thêm sách tương tự nếu thích

3. KHI NGƯỜI DÙNG HỎI VỀ MƯỢN/TRẢ SÁCH:
   - Sử dụng thông tin từ Koha về sách đang mượn (nếu có trong context)
   - Thông báo số sách đang mượn, hạn trả, sách quá hạn
   - Hướng dẫn cách mượn/trả sách
   - Nhắc nhở về quy định thư viện

4. KHI NGƯỜI DÙNG HỎI VỀ TÁC GIẢ:
   - Giới thiệu ngắn gọn về tác giả
   - Liệt kê các tác phẩm có trong thư viện (dựa trên Koha context nếu có)
   - Nêu phong cách viết đặc trưng
   - Gợi ý sách nên đọc đầu tiên

5. VỀ DỊCH VỤ THƯ VIỆN:
   - Sử dụng thông tin FAQ từ Koha nếu có trong context
   - Hướng dẫn mượn/trả sách, gia hạn
   - Giải thích quy định thư viện
   - Hỗ trợ tra cứu thông tin
   - Giải đáp thắc mắc về tài khoản

CÁCH SỬ DỤNG DỮ LIỆU TỪ KOHA:
- Nếu context có thông tin từ Koha (bắt đầu bằng "KẾT QUẢ TÌM KIẾM", "THÔNG TIN BẠN ĐỌC", "THÔNG TIN CHI TIẾT SÁCH"...), hãy SỬ DỤNG dữ liệu đó
- Đề cập cụ thể: tên sách, tác giả, NXB, năm xuất bản, tình trạng có sẵn
- Nếu sách không có sẵn, thông báo rõ ràng và đề xuất giữ chỗ hoặc sách thay thế
- Nếu không có dữ liệu Koha trong context, vẫn có thể tư vấn chung dựa trên kiến thức

QUY TẮC ĐỊNH DẠNG:
- Trả lời bằng đoạn văn tự nhiên
- KHÔNG dùng markdown, bullet points
- KHÔNG dùng ký tự trang trí (*, -, #, etc.)
- Mỗi đoạn 3-6 câu, xuống dòng khi chuyển ý
- Giữ câu văn mượt mà, dễ đọc

VÍ DỤ CÁCH TRẢ LỜI:

Người dùng: "Tôi muốn tìm sách về lịch sử Việt Nam"
AI: "Mình rất vui được giúp bạn tìm sách về lịch sử Việt Nam! Đây là chủ đề rất phong phú và thú vị.

Để gợi ý chính xác hơn, bạn có thể cho mình biết bạn quan tâm đến giai đoạn nào không? Ví dụ như lịch sử cổ đại, thời Pháp thuộc, hay kháng chiến? Hay bạn muốn tìm sách tổng quát nhìn toàn cảnh lịch sử dân tộc?

Nếu bạn mới bắt đầu tìm hiểu, mình có thể gợi ý một số đầu sách dễ đọc và hấp dẫn để bạn làm quen với chủ đề này nhé."

Trả lời bằng Tiếng Việt, ngắn gọn 3-6 câu.""",

    'recommendation': """Bạn là chuyên gia gợi ý sách của thư viện, giúp độc giả tìm được cuốn sách phù hợp nhất.

VAI TRÒ:
- Phân tích sở thích đọc của người dùng
- Đề xuất sách phù hợp với nhu cầu cụ thể
- Giải thích lý do gợi ý từng cuốn sách
- Cân bằng giữa sách phổ biến và sách chất lượng

NGUYÊN TẮC GỢI Ý:
- Ưu tiên sách phù hợp với trình độ và sở thích
- Đa dạng thể loại nếu người dùng chưa có định hướng rõ
- Gợi ý 2-3 cuốn mỗi lần, tránh quá nhiều
- Kèm lý do ngắn gọn tại sao phù hợp

CÁCH TRÌNH BÀY:
- Xác nhận sở thích người dùng bằng một câu
- Giới thiệu từng sách trong đoạn riêng
- Mỗi đoạn: tên sách, tác giả, nội dung chính, lý do phù hợp
- KHÔNG liệt kê dạng danh sách, KHÔNG đánh số
- KHÔNG dùng markdown hay ký tự đặc biệt

CÁC YẾU TỐ CÂN NHẮC:
1. Mức độ khó/dễ của sách so với trình độ người dùng
2. Độ dài sách (ngắn/dài) phù hợp với thời gian
3. Phong cách viết (học thuật/đại chúng)
4. Tính cập nhật của nội dung
5. Đánh giá và phản hồi từ độc giả khác

VÍ DỤ:

Người dùng: "Tôi thích triết học nhưng là người mới, gợi ý sách gì dễ đọc"
AI: "Mình hiểu bạn muốn khám phá triết học nhưng cần sách dễ tiếp cận cho người mới bắt đầu. Đây là lựa chọn rất hay!

Mình gợi ý cuốn Thế giới Sophie của Jostein Gaarder. Đây là một cuốn tiểu thuyết triết học rất thú vị, kể về cô bé Sophie học triết học qua những bức thư bí ẩn. Cuốn sách dẫn dắt bạn đi qua lịch sử triết học phương Tây từ cổ đại đến hiện đại một cách sinh động và dễ hiểu. Đặc biệt phù hợp cho người mới vì nội dung được trình bày theo cốt truyện hấp dẫn thay vì khô khan lý thuyết.

Một lựa chọn khác là Nghệ thuật sống của Epicurus. Đây là cuốn sách mỏng, tập trung vào triết lý sống hạnh phúc rất gần gũi với đời sống. Nội dung đơn giản, thực tế, giúp bạn áp dụng ngay được vào cuộc sống hàng ngày.

Bạn thấy hướng nào hấp dẫn hơn? Hay bạn muốn mình gợi ý thêm về triết học phương Đông?""",

    'search': """Bạn là công cụ tìm kiếm sách thông minh, giúp người dùng tìm được chính xác sách họ cần.

VAI TRÒ:
- Hiểu rõ yêu cầu tìm kiếm của người dùng
- Tìm kiếm trong cơ sở dữ liệu thư viện
- Giải thích tại sao kết quả phù hợp với yêu cầu
- Hỗ trợ tinh chỉnh tìm kiếm nếu cần

CÁCH XỬ LÝ TÌM KIẾM:

1. XÁC NHẬN YÊU CẦU:
   - Lặp lại ngắn gọn điều người dùng tìm
   - Làm rõ nếu yêu cầu mơ hồ
   - Hỏi thêm chi tiết nếu cần thu hẹp kết quả

2. TRÌNH BÀY KẾT QUẢ:
   - Mỗi sách một đoạn riêng biệt
   - Nêu: tên sách, tác giả, năm xuất bản (nếu quan trọng)
   - Giải thích TẠI SAO sách này phù hợp với yêu cầu
   - Nêu điểm nổi bật liên quan đến tìm kiếm

3. KHÔNG CÓ KẾT QUẢ:
   - Thông báo không tìm thấy
   - Đề xuất mở rộng tiêu chí tìm kiếm
   - Gợi ý từ khóa tương tự
   - Đề nghị hỗ trợ tìm theo cách khác

4. QUÁ NHIỀU KẾT QUẢ:
   - Hiển thị 3-5 kết quả tiêu biểu nhất
   - Đề xuất thu hẹp tìm kiếm
   - Gợi ý thêm bộ lọc (năm, tác giả, thể loại)

QUY TẮC ĐỊNH DẠNG:
- Trả lời bằng đoạn văn, KHÔNG dùng bullet points
- KHÔNG dùng markdown, số thứ tự, ký tự đặc biệt
- Mỗi đoạn 3-6 câu
- Ngôn ngữ rõ ràng, chính xác, không hoa mỹ

VÍ DỤ:

Người dùng: "Tìm sách về trí tuệ nhân tạo cho người mới học"
AI: "Mình sẽ giúp bạn tìm sách về trí tuệ nhân tạo phù hợp cho người mới bắt đầu nhé.

Cuốn Artificial Intelligence: A Modern Approach của Stuart Russell và Peter Norvig là giáo trình AI kinh điển và toàn diện nhất hiện nay. Sách bao quát từ nền tảng lý thuyết đến ứng dụng thực tế, được viết rất dễ hiểu với nhiều ví dụ minh họa. Mặc dù khá dày nhưng nội dung được sắp xếp logic, bạn có thể đọc từng phần một.

Một lựa chọn nhẹ nhàng hơn là AI trong đời sống hàng ngày của tác giả Việt Nam. Cuốn này tập trung vào giới thiệu các ứng dụng AI trong thực tế như nhận diện giọng nói, xe tự lái, trợ lý ảo. Ưu điểm là viết bằng tiếng Việt, dễ tiếp cận, không đòi hỏi kiến thức toán học sâu.

Bạn muốn tìm hiểu theo hướng lý thuyết hay thực hành nhiều hơn? Mình có thể gợi ý thêm sách phù hợp."""
}


class ChatSession:
    """
    Quản lý chat session với Gemini API
    Cho phép AI nhớ được lịch sử chat
    """
    
    def __init__(self, client: genai.Client, model_id: str, config: Dict[str, Any], system_instruction: str, initial_history: List[Dict[str, str]] = None):
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
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                temperature=config.get('GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=config.get('GEMINI_MAX_TOKENS', 1000),
                top_p=config.get('GEMINI_TOP_P', 0.95),
                top_k=config.get('GEMINI_TOP_K', 40),
                system_instruction=system_instruction,
            )
        )
        
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
                temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 1000),
                top_p=self.config.get('GEMINI_TOP_P', 0.95),
                top_k=self.config.get('GEMINI_TOP_K', 40),
                system_instruction=self.system_instruction,
            )
        )
        logger.info("Cleared chat history for session")


class PromptService:
    """Service xử lý prompt và tương tác với Gemini API"""
    
    def __init__(self, config):
        """Khởi tạo service với config"""
        try:
            self.config = config
            
            # Configure Gemini với SDK mới (google-genai)
            self.client = genai.Client(api_key=self.config['GEMINI_API_KEY'])
            self.model_id = self.config['GEMINI_MODEL']
            
            # Khởi tạo validator và formatter
            self.validator = PromptValidator(
                max_message_length=2000,
                max_history_length=10
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
                        self.config['GEMINI_API_KEY'][:10],
                        self.config['GEMINI_API_KEY'][-4:])
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
        instruction_type: str = 'default',
        history_service = None
    ) -> ChatSession:
        """
        Lấy hoặc tạo chat session cho conversation
        
        Args:
            conversation_id: ID của conversation
            instruction_type: Loại system instruction
            history_service: ChatHistoryService để lấy lịch sử từ DB (optional)
            
        Returns:
            ChatSession instance
        """
        with self._sessions_lock:
            if conversation_id not in self._chat_sessions:
                system_instruction = SYSTEM_INSTRUCTIONS.get(
                    instruction_type,
                    SYSTEM_INSTRUCTIONS['default']
                )
                
                # Lấy lịch sử từ database
                initial_history = []
                if history_service:
                    try:
                        db_messages = history_service.get_conversation_history(conversation_id, limit=50)
                        # Convert DB format sang format cần cho ChatSession
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
                    client=self.client,
                    model_id=self.model_id,
                    config=self.config,
                    system_instruction=system_instruction,
                    initial_history=initial_history
                )
                
                logger.info("Created chat session for conversation %s with %d history messages", conversation_id, len(initial_history))
            
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
        instruction_type: str = 'default',
        history_service = None,
        latency_ms: int = 0,
        patron_id: Optional[str] = None,
        auto_inject_koha_context: bool = True
    ) -> str:
        """
        Tạo response sử dụng chat session (có memory)
        
        Args:
            conversation_id: ID của conversation
            user_message: Tin nhắn từ người dùng
            instruction_type: Loại instruction
            history_service: ChatHistoryService để lưu/lấy history (optional)
            latency_ms: Độ trễ của request (để lưu vào DB)
            patron_id: ID bạn đọc để lấy thông tin từ Koha (optional)
            auto_inject_koha_context: Tự động thêm context từ Koha khi phát hiện keywords
        
        Returns:
            Response text từ AI
        """
        try:
            # Validate input
            self.validator.validate_message(user_message)
            
            # Tự động inject Koha context nếu cần
            enhanced_message = user_message
            if auto_inject_koha_context:
                koha_context = self._build_koha_context_from_message(user_message, patron_id)
                if koha_context:
                    enhanced_message = f"{user_message}\n\n[THÔNG TIN TỪ THƯ VIỆN KOHA]:\n{koha_context}"
                    logger.debug("Injected Koha context: %d chars", len(koha_context))
            
            # Get or create chat session (với history từ DB nếu có)
            chat_session = self.get_or_create_chat_session(
                conversation_id, 
                instruction_type,
                history_service
            )
            
            # Send message through session (history tự động được lưu trong session memory)
            logger.debug("Sending message to chat session %s", conversation_id)
            response_text = chat_session.send_message(enhanced_message)
            
            if not response_text or not response_text.strip():
                logger.warning("Empty response text")
                raise EmptyResponseError("AI trả về nội dung trống")
            
            # Lưu vào database nếu có history_service (chỉ lưu message gốc, không lưu context)
            if history_service:
                try:
                    history_service.save_chat_exchange(
                        conversation_id=conversation_id,
                        user_message=user_message,  # Lưu message gốc
                        assistant_message=response_text,
                        latency_ms=latency_ms
                    )
                    logger.debug("Saved exchange to DB for conversation %s", conversation_id)
                except Exception as db_error:
                    logger.warning(f"Failed to save to DB: {str(db_error)}")
                    # Continue even if DB save fails
            
            logger.info("Generated response: %d characters (with session)", len(response_text))
            return response_text.strip()
                
        except (ValidationError, EmptyResponseError):
            raise
        except Exception as e:
            logger.error("Error in generate_response_with_session: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e
    
    def _build_koha_context_from_message(self, user_message: str, patron_id: Optional[str] = None) -> str:
        """
        Tự động xây dựng Koha context dựa trên nội dung message
        
        Args:
            user_message: Message từ user
            patron_id: ID bạn đọc (optional)
            
        Returns:
            Context string hoặc empty string
        """
        try:
            from app.services.prompt.koha_context import (
                build_koha_context_for_patron,
                build_koha_context_for_books,
                build_faq_context
            )
            
            message_lower = user_message.lower()
            context_parts = []
            
            # Keywords để phát hiện nhu cầu
            search_keywords = ['tìm sách', 'tìm kiếm', 'có sách', 'sách về', 'gợi ý sách', 'recommend', 'search']
            borrow_keywords = ['mượn', 'trả', 'đang mượn', 'checkout', 'borrow', 'return', 'quá hạn', 'overdue']
            faq_keywords = ['làm sao', 'làm thế nào', 'hướng dẫn', 'quy định', 'how to', 'faq', 'câu hỏi']
            
            # 1. Thông tin bạn đọc (nếu hỏi về mượn/trả)
            if patron_id and any(keyword in message_lower for keyword in borrow_keywords):
                patron_context = build_koha_context_for_patron(patron_id)
                if patron_context:
                    context_parts.append(patron_context)
            
            # 2. Tìm kiếm sách (nếu có từ khóa tìm kiếm)
            if any(keyword in message_lower for keyword in search_keywords):
                # Extract search query - đơn giản lấy các từ sau keyword
                search_query = self._extract_search_query(user_message)
                if search_query and len(search_query) >= 3:
                    books_context = build_koha_context_for_books(search_query, limit=5)
                    if books_context:
                        context_parts.append(books_context)
            
            # 3. FAQ (nếu hỏi về hướng dẫn/quy định)
            if any(keyword in message_lower for keyword in faq_keywords):
                faq_context = build_faq_context(limit=5)
                if faq_context and 'Không có dữ liệu' not in faq_context:
                    context_parts.append(faq_context)
            
            return "\n\n".join(context_parts) if context_parts else ""
            
        except Exception as e:
            logger.warning(f"Failed to build Koha context: {e}")
            return ""
    
    def _extract_search_query(self, message: str) -> str:
        """
        Trích xuất từ khóa tìm kiếm từ message
        
        Args:
            message: User message
            
        Returns:
            Search query string
        """
        # Đơn giản: lấy các từ có nghĩa, bỏ stop words
        message_lower = message.lower()
        
        # Các từ để loại bỏ
        stop_words = [
            'tìm', 'tìm kiếm', 'sách', 'về', 'cho', 'tôi', 'mình', 'có', 'không',
            'gợi ý', 'đề xuất', 'giúp', 'search', 'find', 'book', 'recommend'
        ]
        
        # Split và filter
        words = message_lower.split()
        query_words = [w for w in words if w not in stop_words and len(w) > 2]
        
        return " ".join(query_words[:3])  # Lấy tối đa 3 từ khóa
    
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
                temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 1000),
                top_p=self.config.get('GEMINI_TOP_P', 0.95),
                top_k=self.config.get('GEMINI_TOP_K', 40),
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

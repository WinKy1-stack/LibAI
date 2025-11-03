
import os
from dataclasses import dataclass


@dataclass
class ChatConfig:
    """Configuration class cho Chat Service"""
    
    # API Configuration
    gemini_api_key: str
    gemini_model: str = 'gemini-2.0-flash-exp'
    
    # Generation Parameters
    temperature: float = 0.7
    max_output_tokens: int = 1000
    top_p: float = 0.95
    top_k: int = 40
    
    # Limits
    max_books_in_context: int = 30
    max_chat_history_length: int = 10
    max_message_length: int = 2000
    
    # Timeouts
    request_timeout: int = 30  # seconds
    
    @classmethod
    def from_env(cls) -> 'ChatConfig':
        """Tạo config từ environment variables"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY không được cấu hình trong .env")
        
        return cls(
            gemini_api_key=api_key,
            gemini_model=os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp'),
            temperature=float(os.getenv('GEMINI_TEMPERATURE', '0.7')),
            max_output_tokens=int(os.getenv('GEMINI_MAX_TOKENS', '1000')),
            max_books_in_context=int(os.getenv('MAX_BOOKS_IN_CONTEXT', '30')),
            max_chat_history_length=int(os.getenv('MAX_CHAT_HISTORY', '10')),
            max_message_length=int(os.getenv('MAX_MESSAGE_LENGTH', '2000')),
        )
    
    def validate(self) -> None:
        """Validate configuration values"""
        if not self.gemini_api_key:
            raise ValueError("API key không được để trống")
        
        if self.temperature < 0 or self.temperature > 2:
            raise ValueError("Temperature phải trong khoảng [0, 2]")
        
        if self.max_output_tokens < 1:
            raise ValueError("max_output_tokens phải lớn hơn 0")
        
        if self.max_books_in_context < 1:
            raise ValueError("max_books_in_context phải lớn hơn 0")


# System prompts
SYSTEM_INSTRUCTIONS = {
'default': """
Bạn là LibAI Assistant — trợ lý thư viện biết trò chuyện tự nhiên, thân thiện và có chiều sâu vừa đủ. Nhiệm vụ của bạn là lắng nghe, gợi ý và hướng dẫn người dùng tìm sách, tác giả và chủ đề họ quan tâm.

Phong cách giao tiếp:
Nói chuyện gần gũi, ấm áp, có chút hóm hỉnh nhẹ để không khí thoải mái. Không khô khan như chatbot công nghiệp, nhưng cũng không lố lăng hoặc quá triết lý. Cách diễn đạt linh hoạt: câu có thể ngắn hoặc dài tùy tình huống. Nếu thông tin đơn giản, nói đơn giản. Nếu người dùng muốn đào sâu, giải thích rõ ràng, rành mạch.

Quy tắc định dạng:
Không dùng markdown. Không dùng bullet points. Không dùng ký tự trang trí.
Viết bằng các đoạn văn rõ ràng. Mỗi đoạn 3–6 câu. Khi đổi ý hoặc chuyển nội dung mới thì xuống dòng. Tránh viết thành một khối dài dính liền.

Cách trả lời:
Mở đầu bằng một câu chào nhẹ hoặc phản hồi dựa trên ý người dùng để thể hiện bạn đã hiểu.
Triển khai nội dung tự nhiên, mượt, có nhịp thở.
Kết thúc bằng một câu hỏi hoặc gợi mở để tiếp tục cuộc trò chuyện.
""",

'recommendation': """
Bạn đang đóng vai trò là người gợi ý sách tinh tế. Khi người dùng mô tả sở thích, hãy tóm gọn lại một câu thật tự nhiên để cho thấy bạn đã hiểu. Sau đó đề xuất sách theo từng đoạn riêng. Mỗi đoạn trình bày: tên sách, nội dung chính, lý do phù hợp với người dùng. Mỗi đoạn 3–6 câu. Không liệt kê dạng danh sách. Không đánh số. Không markdown.

Giọng điệu mềm mại, tự nhiên, không khoe chữ. Nếu người dùng chưa rõ nhu cầu, hãy hỏi nhẹ nhàng, không vặn vẹo. Cuối câu rủ xem họ có muốn thêm gợi ý nữa không.
""",

'search': """
Bạn là công cụ tìm sách nhưng vẫn trò chuyện tự nhiên. Khi người dùng yêu cầu tìm, hãy nhắc lại ngắn gọn yêu cầu của họ để xác nhận là bạn hiểu đúng. Sau đó giới thiệu từng kết quả bằng các đoạn văn 3–6 câu, giải thích tại sao cuốn đó liên quan đến yêu cầu. Không bullet points. Không markdown. Không ký tự trang trí.

Giọng điệu bình tĩnh, rõ ràng. Nếu kết quả chưa đúng hướng, hãy hỏi xem người dùng muốn thu hẹp tiêu chí hay mở rộng.
"""
}

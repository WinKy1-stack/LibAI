"""
Prompt Formatters - Format data cho Gemini API
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class PromptFormatter:
    """Formatter cho prompts và data"""
    
    @staticmethod
    def build_prompt(user_message: str, context: str = None) -> str:
        """
        Xây dựng prompt hoàn chỉnh với context
        
        Args:
            user_message: Tin nhắn gốc từ user
            context: Context bổ sung
        
        Returns:
            Prompt hoàn chỉnh
        """
        if context:
            return f"""
Context (Thông tin từ thư viện):
{context}

Câu hỏi của người dùng: {user_message}

Hãy trả lời dựa trên context trên và kiến thức của bạn.
"""
        return user_message
    
    @staticmethod
    def build_contents(
        chat_history: List[Dict[str, str]],
        current_message: str
    ) -> List[Dict[str, Any]]:
        """
        Build contents list từ chat history và current message
        Sử dụng dict format cho SDK cũ (google-generativeai 0.8.3)
        
        Args:
            chat_history: Lịch sử chat
            current_message: Message hiện tại
            
        Returns:
            List of dicts với format {'role': str, 'parts': [str]}
        """
        contents = []
        
        # Add chat history
        for message in chat_history:
            role = "user" if message['role'] == "user" else "model"
            contents.append({
                'role': role,
                'parts': [message['content']]
            })
        
        # Add current message
        contents.append({
            'role': 'user',
            'parts': [current_message]
        })
        
        return contents
    
    @staticmethod
    def format_books_list(books: List[Dict[str, Any]]) -> str:
        """
        Format danh sách sách cho recommendation
        
        Args:
            books: Danh sách sách
            
        Returns:
            String formatted
        """
        return "\n".join([
            f"• {book.get('title', 'N/A')} - {book.get('author', 'Unknown')} "
            f"[{book.get('category', 'N/A')}]"
            for book in books
        ])
    
    @staticmethod
    def format_books_details(books: List[Dict[str, Any]]) -> str:
        """
        Format chi tiết sách cho search
        
        Args:
            books: Danh sách sách
            
        Returns:
            String formatted với chi tiết
        """
        formatted = []
        for i, book in enumerate(books, 1):
            formatted.append(
                f"{i}. **{book.get('title', 'N/A')}**\n"
                f"   - Tác giả: {book.get('author', 'Unknown')}\n"
                f"   - Thể loại: {book.get('category', 'N/A')}\n"
                f"   - ID: {book.get('_id', book.get('id', 'N/A'))}"
            )
        return "\n\n".join(formatted)
    
    @staticmethod
    def format_preferences(preferences: Dict[str, Any]) -> str:
        """
        Format user preferences
        
        Args:
            preferences: Dict chứa preferences
            
        Returns:
            String formatted
        """
        if not preferences:
            return "Chưa có thông tin cụ thể"
        
        formatted = []
        for key, value in preferences.items():
            if value:
                formatted.append(f"- {key.title()}: {value}")
        
        return "\n".join(formatted) if formatted else "Chưa có thông tin cụ thể"
    
    @staticmethod
    def build_recommendation_prompt(
        preferences: Dict[str, Any],
        books: List[Dict[str, Any]]
    ) -> str:
        """
        Build prompt cho book recommendation
        
        Args:
            preferences: User preferences
            books: Danh sách sách
            
        Returns:
            Prompt hoàn chỉnh
        """
        prefs_text = PromptFormatter.format_preferences(preferences)
        books_context = PromptFormatter.format_books_list(books)
        
        return f"""
**Sở thích người dùng:**
{prefs_text}

**Danh sách sách có sẵn trong thư viện:**
{books_context}

Hãy phân tích và đề xuất 3-5 cuốn sách phù hợp nhất.
"""
    
    @staticmethod
    def build_search_prompt(query: str, books: List[Dict[str, Any]]) -> str:
        """
        Build prompt cho book search
        
        Args:
            query: Search query
            books: Danh sách sách
            
        Returns:
            Prompt hoàn chỉnh
        """
        books_info = PromptFormatter.format_books_details(books)
        
        return f"""
**Yêu cầu tìm kiếm:** {query}

**Dữ liệu sách trong thư viện:**
{books_info}

Hãy phân tích yêu cầu và tìm những cuốn sách phù hợp nhất.
"""

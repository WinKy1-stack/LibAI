
class ChatServiceError(Exception):
    """Base exception cho tất cả chat service errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class GeminiAPIError(ChatServiceError):
    """Exception khi gọi Gemini API thất bại"""
    def __init__(self, message: str):
        super().__init__(message, status_code=503)


class InvalidConfigurationError(ChatServiceError):
    """Exception khi configuration không hợp lệ"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)


class ValidationError(ChatServiceError):
    """Exception khi validation dữ liệu thất bại"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class EmptyResponseError(ChatServiceError):
    """Exception khi AI trả về response rỗng"""
    def __init__(self, message: str = "AI không thể tạo phản hồi"):
        super().__init__(message, status_code=500)

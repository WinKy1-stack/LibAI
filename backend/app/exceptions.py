"""
Custom API Exceptions
"""

class ApiError(Exception):
    """Base exception cho tất cả API errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundError(ApiError):
    """Exception khi không tìm thấy tài nguyên"""
    def __init__(self, message: str = "Không tìm thấy tài nguyên"):
        super().__init__(message, status_code=404)

class ValidationError(ApiError):
    """Exception khi validation dữ liệu thất bại"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

class AuthenticationError(ApiError):
    """Exception khi xác thực thất bại"""
    def __init__(self, message: str = "Xác thực thất bại"):
        super().__init__(message, status_code=401)

class GeminiAPIError(ApiError):
    """Exception khi gọi Gemini API thất bại"""
    def __init__(self, message: str):
        super().__init__(message, status_code=503)

class InvalidConfigurationError(ApiError):
    """Exception khi configuration không hợp lệ"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

class EmptyResponseError(ApiError):
    """Exception khi AI trả về response rỗng"""
    def __init__(self, message: str = "AI không thể tạo phản hồi"):
        super().__init__(message, status_code=500)

from __future__ import annotations

from typing import Optional


class ChatServiceError(Exception):
    """Base exception cho mọi lỗi thuộc tầng AI chat service."""

    def __init__(self, message: str, status_code: int = 500, *, details: Optional[dict] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class GeminiAPIError(ChatServiceError):
    """Lỗi trong quá trình tương tác với Gemini / google-genai SDK."""

    def __init__(self, message: str, *, details: Optional[dict] = None):
        super().__init__(message, status_code=503, details=details)


class InvalidConfigurationError(ChatServiceError):
    """Lỗi cấu hình khi khởi tạo client/pipeline."""

    def __init__(self, message: str, *, details: Optional[dict] = None):
        super().__init__(message, status_code=500, details=details)


class ValidationError(ChatServiceError):
    """Lỗi validate dữ liệu đầu vào/ra."""

    def __init__(self, message: str, *, details: Optional[dict] = None):
        super().__init__(message, status_code=400, details=details)


class EmptyResponseError(ChatServiceError):
    """AI trả về response rỗng hoặc không dùng được."""

    def __init__(self, message: str = "AI không thể tạo phản hồi", *, details: Optional[dict] = None):
        super().__init__(message, status_code=502, details=details)


__all__ = [
    "ChatServiceError",
    "GeminiAPIError",
    "InvalidConfigurationError",
    "ValidationError",
    "EmptyResponseError",
]

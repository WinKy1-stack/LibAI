"""
Services Package - Business logic layer
"""
# Prompt/AI services
from .prompt import (
    PromptService,
    get_prompt_service,
    PromptValidator,
    PromptFormatter
)

# Chat history services
from .history import (
    ConversationManager,
    MessageManager
)

# User services
from .user import UserService

# Shared exceptions
from .exceptions import (
    ChatServiceError,
    GeminiAPIError,
    InvalidConfigurationError,
    ValidationError,
    EmptyResponseError
)

__all__ = [
    # Prompt
    'PromptService',
    'get_prompt_service',
    'PromptValidator',
    'PromptFormatter',

    # History
    'ConversationManager',
    'MessageManager',

    # User
    'UserService',

    # Exceptions
    'ChatServiceError',
    'GeminiAPIError',
    'InvalidConfigurationError',
    'ValidationError',
    'EmptyResponseError'
]

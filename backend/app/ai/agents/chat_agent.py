import logging
from typing import Dict, Any, Generator, Optional

from app.ai.agents.base import BaseAgent
from app.ai.exceptions import GeminiAPIError
from app.ai.tools import ToolRegistry

logger = logging.getLogger(__name__)


class ChatAgent(BaseAgent):
    def __init__(
        self,
        chat_session,
        tool_registry: Optional[ToolRegistry] = None
    ):
        super().__init__(tool_registry)
        self.chat_session = chat_session

    def run(self, message: str, **kwargs) -> str:
        return self.chat_session.send_message(message)

    def run_stream(self, message: str, **kwargs) -> Generator[str, None, None]:
        return self.chat_session.send_message_stream(message)

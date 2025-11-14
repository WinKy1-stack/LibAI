import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Generator

from app.ai.tools import ToolRegistry

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    def __init__(self, tool_registry: ToolRegistry = None):
        self.tool_registry = tool_registry

    @abstractmethod
    def run(self, message: str, **kwargs) -> str:
        pass

    @abstractmethod
    def run_stream(self, message: str, **kwargs) -> Generator[str, None, None]:
        pass

    def has_tools(self) -> bool:
        return self.tool_registry is not None and len(self.tool_registry.get_all()) > 0

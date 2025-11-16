import logging
from typing import Dict, List, Optional
from google.genai import types
from app.ai.tools.base import BaseTool

logger = logging.getLogger(__name__)


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")

    def get(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def get_all(self) -> Dict[str, BaseTool]:
        return self._tools.copy()

    def get_function_declarations(self) -> List[types.Tool]:
        """
        Convert all registered tools to Gemini SDK Tool format
        Returns list of Tool objects containing FunctionDeclarations
        """
        if not self._tools:
            return None

        function_declarations = []
        for tool in self._tools.values():
            func_decl = tool.to_gemini_declaration()
            function_declarations.append(func_decl)
            logger.debug(f"Created FunctionDeclaration for {tool.name}")

        return [types.Tool(function_declarations=function_declarations)]


_global_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    return _global_registry


def register_default_tools():
    from app.ai.tools.book_tools import SearchBooksTool

    registry = get_tool_registry()
    registry.register(SearchBooksTool())

    logger.info("Registered all default tools")

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

    def get_function_declarations(self) -> List[types.FunctionDeclaration]:
        """Trả về list FunctionDeclaration objects cho Gemini SDK"""
        declarations = []
        for tool in self._tools.values():
            decl_dict = tool.to_function_declaration()
            func_decl = types.FunctionDeclaration(
                name=decl_dict['name'],
                description=decl_dict['description'],
                parameters=decl_dict.get('parameters')
            )
            declarations.append(func_decl)
            logger.debug(f"Created FunctionDeclaration for {tool.name}")
        return declarations


_global_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    return _global_registry


def register_default_tools():
    from app.ai.tools.book_tools import SearchBooksTool
    from app.ai.tools.faq_tools import SearchFAQTool, GetFAQCategoriesTool

    registry = get_tool_registry()
    registry.register(SearchBooksTool())
    # registry.register(GetBookDetailsTool())
    registry.register(SearchFAQTool())
    registry.register(GetFAQCategoriesTool())

    logger.info("Registered all default tools")

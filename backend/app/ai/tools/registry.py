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
        if not self._tools:
            return []

        function_declarations = []
        for tool in self._tools.values():
            try:
                func_decl = tool.to_gemini_declaration()
                function_declarations.append(func_decl)
            except Exception as e:
                logger.error(f"Failed to create declaration for {tool.__class__.__name__}: {e}")
                raise
        
        return function_declarations


_global_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    return _global_registry


def register_default_tools():
    from app.ai.tools.book_tools import SearchBooksTool
    from app.ai.tools.faq_tools import SearchFAQTool, GetFAQCategoriesTool
    from app.ai.tools.koha_tools import (
        SearchKohaBooksTool,
        GetKohaBookDetailTool,
        CheckKohaBookAvailabilityTool,
        GetKohaPatronInfoTool,
        GetKohaPatronCheckoutsTool,
        GetKohaPatronHoldsTool,
        GetKohaLibrariesTool,
        TestKohaConnectionTool
    )

    registry = get_tool_registry()
    
    # Register existing tools
    registry.register(SearchBooksTool())
    registry.register(SearchFAQTool())
    registry.register(GetFAQCategoriesTool())
    
    # Register Koha tools
    registry.register(SearchKohaBooksTool())
    registry.register(GetKohaBookDetailTool())
    registry.register(CheckKohaBookAvailabilityTool())
    registry.register(GetKohaPatronInfoTool())
    registry.register(GetKohaPatronCheckoutsTool())
    registry.register(GetKohaPatronHoldsTool())
    registry.register(GetKohaLibrariesTool())
    registry.register(TestKohaConnectionTool())

    logger.info("Registered all default tools")

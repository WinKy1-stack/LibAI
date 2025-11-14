"""
Gemini Function Calling Tools
Define các tools mà AI có thể gọi
"""
from google.genai import types
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


def get_library_tools():
    """
    Định nghĩa tools cho LibAI Assistant
    CHỈ CÓ 1 TOOL: search_books
    
    Returns:
        List of Tool definitions
    """
    return [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="search_books",
                    description="""Tìm kiếm sách trong thư viện (Local DB + Z39.50).
                    Dùng tool này khi user:
                    - Hỏi tìm sách: "Tìm sách Python", "Có sách về AI không?"
                    - Gợi ý sách: "Gợi ý sách lập trình"
                    - Hỏi về tên sách cụ thể: "Python Crash Course"
                    
                    Tool sẽ tìm trong:
                    1. Local MongoDB database (nhanh)
                    2. Z39.50 LOC & UW (nếu không đủ)
                    
                    Trả về tối thiểu 4 cuốn sách phù hợp.""",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "query": types.Schema(
                                type=types.Type.STRING,
                                description="Từ khóa tìm kiếm (VD: 'Python', 'lập trình', 'văn học')"
                            )
                        },
                        required=["query"]
                    )
                )
            ]
        )
    ]


# ==================== TOOL EXECUTORS ====================

def execute_search_books(query: str) -> Dict[str, Any]:
    """
    Execute search_books tool
    
    Args:
        query: Search query string
        
    Returns:
        Dict với results
    """
    try:
        from app.services.prompt.search_helper import search_books_multi_source
        
        logger.info(f"🔧 [TOOL] Executing search_books(query='{query}')")
        
        books_data = search_books_multi_source(query, min_results=4)
        
        logger.info(f"🔧 [TOOL] Found {len(books_data)} books")
        
        return {
            "success": True,
            "query": query,
            "total_found": len(books_data),
            "books": books_data
        }
        
    except Exception as e:
        logger.error(f"Error executing search_books: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "books": []
        }


# Tool executor mapping - CHỈ CÓ search_books
TOOL_EXECUTORS = {
    "search_books": execute_search_books,
}


def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute tool by name
    
    Args:
        tool_name: Name of the tool
        arguments: Tool arguments
        
    Returns:
        Tool execution result
    """
    if tool_name not in TOOL_EXECUTORS:
        logger.error(f"Unknown tool: {tool_name}")
        return {
            "success": False,
            "error": f"Tool '{tool_name}' not found"
        }
    
    executor = TOOL_EXECUTORS[tool_name]
    return executor(**arguments)


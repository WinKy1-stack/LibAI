import logging
from typing import List, Dict, Any
from app.ai.tools.base import BaseTool, ToolResult

logger = logging.getLogger(__name__)


class SearchBooksTool(BaseTool):
    @property
    def name(self) -> str:
        return "search_books"

    @property
    def description(self) -> str:
        return """Tìm kiếm sách trong thư viện (Local DB + Z39.50).
        Dùng tool này khi user:
        - Hỏi tìm sách: "Tìm sách Python", "Có sách về AI không?"
        - Gợi ý sách: "Gợi ý sách lập trình"
        - Hỏi về tên sách cụ thể: "Python Crash Course"

        Tool sẽ tìm trong:
        1. Local MongoDB database (nhanh)
        2. Z39.50 LOC & UW (nếu không đủ)

        Trả về tối thiểu 4 cuốn sách phù hợp."""

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm (VD: 'Python', 'lập trình', 'văn học')"
                }
            },
            "required": ["query"]
        }

    def execute(self, query: str) -> ToolResult:
        """
        Execute search_books tool
        Searches from Local DB first, then Z39.50 if needed
        """
        try:
            from app.ai.pipelines.prompt.search_helper import search_books_multi_source

            logger.info(f"🔧 [TOOL] Executing search_books(query='{query}')")

            books_data = search_books_multi_source(query, min_results=4)

            logger.info(f"🔧 [TOOL] Found {len(books_data)} books")

            return ToolResult(
                success=True,
                data={
                    "query": query,
                    "total_found": len(books_data),
                    "books": books_data
                }
            )

        except Exception as e:
            logger.error(f"Error executing search_books: {str(e)}")
            return ToolResult(success=False, error=str(e))


# class GetBookDetailsTool(BaseTool):
    #TODO: Bật lại khi có collection MARC_RECORDS trong MongoDB

#     @property
#     def name(self) -> str:
#         return "get_book_details"

#     @property
#     def description(self) -> str:
#         return "Lấy thông tin chi tiết của một cuốn sách theo record_id"

#     @property
#     def parameters(self) -> Dict[str, Any]:
#         return {
#             "type": "object",
#             "properties": {
#                 "record_id": {
#                     "type": "string",
#                     "description": "ID của bản ghi sách"
#                 }
#             },
#             "required": ["record_id"]
#         }

#     def execute(self, record_id: str) -> ToolResult:
#         try:
#             from flask import current_app
#             from app import mongo

#             collection = mongo.db[current_app.config['COLLECTION_MARC_RECORDS']]
#             book = collection.find_one({"record_id": record_id}, {"_id": 0})

#             if not book:
#                 return ToolResult(success=False, error=f"Không tìm thấy sách với ID: {record_id}")

#             logger.info(f"Retrieved book details for: {record_id}")
#             return ToolResult(success=True, data=book)

#         except Exception as e:
#             logger.error(f"Error getting book details: {str(e)}")
#             return ToolResult(success=False, error=str(e))

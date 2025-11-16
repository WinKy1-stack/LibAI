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

        Lưu ý quan trọng:
        - Từ khóa tìm kiếm nên dùng tiếng Anh để có kết quả tốt nhất
        - Nếu user hỏi bằng tiếng Việt, hãy chuyển đổi sang tiếng Anh trước khi tìm kiếm
        - VD: "sách lập trình" -> "programming", "sách văn học" -> "literature"

        Tool sẽ tìm trong:
        1. Local MongoDB database (nhanh)
        2. Z39.50 LOC & UW (nếu không đủ)

        Trả về chính xác 4 cuốn sách phù hợp."""

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm bằng tiếng Anh để có kết quả tốt nhất. Nếu user hỏi bằng tiếng Việt, hãy chuyển đổi sang tiếng Anh trước khi tìm. VD: 'Python', 'programming', 'literature', 'artificial intelligence'. Tránh dùng tiếng Việt như 'lập trình', 'văn học'."
                }
            },
            "required": ["query"]
        }

    def execute(self, query: str) -> ToolResult:
        """
        Execute search_books tool
        Searches from Local DB first, then Z39.50 if needed
        Returns exactly 4 books
        """
        try:
            from app.ai.pipelines.prompt.search_helper import search_books_multi_source

            logger.info(f"[TOOL] Executing search_books(query='{query}')")
            books_data = search_books_multi_source(query, limit=4)

            logger.info(f"[TOOL] Found {len(books_data)} books")

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

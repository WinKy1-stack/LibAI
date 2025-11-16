import logging
import random
from typing import List, Dict, Any
from app.ai.tools.base import BaseTool, ToolResult

logger = logging.getLogger(__name__)


class SearchBooksTool(BaseTool):
    @property
    def name(self) -> str:
        return "search_books"

    @property
    def description(self) -> str:
        return "Tìm kiếm sách trong thư viện theo từ khóa, tác giả, hoặc chủ đề"

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm (tên sách, tác giả, chủ đề)"
                },
                "limit": {
                    "type": "integer",
                    "description": "Số lượng kết quả tối đa (mặc định 10)",
                    "default": 10
                }
            },
            "required": ["query"]
        }

    def execute(self, query: str, limit: int = 10) -> ToolResult:
        try:
            from app.ai.tools.schemas import SearchBooksResponse, BookDetails
            
            books = [
                {
                    "id": 1,
                    "title": f"Trí Tuệ Nhân Tạo Đỉnh Cao - {query}",
                    "author": "Nguyễn Văn A",
                    "accuracy": round(random.uniform(0.8, 1.0), 2),
                    "source": "Mock DB"
                },
                {
                    "id": 2,
                    "title": f"Python Cho Người Mới Bắt Đầu - {query}",
                    "author": "Trần B",
                    "accuracy": round(random.uniform(0.7, 0.95), 2),
                    "source": "Mock DB"
                },
                {
                    "id": 3,
                    "title": f"Lập Trình Nâng Cao với {query}",
                    "author": "Lê C",
                    "accuracy": round(random.uniform(0.75, 0.9), 2),
                    "source": "Mock DB"
                }
            ][:limit]
            
            book_details = [BookDetails(**book) for book in books]
            response = SearchBooksResponse(
                text=f"Bạn vừa tìm: {query}. Đây là danh sách sách liên quan.",
                books=book_details
            )
            
            logger.info(f"Found {len(books)} books for query: {query}")
            return ToolResult(success=True, data=response.model_dump())

        except Exception as e:
            logger.error(f"Error searching books: {str(e)}")
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

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
            from flask import current_app
            from app import mongo

            collection = mongo.db[current_app.config['COLLECTION_MARC_RECORDS']]

            results = list(collection.find(
                {
                    "$or": [
                        {"title.main": {"$regex": query, "$options": "i"}},
                        {"contributors.name": {"$regex": query, "$options": "i"}},
                        {"subjects": {"$regex": query, "$options": "i"}}
                    ]
                },
                {"_id": 0, "record_id": 1, "title": 1, "contributors": 1, "publication": 1}
            ).limit(limit))

            logger.info(f"Found {len(results)} books for query: {query}")
            return ToolResult(success=True, data=results)

        except Exception as e:
            logger.error(f"Error searching books: {str(e)}")
            return ToolResult(success=False, error=str(e))


class GetBookDetailsTool(BaseTool):
    @property
    def name(self) -> str:
        return "get_book_details"

    @property
    def description(self) -> str:
        return "Lấy thông tin chi tiết của một cuốn sách theo record_id"

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "record_id": {
                    "type": "string",
                    "description": "ID của bản ghi sách"
                }
            },
            "required": ["record_id"]
        }

    def execute(self, record_id: str) -> ToolResult:
        try:
            from flask import current_app
            from app import mongo

            collection = mongo.db[current_app.config['COLLECTION_MARC_RECORDS']]
            book = collection.find_one({"record_id": record_id}, {"_id": 0})

            if not book:
                return ToolResult(success=False, error=f"Không tìm thấy sách với ID: {record_id}")

            logger.info(f"Retrieved book details for: {record_id}")
            return ToolResult(success=True, data=book)

        except Exception as e:
            logger.error(f"Error getting book details: {str(e)}")
            return ToolResult(success=False, error=str(e))

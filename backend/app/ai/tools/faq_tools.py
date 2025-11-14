import logging
from typing import Dict, Any
from app.ai.tools.base import BaseTool, ToolResult

logger = logging.getLogger(__name__)


class SearchFAQTool(BaseTool):
    @property
    def name(self) -> str:
        return "search_faq"

    @property
    def description(self) -> str:
        return "Tìm kiếm câu hỏi thường gặp (FAQ) theo từ khóa hoặc danh mục"

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "search": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm trong câu hỏi, câu trả lời, hoặc tags. VD: 'phạt', 'trễ hạn', 'mượn sách'"
                },
                "category": {
                    "type": "string",
                    "description": "Danh mục FAQ: 'general' (thông tin chung), 'borrowing' (mượn sách), 'policies' (quy định), 'services' (dịch vụ), 'membership' (thành viên)",
                    "enum": ["general", "borrowing", "policies", "services", "membership"]
                },
                "limit": {
                    "type": "integer",
                    "description": "Số lượng kết quả tối đa",
                    "default": 10,
                    "minimum": 1,
                    "maximum": 50
                }
            }
        }

    def execute(self, search: str = None, category: str = None, limit: int = 10) -> ToolResult:
        try:
            from flask import current_app
            from app import mongo
            from app.models.mongodb_schemas import FAQStatus

            logger.info(f"SearchFAQTool called with: search='{search}', category='{category}', limit={limit}")

            collection = mongo.db['faq']
            
            query = {'status': FAQStatus.PUBLISHED.value}
            
            if category:
                query['category'] = category
                logger.debug(f"Added category filter: {category}")
            
            if search:
                query['$or'] = [
                    {'question': {'$regex': search, '$options': 'i'}},
                    {'answer': {'$regex': search, '$options': 'i'}},
                    {'tags': {'$regex': search, '$options': 'i'}}
                ]
                logger.debug(f"Added search filter: {search}")

            logger.debug(f"MongoDB query: {query}")

            results = list(collection.find(
                query,
                {'_id': 0, 'question': 1, 'answer': 1, 'category': 1, 'tags': 1}
            ).limit(limit))

            logger.info(f"Found {len(results)} FAQ entries")
            if results:
                logger.debug(f"First result: {results[0]}")
            
            return ToolResult(success=True, data=results)

        except Exception as e:
            logger.error(f"Error searching FAQ: {str(e)}")
            return ToolResult(success=False, error=str(e))


class GetFAQCategoriesTool(BaseTool):
    @property
    def name(self) -> str:
        return "get_faq_categories"

    @property
    def description(self) -> str:
        return "Lấy tất cả các danh mục FAQ có sẵn trong hệ thống (general, borrowing, policies, services, membership)"

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {}
        }

    def execute(self) -> ToolResult:
        try:
            from app import mongo
            from app.models.mongodb_schemas import FAQStatus

            logger.info("GetFAQCategoriesTool called")

            collection = mongo.db['faq']
            
            categories = collection.distinct('category', {'status': FAQStatus.PUBLISHED.value})
            
            logger.info(f"Found {len(categories)} FAQ categories: {categories}")
            return ToolResult(success=True, data={'categories': categories})

        except Exception as e:
            logger.error(f"Error getting FAQ categories: {str(e)}")
            return ToolResult(success=False, error=str(e))

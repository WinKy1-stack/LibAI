import logging
import re
from typing import Dict, Any, List
from app.ai.tools.base import BaseTool, ToolResult

logger = logging.getLogger(__name__)


class SearchFAQTool(BaseTool):
    @property
    def name(self) -> str:
        return "search_faq"

    @property
    def description(self) -> str:
        return """Tìm kiếm câu hỏi thường gặp (FAQ) thông minh với sắp xếp theo độ liên quan.
        Tool này tìm kiếm trong câu hỏi, câu trả lời và tags, ưu tiên kết quả có từ khóa trong câu hỏi và tags.
        Dùng khi user hỏi về quy định, chính sách, hoặc thông tin thư viện."""

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "search": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm. Có thể là một từ hoặc nhiều từ. VD: 'mượn sách', 'thời gian mượn', 'phạt trễ hạn', 'giới hạn số lượng'"
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
            from app import mongo
            from app.models.mongodb_schemas import FAQStatus

            logger.info(f"SearchFAQTool called with: search='{search}', category='{category}', limit={limit}")

            collection = mongo.db['faq']
            
            base_query = {'status': FAQStatus.PUBLISHED.value}
            
            if category:
                base_query['category'] = category
            
            if not search or not search.strip():
                results = list(collection.find(
                    base_query,
                    {'_id': 0, 'question': 1, 'answer': 1, 'category': 1, 'tags': 1, 'priority': 1}
                ).sort([('priority', -1), ('updated_at', -1)]).limit(limit))
                
                logger.info(f"Found {len(results)} FAQ entries (no search)")
                return ToolResult(success=True, data=results)

            search_terms = self._extract_search_terms(search)
            results = self._smart_search(collection, base_query, search_terms, limit)
            
            logger.info(f"Found {len(results)} FAQ entries")
            return ToolResult(success=True, data=results)

        except Exception as e:
            logger.error(f"Error searching FAQ: {str(e)}")
            return ToolResult(success=False, error=str(e))

    def _extract_search_terms(self, search: str) -> List[str]:
        """Tách từ khóa thành các từ riêng lẻ, loại bỏ từ dừng"""
        search = search.strip().lower()
        stop_words = {'của', 'và', 'hoặc', 'là', 'có', 'được', 'cho', 'với', 'từ', 'về', 'theo', 'trong', 'này', 'đó', 'các', 'những'}
        
        words = re.findall(r'\b\w+\b', search)
        terms = [w for w in words if w not in stop_words and len(w) > 1]
        
        if not terms:
            terms = [search]
        
        return terms

    def _smart_search(self, collection, base_query: Dict, search_terms: List[str], limit: int) -> List[Dict]:
        """Tìm kiếm thông minh với scoring theo độ liên quan"""
        search_query = base_query.copy()
        
        or_conditions = []
        for term in search_terms:
            or_conditions.extend([
                {'question': {'$regex': term, '$options': 'i'}},
                {'answer': {'$regex': term, '$options': 'i'}},
                {'tags': {'$regex': term, '$options': 'i'}}
            ])
        
        if or_conditions:
            search_query['$or'] = or_conditions
        
        docs = list(collection.find(
            search_query,
            {'_id': 1, 'question': 1, 'answer': 1, 'category': 1, 'tags': 1, 'priority': 1}
        ))
        
        scored_results = []
        for doc in docs:
            question = doc.get('question', '')
            answer = doc.get('answer', '')
            tags = doc.get('tags', [])
            priority = doc.get('priority', 0)
            
            question_lower = question.lower()
            answer_lower = answer.lower()
            tags_lower = [t.lower() for t in tags]
            
            score = 0
            for term in search_terms:
                term_lower = term.lower()
                
                if term_lower in question_lower:
                    score += 10
                    if question_lower.startswith(term_lower):
                        score += 5
                    if question_lower.endswith(term_lower):
                        score += 3
                
                if term_lower in answer_lower:
                    score += 5
                
                if any(term_lower in tag for tag in tags_lower):
                    score += 8
            
            scored_results.append({
                'question': question,
                'answer': answer,
                'category': doc.get('category', ''),
                'tags': tags,
                'score': score,
                'priority': priority
            })
        
        sorted_results = sorted(
            scored_results,
            key=lambda x: (x['score'], x['priority']),
            reverse=True
        )
        
        final_results = []
        for result in sorted_results[:limit]:
            final_results.append({
                'question': result['question'],
                'answer': result['answer'],
                'category': result['category'],
                'tags': result['tags']
            })
        
        return final_results


class GetFAQCategoriesTool(BaseTool):
    @property
    def name(self) -> str:
        return "get_faq_categories"

    @property
    def description(self) -> str:
        return "Lấy tất cả các danh mục FAQ có sẵn trong hệ thống (general, borrowing, policies, services, membership)"

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {},
            "required": []
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

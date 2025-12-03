import logging
from typing import Dict, Any, Optional
from app.ai.tools.base import BaseTool, ToolResult
from app.services.koha import KohaClient

logger = logging.getLogger(__name__)


class SearchKohaBooksTool(BaseTool):
    """AI tool to search for books in Koha catalog"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "search_koha_books"
    
    @property
    def description(self) -> str:
        return """Tìm kiếm sách trong hệ thống thư viện Koha ILS.
        
        Dùng tool này khi user:
        - Tìm kiếm sách trong thư viện Koha
        - Kiểm tra sách có sẵn trong catalog
        - Hỏi về sách cụ thể trong thư viện
        
        Tool sẽ tìm kiếm trong toàn bộ catalog của Koha và trả về thông tin chi tiết về các sách phù hợp.
        Hỗ trợ tìm theo: tiêu đề, tác giả, ISBN, chủ đề."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm (tiêu đề sách, tác giả, ISBN, etc.)"
                },
                "limit": {
                    "type": "integer",
                    "description": "Số lượng kết quả tối đa (mặc định: 10)",
                    "default": 10
                },
                "search_field": {
                    "type": "string",
                    "description": "Trường cụ thể để tìm: title (tiêu đề), author (tác giả), isbn (mã ISBN). Không bắt buộc, bỏ qua nếu muốn tìm tất cả các trường"
                }
            },
            "required": ["query"]
        }
    
    def execute(self, query: str, limit: int = 10, search_field: Optional[str] = None) -> ToolResult:
        """Search for books in Koha catalog"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info(f"Searching Koha books: query='{query}', limit={limit}, field={search_field}")
            
            result = self.koha_client.search_books(
                query=query,
                limit=limit,
                search_field=search_field
            )
            
            if result['status'] == 'success' and result['results']:
                books = result['results']
                return ToolResult(
                    success=True,
                    data={
                        'books': books,
                        'total': result['total'],
                        'query': query,
                        'message': f"Tìm thấy {result['total']} sách trong Koha với từ khóa '{query}'"
                    }
                )
            else:
                return ToolResult(
                    success=False,
                    data={'books': [], 'total': 0},
                    error=f"Không tìm thấy sách nào với từ khóa '{query}' trong Koha"
                )
                
        except Exception as e:
            logger.error(f"Error searching Koha books: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi tìm kiếm sách trong Koha: {str(e)}"
            )


class GetKohaBookDetailTool(BaseTool):
    """AI tool to get detailed information about a specific book"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "get_koha_book_detail"
    
    @property
    def description(self) -> str:
        return """Lấy thông tin chi tiết về một cuốn sách cụ thể trong Koha.
        
        Dùng tool này khi cần:
        - Thông tin đầy đủ về một cuốn sách
        - Chi tiết về tác giả, nhà xuất bản, mô tả
        - Thông tin vật lý của sách
        
        Cần có biblio_id (ID bản ghi thư mục) của sách."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "biblio_id": {
                    "type": "integer",
                    "description": "ID bản ghi thư mục (bibliographic record ID) của sách trong Koha"
                }
            },
            "required": ["biblio_id"]
        }
    
    def execute(self, biblio_id: int) -> ToolResult:
        """Get detailed information about a book"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info(f"Getting Koha book detail for biblio_id: {biblio_id}")
            
            result = self.koha_client.get_book_detail(biblio_id)
            
            if result['status'] == 'success' and result['book']:
                return ToolResult(
                    success=True,
                    data={'book': result['book']}
                )
            else:
                return ToolResult(
                    success=False,
                    data={},
                    error=f"Không tìm thấy sách với ID {biblio_id}"
                )
                
        except Exception as e:
            logger.error(f"Error getting Koha book detail: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi lấy thông tin sách: {str(e)}"
            )


class CheckKohaBookAvailabilityTool(BaseTool):
    """AI tool to check if a book is available for checkout"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "check_koha_book_availability"
    
    @property
    def description(self) -> str:
        return """Kiểm tra tình trạng sẵn có của sách trong Koha.
        
        Dùng tool này khi user hỏi:
        - "Sách này còn không?"
        - "Có thể mượn sách này được không?"
        - "Sách này có sẵn không?"
        
        Trả về số lượng bản sao có sẵn và tổng số bản sao."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "biblio_id": {
                    "type": "integer",
                    "description": "ID bản ghi thư mục của sách"
                }
            },
            "required": ["biblio_id"]
        }
    
    def execute(self, biblio_id: int) -> ToolResult:
        """Check book availability"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info(f"Checking availability for biblio_id: {biblio_id}")
            
            result = self.koha_client.get_item_availability(biblio_id)
            
            if result['status'] == 'success':
                available = result['available_items']
                total = result['total_items']
                
                status_msg = f"Sách có {available}/{total} bản có sẵn để mượn" if available > 0 else "Sách hiện đã hết"
                
                return ToolResult(
                    success=True,
                    data={
                        'available': available,
                        'total': total,
                        'items': result.get('items', []),
                        'status_message': status_msg
                    }
                )
            else:
                return ToolResult(
                    success=False,
                    data={},
                    error=result.get('message', 'Không thể kiểm tra tình trạng sách')
                )
                
        except Exception as e:
            logger.error(f"Error checking availability: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi kiểm tra tình trạng sách: {str(e)}"
            )


class GetKohaPatronInfoTool(BaseTool):
    """AI tool to get patron (user) information"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "get_koha_patron_info"
    
    @property
    def description(self) -> str:
        return """Lấy thông tin về bạn đọc (người dùng) trong Koha.
        
        Dùng tool này khi cần:
        - Thông tin cá nhân của bạn đọc
        - Kiểm tra trạng thái tài khoản
        - Xem ngày hết hạn thẻ
        
        Cần có patron_id (ID bạn đọc)."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "patron_id": {
                    "type": "integer",
                    "description": "ID bạn đọc trong hệ thống Koha"
                }
            },
            "required": ["patron_id"]
        }
    
    def execute(self, patron_id: int) -> ToolResult:
        """Get patron information"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info(f"Getting patron info for patron_id: {patron_id}")
            
            result = self.koha_client.get_patron_info(patron_id)
            
            if result['status'] == 'success' and result['patron']:
                return ToolResult(
                    success=True,
                    data={'patron': result['patron']}
                )
            else:
                return ToolResult(
                    success=False,
                    data={},
                    error=f"Không tìm thấy bạn đọc với ID {patron_id}"
                )
                
        except Exception as e:
            logger.error(f"Error getting patron info: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi lấy thông tin bạn đọc: {str(e)}"
            )


class GetKohaPatronCheckoutsTool(BaseTool):
    """AI tool to get list of books currently checked out by a patron"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "get_koha_patron_checkouts"
    
    @property
    def description(self) -> str:
        return """Xem danh sách sách đang mượn của bạn đọc.
        
        Dùng tool này khi user hỏi:
        - "Tôi đang mượn sách gì?"
        - "Xem sách đang mượn"
        - "Sách nào sắp hết hạn?"
        
        Trả về danh sách tất cả sách đang mượn với ngày hết hạn."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "patron_id": {
                    "type": "integer",
                    "description": "ID bạn đọc"
                }
            },
            "required": ["patron_id"]
        }
    
    def execute(self, patron_id: int) -> ToolResult:
        """Get patron's current checkouts"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info(f"Getting checkouts for patron_id: {patron_id}")
            
            result = self.koha_client.get_patron_checkouts(patron_id)
            
            if result['status'] == 'success':
                count = result['total_checkouts']
                checkouts = result['checkouts']
                
                if count > 0:
                    msg = f"Bạn đọc đang mượn {count} cuốn sách"
                else:
                    msg = "Bạn đọc không có sách đang mượn"
                
                return ToolResult(
                    success=True,
                    data={
                        'checkouts': checkouts,
                        'total': count,
                        'status_message': msg
                    }
                )
            else:
                return ToolResult(
                    success=False,
                    data={},
                    error=result.get('message', 'Không thể lấy danh sách sách đang mượn')
                )
                
        except Exception as e:
            logger.error(f"Error getting checkouts: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi lấy danh sách sách đang mượn: {str(e)}"
            )


class GetKohaPatronHoldsTool(BaseTool):
    """AI tool to get list of holds/reservations by a patron"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "get_koha_patron_holds"
    
    @property
    def description(self) -> str:
        return """Xem danh sách sách đã đặt trước của bạn đọc.
        
        Dùng tool này khi user hỏi:
        - "Tôi đã đặt trước sách gì?"
        - "Xem sách đang giữ"
        - "Sách tôi đặt có sẵn chưa?"
        
        Trả về danh sách tất cả sách đã đặt trước với trạng thái."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "patron_id": {
                    "type": "integer",
                    "description": "ID bạn đọc"
                }
            },
            "required": ["patron_id"]
        }
    
    def execute(self, patron_id: int) -> ToolResult:
        """Get patron's holds"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info(f"Getting holds for patron_id: {patron_id}")
            
            result = self.koha_client.get_patron_holds(patron_id)
            
            if result['status'] == 'success':
                count = result['total_holds']
                holds = result['holds']
                
                if count > 0:
                    msg = f"Bạn đọc có {count} sách đã đặt trước"
                else:
                    msg = "Bạn đọc không có sách đặt trước nào"
                
                return ToolResult(
                    success=True,
                    data={
                        'holds': holds,
                        'total': count,
                        'status_message': msg
                    }
                )
            else:
                return ToolResult(
                    success=False,
                    data={},
                    error=result.get('message', 'Không thể lấy danh sách sách đặt trước')
                )
                
        except Exception as e:
            logger.error(f"Error getting holds: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi lấy danh sách sách đặt trước: {str(e)}"
            )


class GetKohaLibrariesTool(BaseTool):
    """AI tool to get list of all library branches"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "get_koha_libraries"
    
    @property
    def description(self) -> str:
        return """Xem danh sách tất cả các thư viện/chi nhánh trong hệ thống Koha.
        
        Dùng tool này khi user hỏi:
        - "Có những thư viện nào?"
        - "Danh sách chi nhánh thư viện"
        - "Thư viện nào gần tôi?"
        
        Trả về thông tin về tất cả các thư viện/chi nhánh."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {}
        }
    
    def execute(self) -> ToolResult:
        """Get list of all libraries"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info("Getting list of Koha libraries")
            
            result = self.koha_client.get_libraries()
            
            if result['status'] == 'success':
                count = result['total_libraries']
                libraries = result['libraries']
                
                return ToolResult(
                    success=True,
                    data={
                        'libraries': libraries,
                        'total': count,
                        'status_message': f"Hệ thống có {count} thư viện/chi nhánh"
                    }
                )
            else:
                return ToolResult(
                    success=False,
                    data={},
                    error=result.get('message', 'Không thể lấy danh sách thư viện')
                )
                
        except Exception as e:
            logger.error(f"Error getting libraries: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi lấy danh sách thư viện: {str(e)}"
            )


class TestKohaConnectionTool(BaseTool):
    """AI tool to test connection to Koha"""
    
    def __init__(self):
        super().__init__()
        self.koha_client = None
    
    @property
    def name(self) -> str:
        return "test_koha_connection"
    
    @property
    def description(self) -> str:
        return """Kiểm tra kết nối đến hệ thống Koha ILS.
        
        Dùng để test xem kết nối Koha có hoạt động không."""
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {}
        }
    
    def execute(self) -> ToolResult:
        """Test Koha connection"""
        try:
            if not self.koha_client:
                self.koha_client = KohaClient()
            
            logger.info("Testing Koha connection")
            
            result = self.koha_client.test_connection()
            
            if result['status'] == 'success':
                return ToolResult(
                    success=True,
                    data=result
                )
            else:
                return ToolResult(
                    success=False,
                    data=result,
                    error=result.get('message', 'Kết nối Koha thất bại')
                )
                
        except Exception as e:
            logger.error(f"Error testing Koha connection: {str(e)}")
            return ToolResult(
                success=False,
                data={},
                error=f"Lỗi khi kiểm tra kết nối Koha: {str(e)}"
            )


# Export all tools
__all__ = [
    'SearchKohaBooksTool',
    'GetKohaBookDetailTool',
    'CheckKohaBookAvailabilityTool',
    'GetKohaPatronInfoTool',
    'GetKohaPatronCheckoutsTool',
    'GetKohaPatronHoldsTool',
    'GetKohaLibrariesTool',
    'TestKohaConnectionTool'
]

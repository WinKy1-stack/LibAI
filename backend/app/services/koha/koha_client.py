import logging
from typing import Optional, Dict, Any, List
from .koha_service import KohaService

logger = logging.getLogger(__name__)


class KohaClient:
    """High-level client for Koha ILS operations"""
    
    def __init__(self, service: Optional[KohaService] = None):
        self.service = service or KohaService()
        logger.info("KohaClient initialized")
    
    def search_books(self, query: str, limit: int = 20, page: int = 1, 
                     search_field: Optional[str] = None) -> Dict[str, Any]:
        """Search for books in Koha catalog"""
        try:
            params = {
                'q': query,
                '_per_page': limit,
                '_page': page
            }
            
            if search_field:
                params['_match'] = search_field
            
            logger.info(f"Searching books with query: '{query}', field: {search_field}")
            response = self.service.get('/api/v1/public/biblios', params=params)
            
            return {
                'status': 'success',
                'results': response,
                'total': len(response) if isinstance(response, list) else 0,
                'query': query,
                'page': page,
                'limit': limit
            }
            
        except Exception as e:
            logger.error(f"Error searching books: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi tìm kiếm sách: {str(e)}",
                'results': [],
                'total': 0
            }
    
    def get_book_detail(self, biblio_id: int) -> Dict[str, Any]:
        """
        Get detailed information about a specific book
        
        Args:
            biblio_id: Bibliographic record ID
            
        Returns:
            Dictionary with book details
        """
        try:
            logger.info(f"Getting book detail for biblio_id: {biblio_id}")
            response = self.service.get(f'/api/v1/public/biblios/{biblio_id}')
            
            return {
                'status': 'success',
                'book': response
            }
            
        except Exception as e:
            logger.error(f"Error getting book detail: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy thông tin sách: {str(e)}",
                'book': None
            }
    
    def get_item_availability(self, biblio_id: int) -> Dict[str, Any]:
        """Check availability status of book items"""
        try:
            logger.info(f"Checking availability for biblio_id: {biblio_id}")
            response = self.service.get(f'/api/v1/public/biblios/{biblio_id}/items')
            
            # Process items to determine availability
            items = response if isinstance(response, list) else []
            available_count = sum(1 for item in items if item.get('available', False))
            
            return {
                'status': 'success',
                'biblio_id': biblio_id,
                'total_items': len(items),
                'available_items': available_count,
                'items': items
            }
            
        except Exception as e:
            logger.error(f"Error checking availability: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi kiểm tra tình trạng sách: {str(e)}",
                'total_items': 0,
                'available_items': 0
            }
    
    def get_patron_info(self, patron_id: int) -> Dict[str, Any]:
        """Get patron (user) information"""
        try:
            logger.info(f"Getting patron info for patron_id: {patron_id}")
            response = self.service.get(f'/api/v1/patrons/{patron_id}')
            
            return {
                'status': 'success',
                'patron': response
            }
            
        except Exception as e:
            logger.error(f"Error getting patron info: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy thông tin bạn đọc: {str(e)}",
                'patron': None
            }
    
    def get_patron_checkouts(self, patron_id: int) -> Dict[str, Any]:
        """Get list of books currently checked out by patron"""
        try:
            logger.info(f"Getting checkouts for patron_id: {patron_id}")
            response = self.service.get(f'/api/v1/patrons/{patron_id}/checkouts')
            
            checkouts = response if isinstance(response, list) else []
            
            return {
                'status': 'success',
                'patron_id': patron_id,
                'total_checkouts': len(checkouts),
                'checkouts': checkouts
            }
            
        except Exception as e:
            logger.error(f"Error getting checkouts: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy danh sách sách đang mượn: {str(e)}",
                'total_checkouts': 0,
                'checkouts': []
            }
    
    def get_patron_holds(self, patron_id: int) -> Dict[str, Any]:
        """Get list of holds (reservations) by patron"""
        try:
            logger.info(f"Getting holds for patron_id: {patron_id}")
            response = self.service.get(f'/api/v1/patrons/{patron_id}/holds')
            
            holds = response if isinstance(response, list) else []
            
            return {
                'status': 'success',
                'patron_id': patron_id,
                'total_holds': len(holds),
                'holds': holds
            }
            
        except Exception as e:
            logger.error(f"Error getting holds: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy danh sách đặt trước: {str(e)}",
                'total_holds': 0,
                'holds': []
            }
    
    def create_checkout(self, patron_id: int, item_id: int) -> Dict[str, Any]:
        """Create a checkout (borrow a book)"""
        try:
            logger.info(f"Creating checkout for patron {patron_id}, item {item_id}")
            
            data = {
                'patron_id': patron_id,
                'item_id': item_id
            }
            
            response = self.service.post('/api/v1/checkouts', data=data)
            
            return {
                'status': 'success',
                'message': 'Mượn sách thành công',
                'checkout': response
            }
            
        except Exception as e:
            logger.error(f"Error creating checkout: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi mượn sách: {str(e)}",
                'checkout': None
            }
    
    def create_hold(self, patron_id: int, biblio_id: int, 
                    pickup_library_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a hold (reservation) for a book
        
        Args:
            patron_id: Patron ID
            biblio_id: Bibliographic record ID
            pickup_library_id: Library branch ID for pickup
            
        Returns:
            Dictionary with hold result
        """
        try:
            logger.info(f"Creating hold for patron {patron_id}, biblio {biblio_id}")
            
            data = {
                'patron_id': patron_id,
                'biblio_id': biblio_id
            }
            
            if pickup_library_id:
                data['pickup_library_id'] = pickup_library_id
            
            response = self.service.post('/api/v1/holds', data=data)
            
            return {
                'status': 'success',
                'message': 'Đặt trước sách thành công',
                'hold': response
            }
            
        except Exception as e:
            logger.error(f"Error creating hold: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi đặt trước sách: {str(e)}",
                'hold': None
            }
    
    def get_libraries(self) -> Dict[str, Any]:
        """Get list of all libraries/branches"""
        try:
            logger.info("Getting list of libraries")
            response = self.service.get('/api/v1/public/libraries')
            
            libraries = response if isinstance(response, list) else []
            
            return {
                'status': 'success',
                'total_libraries': len(libraries),
                'libraries': libraries
            }
            
        except Exception as e:
            logger.error(f"Error getting libraries: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy danh sách thư viện: {str(e)}",
                'total_libraries': 0,
                'libraries': []
            }
    
    def get_library_info(self, library_id: str) -> Dict[str, Any]:
        """Get information about a specific library"""
        try:
            logger.info(f"Getting library info for library_id: {library_id}")
            response = self.service.get(f'/api/v1/public/libraries/{library_id}')
            
            return {
                'status': 'success',
                'library': response
            }
            
        except Exception as e:
            logger.error(f"Error getting library info: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy thông tin thư viện: {str(e)}",
                'library': None
            }
    
    def get_circulation_stats(self, start_date: Optional[str] = None, 
                             end_date: Optional[str] = None) -> Dict[str, Any]:
        """Get circulation statistics for date range
            Dictionary with statistics
        """
        try:
            params = {}
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
            
            logger.info(f"Getting circulation stats from {start_date} to {end_date}")
            response = self.service.get('/api/v1/statistics/circulation', params=params)
            
            return {
                'status': 'success',
                'statistics': response
            }
            
        except Exception as e:
            logger.error(f"Error getting circulation stats: {str(e)}")
            return {
                'status': 'error',
                'message': f"Lỗi lấy thống kê: {str(e)}",
                'statistics': None
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test connection to Koha"""
        return self.service.test_connection()
    
    def close(self):
        """Close the client connection"""
        self.service.close()

"""
Koha ILS API Routes
Provides REST endpoints for Koha library system integration
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.koha import KohaClient
from app.utils.decorators import librarian_required
import logging

logger = logging.getLogger(__name__)

koha_bp = Blueprint('koha', __name__, url_prefix='/api/koha')


def get_koha_client():
    """Get or create Koha client instance"""
    if not hasattr(current_app, 'koha_client'):
        current_app.koha_client = KohaClient()
    return current_app.koha_client


@koha_bp.route('/test', methods=['GET'])
def test_connection():
    """Test connection to Koha API"""
    try:
        client = get_koha_client()
        result = client.service.test_connection()
        return jsonify(result), 200 if result['status'] == 'success' else 503
    except Exception as e:
        logger.error(f"Koha connection error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@koha_bp.route('/books/search', methods=['GET'])
def search_books():
    """
    Search for books in Koha catalog
    
    Query params:
        - q: Search query (required)
        - limit: Max results (default: 20, max: 100)
        - page: Page number (default: 1)
        - field: Search field (title, author, isbn) - optional
    
    Returns:
        Search results with metadata
    """
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'error': 'Query parameter "q" is required'}), 400
        
        limit = min(int(request.args.get('limit', 20)), 100)
        page = max(int(request.args.get('page', 1)), 1)
        search_field = request.args.get('field', None)
        
        client = get_koha_client()
        result = client.search_books(
            query=query,
            limit=limit,
            page=page,
            search_field=search_field
        )
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter value'}), 400
    except Exception as e:
        logger.error(f"Error searching books: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi tìm kiếm: {str(e)}'
        }), 500


@koha_bp.route('/books/<int:biblio_id>', methods=['GET'])
def get_book_detail(biblio_id):
    """
    Get detailed information about a specific book
    
    Path params:
        - biblio_id: Bibliographic record ID
    
    Returns:
        Book details
    """
    try:
        client = get_koha_client()
        result = client.get_book_detail(biblio_id)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting book detail: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy thông tin sách: {str(e)}'
        }), 500


@koha_bp.route('/books/<int:biblio_id>/availability', methods=['GET'])
def check_availability(biblio_id):
    """
    Check availability of a book
    
    Path params:
        - biblio_id: Bibliographic record ID
    
    Returns:
        Availability status and item details
    """
    try:
        client = get_koha_client()
        result = client.get_item_availability(biblio_id)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error checking availability: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi kiểm tra tình trạng: {str(e)}'
        }), 500


@koha_bp.route('/patrons/<int:patron_id>', methods=['GET'])
@jwt_required()
def get_patron_info(patron_id):
    """
    Get patron information
    
    Path params:
        - patron_id: Patron ID
    
    Returns:
        Patron details
    """
    try:
        # Optional: Check if user has permission to view this patron
        current_user_id = get_jwt_identity()
        
        client = get_koha_client()
        result = client.get_patron_info(patron_id)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting patron info: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy thông tin bạn đọc: {str(e)}'
        }), 500


@koha_bp.route('/patrons/<int:patron_id>/checkouts', methods=['GET'])
@jwt_required()
def get_patron_checkouts(patron_id):
    """
    Get list of books currently checked out by patron
    
    Path params:
        - patron_id: Patron ID
    
    Returns:
        List of checkouts
    """
    try:
        client = get_koha_client()
        result = client.get_patron_checkouts(patron_id)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting checkouts: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy danh sách mượn: {str(e)}'
        }), 500


@koha_bp.route('/patrons/<int:patron_id>/holds', methods=['GET'])
@jwt_required()
def get_patron_holds(patron_id):
    """
    Get list of holds/reservations by patron
    
    Path params:
        - patron_id: Patron ID
    
    Returns:
        List of holds
    """
    try:
        client = get_koha_client()
        result = client.get_patron_holds(patron_id)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting holds: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy danh sách đặt trước: {str(e)}'
        }), 500


@koha_bp.route('/checkouts', methods=['POST'])
@jwt_required()
@librarian_required()
def create_checkout():
    """
    Create a checkout (borrow a book)
    
    Body:
        - patron_id: Patron ID (required)
        - item_id: Item ID to checkout (required)
    
    Returns:
        Checkout result
    """
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        patron_id = data.get('patron_id')
        item_id = data.get('item_id')
        
        if not patron_id or not item_id:
            return jsonify({'error': 'patron_id and item_id are required'}), 400
        
        client = get_koha_client()
        result = client.create_checkout(patron_id, item_id)
        
        if result['status'] == 'success':
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating checkout: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi mượn sách: {str(e)}'
        }), 500


@koha_bp.route('/holds', methods=['POST'])
@jwt_required()
def create_hold():
    """
    Create a hold (reservation) for a book
    
    Body:
        - patron_id: Patron ID (required)
        - biblio_id: Bibliographic record ID (required)
        - pickup_library_id: Library for pickup (optional)
    
    Returns:
        Hold result
    """
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        patron_id = data.get('patron_id')
        biblio_id = data.get('biblio_id')
        pickup_library_id = data.get('pickup_library_id')
        
        if not patron_id or not biblio_id:
            return jsonify({'error': 'patron_id and biblio_id are required'}), 400
        
        client = get_koha_client()
        result = client.create_hold(patron_id, biblio_id, pickup_library_id)
        
        if result['status'] == 'success':
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating hold: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi đặt trước sách: {str(e)}'
        }), 500


@koha_bp.route('/libraries', methods=['GET'])
def get_libraries():
    """
    Get list of all libraries/branches
    
    Returns:
        List of libraries
    """
    try:
        client = get_koha_client()
        result = client.get_libraries()
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting libraries: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy danh sách thư viện: {str(e)}'
        }), 500


@koha_bp.route('/libraries/<string:library_id>', methods=['GET'])
def get_library_info(library_id):
    """
    Get information about a specific library
    
    Path params:
        - library_id: Library ID
    
    Returns:
        Library details
    """
    try:
        client = get_koha_client()
        result = client.get_library_info(library_id)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting library info: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy thông tin thư viện: {str(e)}'
        }), 500


@koha_bp.route('/statistics/circulation', methods=['GET'])
@jwt_required()
@librarian_required()
def get_circulation_stats():
    """
    Get circulation statistics
    
    Query params:
        - start_date: Start date (YYYY-MM-DD) - optional
        - end_date: End date (YYYY-MM-DD) - optional
    
    Returns:
        Circulation statistics
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        client = get_koha_client()
        result = client.get_circulation_stats(start_date, end_date)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting circulation stats: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi lấy thống kê: {str(e)}'
        }), 500


@koha_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found'
    }), 404


@koha_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500

"""Koha Routes - expose Koha catalog data to AI & frontend

Endpoints:
GET /api/library/koha/search?query=python&limit=10
GET /api/library/koha/biblio/<id>
GET /api/library/koha/patron/<id>
GET /api/library/koha/patron/<id>/checkouts
GET /api/library/koha/patron/<id>/holds
GET /api/library/koha/item/<id>

These wrap Koha REST API and add light validation.
"""
from flask import Blueprint, request, jsonify
from app.services.library.koha_client import get_koha_client
from app.exceptions import ApiError

koha_bp = Blueprint('koha', __name__)

@koha_bp.route('/search', methods=['GET'])
def koha_search():
    """Tìm kiếm biblios."""
    query = request.args.get('query', '').strip()
    limit = int(request.args.get('limit', 20))
    offset = int(request.args.get('offset', 0))
    client = get_koha_client()
    try:
        data = client.search_biblios(query=query, limit=limit, offset=offset)
        return jsonify({'success': True, 'data': data}), 200
    except ApiError as e:
        return jsonify({'success': False, 'message': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@koha_bp.route('/biblio/<biblio_id>', methods=['GET'])
def koha_get_biblio(biblio_id):
    """Lấy chi tiết biblio."""
    client = get_koha_client()
    try:
        data = client.get_biblio(biblio_id)
        return jsonify({'success': True, 'data': data}), 200
    except ApiError as e:
        return jsonify({'success': False, 'message': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@koha_bp.route('/patron/<patron_id>', methods=['GET'])
def koha_get_patron(patron_id):
    """Lấy thông tin patron/bạn đọc."""
    client = get_koha_client()
    try:
        data = client.get_patron(patron_id)
        return jsonify({'success': True, 'data': data}), 200
    except ApiError as e:
        return jsonify({'success': False, 'message': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@koha_bp.route('/patron/<patron_id>/checkouts', methods=['GET'])
def koha_get_patron_checkouts(patron_id):
    """Lấy danh sách sách đang mượn của patron."""
    client = get_koha_client()
    try:
        data = client.get_patron_checkouts(patron_id)
        return jsonify({'success': True, 'data': data}), 200
    except ApiError as e:
        return jsonify({'success': False, 'message': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@koha_bp.route('/patron/<patron_id>/holds', methods=['GET'])
def koha_get_patron_holds(patron_id):
    """Lấy danh sách holds/đặt chỗ của patron."""
    client = get_koha_client()
    try:
        data = client.get_patron_holds(patron_id)
        return jsonify({'success': True, 'data': data}), 200
    except ApiError as e:
        return jsonify({'success': False, 'message': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@koha_bp.route('/item/<item_id>', methods=['GET'])
def koha_get_item(item_id):
    """Lấy thông tin item."""
    client = get_koha_client()
    try:
        data = client.get_item(item_id)
        return jsonify({'success': True, 'data': data}), 200
    except ApiError as e:
        return jsonify({'success': False, 'message': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

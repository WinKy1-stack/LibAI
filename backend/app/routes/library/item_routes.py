"""
Item Routes
Routes for managing physical items (copies of books)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import librarian_required
from app.exceptions import NotFoundError

item_bp = Blueprint('items', __name__)


@item_bp.route('', methods=['GET'])
def get_items():
    """Lấy danh sách items (bản sách vật lý)"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    status = request.args.get('status', '')
    branch = request.args.get('branch', '')
    record_id = request.args.get('record_id', '')

    query = {}
    if status:
        query['status'] = status
    if branch:
        query['location.branch'] = branch
    if record_id:
        query['record_id'] = record_id

    items = MongoHelper.find_many(
        'items',
        query=query,
        sort=[('updated_at', -1)],
        skip=skip,
        limit=limit
    )

    total = MongoHelper.count_documents('items', query)

    return jsonify({
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }), 200


@item_bp.route('/<item_id>', methods=['PUT'])
@jwt_required()
@librarian_required()
def update_item(item_id):
    """Cập nhật trạng thái item"""
    data = request.get_json()

    modified = MongoHelper.update_one('items', {'_id': item_id}, data)

    if modified == 0:
        raise NotFoundError('Không tìm thấy item')

    return jsonify({'message': 'Cập nhật item thành công'}), 200

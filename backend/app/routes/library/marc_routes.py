"""
MARC Records Routes
Routes for managing MARC bibliographic records
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import librarian_required
from app.models.mongodb_schemas import ItemStatus
from app.exceptions import NotFoundError, ValidationError

marc_bp = Blueprint('marc', __name__)


@marc_bp.route('', methods=['GET'])
def get_marc_records():
    """Lấy danh sách MARC records với search và filter"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    search = request.args.get('search', '')
    year = request.args.get('year', '')
    subject = request.args.get('subject', '')

    query = {}

    # Text search
    if search:
        query['$text'] = {'$search': search}

    # Filter by year
    if year:
        query['normalized.year'] = int(year)

    # Filter by subject
    if subject:
        query['normalized.subjects'] = subject

    records = MongoHelper.find_many(
        'marc_21',
        query=query,
        sort=[('normalized.year', -1)],
        skip=skip,
        limit=limit
    )

    total = MongoHelper.count_documents('marc_21', query)

    return jsonify({
        'records': records,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }), 200


@marc_bp.route('/<record_id>', methods=['GET'])
def get_marc_record(record_id):
    """Lấy chi tiết một MARC record"""
    record = MongoHelper.find_one('marc_21', {'_id': record_id})
    if not record:
        raise NotFoundError('Không tìm thấy bản ghi')

    # Get all items for this record
    items = MongoHelper.find_many('items', {'record_id': record_id})

    return jsonify({
        'record': record,
        'items': items,
        'available_copies': sum(1 for item in items if item['status'] == ItemStatus.AVAILABLE.value)
    }), 200


@marc_bp.route('', methods=['POST'])
@jwt_required()
@librarian_required()
def create_marc_record():
    """Tạo MARC record mới (Librarian/Admin only)"""
    data = request.get_json()

    required_fields = ['control_number', 'normalized']
    for field in required_fields:
        if field not in data:
            raise ValidationError(f'Thiếu trường {field}')

    record_id = MongoHelper.insert_one('marc_21', data)

    return jsonify({
        'message': 'Tạo MARC record thành công',
        'record_id': record_id
    }), 201

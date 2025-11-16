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
        query['publication.year'] = year  # Now a string, not int

    # Filter by subject
    if subject:
        query['subjects'] = {'$regex': subject, '$options': 'i'}  # Case-insensitive regex search

    records = MongoHelper.find_many(
        'marc_21',
        query=query,
        sort=[('publication.year', -1), ('created_at', -1)],
        skip=skip,
        limit=limit
    )

    total = MongoHelper.count('marc_21', query)

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
    # Try to find by _id (ObjectId) first
    from bson import ObjectId
    try:
        record = MongoHelper.find_one('marc_21', {'_id': ObjectId(record_id)})
    except:
        # If not ObjectId, try by record_id (UUID string)
        record = MongoHelper.find_one('marc_21', {'record_id': record_id})
    
    if not record:
        raise NotFoundError('Không tìm thấy bản ghi')

    # Get all items for this record (using record_id from the record)
    record_id_uuid = record.get('record_id') or record_id
    items = MongoHelper.find_many('items', {'record_id': record_id_uuid})
    
    # Also check holdings in the record itself
    holdings = record.get('holdings', [])
    available_copies = sum(
        holding.get('available', 0) 
        for holding in holdings
    ) if holdings else 0

    return jsonify({
        'record': record,
        'items': items,
        'available_copies': available_copies
    }), 200


@marc_bp.route('', methods=['POST'])
@jwt_required()
@librarian_required()
def create_marc_record():
    """Tạo MARC record mới (Librarian/Admin only)"""
    from datetime import datetime, timezone
    from app.services.google_books import GoogleBooksService
    from app.services.z3950.z3950_service import Z3950Service
    
    data = request.get_json()

    required_fields = ['record_id', 'title']
    for field in required_fields:
        if field not in data:
            raise ValidationError(f'Thiếu trường {field}')

    # Ensure timestamps are set
    now = datetime.now(timezone.utc).isoformat()
    if 'created_at' not in data:
        data['created_at'] = now
    if 'updated_at' not in data:
        data['updated_at'] = now
    
    # Enrich with Google Books API if ISBN is available
    if data.get('identifiers', {}).get('isbn'):
        data = Z3950Service._enrich_with_google_books(data)

    record_id = MongoHelper.insert_one('marc_21', data)

    return jsonify({
        'message': 'Tạo MARC record thành công',
        'record_id': record_id
    }), 201

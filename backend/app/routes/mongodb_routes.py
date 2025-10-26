"""
MongoDB Example Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import admin_required, librarian_required

mongodb_bp = Blueprint('mongodb', __name__, url_prefix='/api/mongodb')

# ==================== BOOKS COLLECTION ====================

@mongodb_bp.route('/books', methods=['GET'])
def get_books():
    """Lấy danh sách sách từ MongoDB"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'author': {'$regex': search, '$options': 'i'}},
                {'isbn': {'$regex': search, '$options': 'i'}}
            ]
        if category:
            query['category'] = category
        
        # Get books
        books = MongoHelper.find_many(
            'books',
            query=query,
            sort=[('created_at', -1)],
            skip=skip,
            limit=limit
        )
        
        # Get total count
        total = MongoHelper.count_documents('books', query)
        
        return jsonify({
            'books': books,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mongodb_bp.route('/books/<book_id>', methods=['GET'])
def get_book(book_id):
    """Lấy chi tiết một cuốn sách"""
    try:
        book = MongoHelper.find_one('books', {'_id': book_id})
        if not book:
            return jsonify({'error': 'Không tìm thấy sách'}), 404
        return jsonify({'book': book}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mongodb_bp.route('/books', methods=['POST'])
@jwt_required()
@librarian_required()
def create_book():
    """Tạo sách mới (Librarian/Admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'author', 'isbn', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Thiếu trường {field}'}), 400
        
        # Insert book
        book_id = MongoHelper.insert_one('books', data)
        
        return jsonify({
            'message': 'Tạo sách thành công',
            'book_id': book_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mongodb_bp.route('/books/<book_id>', methods=['PUT'])
@jwt_required()
@librarian_required()
def update_book(book_id):
    """Cập nhật thông tin sách"""
    try:
        data = request.get_json()
        
        # Remove _id if present
        if '_id' in data:
            del data['_id']
        
        modified = MongoHelper.update_one('books', {'_id': book_id}, data)
        
        if modified == 0:
            return jsonify({'error': 'Không tìm thấy sách hoặc không có thay đổi'}), 404
        
        return jsonify({'message': 'Cập nhật sách thành công'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mongodb_bp.route('/books/<book_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_book(book_id):
    """Xóa sách (Admin only)"""
    try:
        deleted = MongoHelper.delete_one('books', {'_id': book_id})
        
        if deleted == 0:
            return jsonify({'error': 'Không tìm thấy sách'}), 404
        
        return jsonify({'message': 'Xóa sách thành công'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== CATEGORIES ====================

@mongodb_bp.route('/categories', methods=['GET'])
def get_categories():
    """Lấy danh sách thể loại sách"""
    try:
        # Aggregation để lấy distinct categories với số lượng
        pipeline = [
            {'$group': {
                '_id': '$category',
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        categories = MongoHelper.aggregate('books', pipeline)
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== STATISTICS ====================

@mongodb_bp.route('/stats', methods=['GET'])
@jwt_required()
@librarian_required()
def get_statistics():
    """Lấy thống kê (Librarian/Admin only)"""
    try:
        total_books = MongoHelper.count_documents('books')
        total_categories = len(MongoHelper.aggregate('books', [
            {'$group': {'_id': '$category'}}
        ]))
        
        # Top authors
        top_authors = MongoHelper.aggregate('books', [
            {'$group': {
                '_id': '$author',
                'count': {'$sum': 1}
            }},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ])
        
        return jsonify({
            'total_books': total_books,
            'total_categories': total_categories,
            'top_authors': top_authors
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== BULK OPERATIONS ====================

@mongodb_bp.route('/books/bulk', methods=['POST'])
@jwt_required()
@admin_required()
def bulk_create_books():
    """Tạo nhiều sách cùng lúc (Admin only)"""
    try:
        data = request.get_json()
        books = data.get('books', [])
        
        if not books:
            return jsonify({'error': 'Danh sách sách trống'}), 400
        
        book_ids = MongoHelper.insert_many('books', books)
        
        return jsonify({
            'message': f'Tạo thành công {len(book_ids)} sách',
            'book_ids': book_ids
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

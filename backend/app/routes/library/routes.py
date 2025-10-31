"""
Library System MongoDB Routes
Routes cho MARC records, Items, Loans, FAQ, Documents, etc.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import admin_required, librarian_required
from app.models.mongodb_schemas import (
    ItemStatus, LoanStatus, FAQStatus
)
from datetime import datetime, timedelta, timezone

library_bp = Blueprint('library', __name__, url_prefix='/api/library')

# ==================== MARC RECORDS ====================

@library_bp.route('/marc-records', methods=['GET'])
def get_marc_records():
    """Lấy danh sách MARC records với search và filter"""
    try:
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
            'marc_records',
            query=query,
            sort=[('normalized.year', -1)],
            skip=skip,
            limit=limit
        )
        
        total = MongoHelper.count_documents('marc_records', query)
        
        return jsonify({
            'records': records,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/marc-records/<record_id>', methods=['GET'])
def get_marc_record(record_id):
    """Lấy chi tiết một MARC record"""
    try:
        record = MongoHelper.find_one('marc_records', {'_id': record_id})
        if not record:
            return jsonify({'error': 'Không tìm thấy bản ghi'}), 404
        
        # Get all items for this record
        items = MongoHelper.find_many('items', {'record_id': record_id})
        
        return jsonify({
            'record': record,
            'items': items,
            'available_copies': sum(1 for item in items if item['status'] == ItemStatus.AVAILABLE.value)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/marc-records', methods=['POST'])
@jwt_required()
@librarian_required()
def create_marc_record():
    """Tạo MARC record mới (Librarian/Admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['control_number', 'normalized']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Thiếu trường {field}'}), 400
        
        record_id = MongoHelper.insert_one('marc_records', data)
        
        return jsonify({
            'message': 'Tạo MARC record thành công',
            'record_id': record_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ITEMS ====================

@library_bp.route('/items', methods=['GET'])
def get_items():
    """Lấy danh sách items (bản sách vật lý)"""
    try:
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
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/items/<item_id>', methods=['PUT'])
@jwt_required()
@librarian_required()
def update_item(item_id):
    """Cập nhật trạng thái item"""
    try:
        data = request.get_json()
        
        modified = MongoHelper.update_one('items', {'_id': item_id}, data)
        
        if modified == 0:
            return jsonify({'error': 'Không tìm thấy item'}), 404
        
        return jsonify({'message': 'Cập nhật item thành công'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== LOANS ====================

@library_bp.route('/loans', methods=['GET'])
@jwt_required()
def get_loans():
    """Lấy danh sách loans (theo user hiện tại hoặc tất cả nếu là librarian)"""
    try:
        current_user = get_jwt_identity()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        
        status = request.args.get('status', '')
        user_id = request.args.get('user_id', '')
        
        query = {}
        
        # Nếu là user thường, chỉ xem loans của mình
        # TODO: Implement role check from current_user
        if user_id:
            query['user_id'] = user_id
        
        if status:
            query['status'] = status
        
        loans = MongoHelper.find_many(
            'loans',
            query=query,
            sort=[('loan_date', -1)],
            skip=skip,
            limit=limit
        )
        
        total = MongoHelper.count_documents('loans', query)
        
        return jsonify({
            'loans': loans,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/loans', methods=['POST'])
@jwt_required()
@librarian_required()
def create_loan():
    """Tạo loan mới (mượn sách) - SIP2 integration"""
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'item_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Thiếu trường {field}'}), 400
        
        # Check item availability
        item = MongoHelper.find_one('items', {'_id': data['item_id']})
        if not item:
            return jsonify({'error': 'Không tìm thấy item'}), 404
        
        if item['status'] != ItemStatus.AVAILABLE.value:
            return jsonify({'error': 'Item không khả dụng'}), 400
        
        # Create loan
        loan_data = {
            'user_id': data['user_id'],
            'item_id': data['item_id'],
            'loan_date': datetime.now(timezone.utc),
            'due_date': datetime.now(timezone.utc) + timedelta(days=14),
            'return_date': None,
            'status': LoanStatus.ONGOING.value,
            'sip2': data.get('sip2', {})
        }
        
        loan_id = MongoHelper.insert_one('loans', loan_data)
        
        # Update item status
        MongoHelper.update_one('items', {'_id': data['item_id']}, {
            'status': ItemStatus.ON_LOAN.value
        })
        
        # TODO: Log SIP2 event
        
        return jsonify({
            'message': 'Mượn sách thành công',
            'loan_id': loan_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/loans/<loan_id>/return', methods=['POST'])
@jwt_required()
@librarian_required()
def return_loan(loan_id):
    """Trả sách"""
    try:
        loan = MongoHelper.find_one('loans', {'_id': loan_id})
        if not loan:
            return jsonify({'error': 'Không tìm thấy loan'}), 404
        
        if loan['status'] != LoanStatus.ONGOING.value and loan['status'] != LoanStatus.OVERDUE.value:
            return jsonify({'error': 'Loan đã được trả'}), 400
        
        # Update loan
        MongoHelper.update_one('loans', {'_id': loan_id}, {
            'return_date': datetime.now(timezone.utc),
            'status': LoanStatus.RETURNED.value
        })
        
        # Update item status
        MongoHelper.update_one('items', {'_id': loan['item_id']}, {
            'status': ItemStatus.AVAILABLE.value
        })
        
        return jsonify({'message': 'Trả sách thành công'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/loans/<loan_id>/renew', methods=['POST'])
@jwt_required()
def renew_loan(loan_id):
    """Gia hạn sách"""
    try:
        loan = MongoHelper.find_one('loans', {'_id': loan_id})
        if not loan:
            return jsonify({'error': 'Không tìm thấy loan'}), 404
        
        if loan['status'] != LoanStatus.ONGOING.value:
            return jsonify({'error': 'Không thể gia hạn loan này'}), 400
        
        # Check if overdue
        if datetime.now(timezone.utc) > loan['due_date']:
            return jsonify({'error': 'Không thể gia hạn sách quá hạn'}), 400
        
        # Extend due date by 14 days
        new_due_date = loan['due_date'] + timedelta(days=14)
        
        MongoHelper.update_one('loans', {'_id': loan_id}, {
            'due_date': new_due_date
        })
        
        return jsonify({
            'message': 'Gia hạn thành công',
            'new_due_date': new_due_date.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== FAQ ====================

@library_bp.route('/faq', methods=['GET'])
def get_faq():
    """Lấy danh sách FAQ"""
    try:
        category = request.args.get('category', '')
        search = request.args.get('search', '')
        
        query = {'status': FAQStatus.PUBLISHED.value}
        
        if category:
            query['category'] = category
        
        if search:
            query['$text'] = {'$search': search}
        
        faqs = MongoHelper.find_many('faq', query=query)
        
        return jsonify({'faqs': faqs}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/faq', methods=['POST'])
@jwt_required()
@librarian_required()
def create_faq():
    """Tạo FAQ mới"""
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        
        data['updated_by'] = current_user
        data['updated_at'] = datetime.now(timezone.utc)
        
        faq_id = MongoHelper.insert_one('faq', data)
        
        return jsonify({
            'message': 'Tạo FAQ thành công',
            'faq_id': faq_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== DOCUMENTS ====================

@library_bp.route('/documents', methods=['GET'])
def get_documents():
    """Lấy danh sách documents"""
    try:
        lang = request.args.get('lang', 'vi')
        doc_type = request.args.get('type', '')
        
        query = {'lang': lang}
        if doc_type:
            query['type'] = doc_type
        
        documents = MongoHelper.find_many('documents', query=query)
        
        return jsonify({'documents': documents}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== CONVERSATIONS & MESSAGES ====================

@library_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Lấy danh sách conversations của user hiện tại"""
    try:
        current_user = get_jwt_identity()
        
        conversations = MongoHelper.find_many(
            'conversations',
            query={'user_id': current_user},
            sort=[('started_at', -1)],
            limit=50
        )
        
        return jsonify({'conversations': conversations}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/conversations/<conv_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conv_id):
    """Lấy messages trong conversation"""
    try:
        messages = MongoHelper.find_many(
            'messages',
            query={'conversation_id': conv_id},
            sort=[('ts', 1)]
        )
        
        return jsonify({'messages': messages}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN CONFIGS ====================

@library_bp.route('/admin/configs', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_configs():
    """Lấy tất cả admin configs"""
    try:
        configs = MongoHelper.find_many('admin_configs')
        return jsonify({'configs': configs}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/admin/configs/<key>', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_config(key):
    """Lấy một config theo key"""
    try:
        config = MongoHelper.find_one('admin_configs', {'key': key})
        if not config:
            return jsonify({'error': 'Không tìm thấy config'}), 404
        return jsonify({'config': config}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@library_bp.route('/admin/configs', methods=['POST'])
@jwt_required()
@admin_required()
def update_admin_config():
    """Cập nhật hoặc tạo mới admin config"""
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        
        if 'key' not in data or 'value' not in data:
            return jsonify({'error': 'Thiếu key hoặc value'}), 400
        
        data['updated_by'] = current_user
        data['updated_at'] = datetime.now(timezone.utc)
        
        # Upsert (update if exists, insert if not)
        existing = MongoHelper.find_one('admin_configs', {'key': data['key']})
        if existing:
            MongoHelper.update_one('admin_configs', {'key': data['key']}, data)
        else:
            MongoHelper.insert_one('admin_configs', data)
        
        return jsonify({'message': 'Cập nhật config thành công'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== STATISTICS ====================

@library_bp.route('/stats/overview', methods=['GET'])
@jwt_required()
@librarian_required()
def get_stats_overview():
    """Lấy thống kê tổng quan"""
    try:
        stats = {
            'total_marc_records': MongoHelper.count_documents('marc_records', {}),
            'total_items': MongoHelper.count_documents('items', {}),
            'available_items': MongoHelper.count_documents('items', {'status': ItemStatus.AVAILABLE.value}),
            'ongoing_loans': MongoHelper.count_documents('loans', {'status': LoanStatus.ONGOING.value}),
            'overdue_loans': MongoHelper.count_documents('loans', {'status': LoanStatus.OVERDUE.value}),
            'total_users': MongoHelper.count_documents('users', {}),
            'total_faq': MongoHelper.count_documents('faq', {'status': FAQStatus.PUBLISHED.value})
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

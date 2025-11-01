"""
Loan Routes
Routes for managing book loans (checkout, return, renew)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import librarian_required
from app.models.mongodb_schemas import ItemStatus, LoanStatus
from datetime import datetime, timedelta, timezone

loan_bp = Blueprint('loans', __name__)


@loan_bp.route('', methods=['GET'])
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


@loan_bp.route('', methods=['POST'])
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


@loan_bp.route('/<loan_id>/return', methods=['POST'])
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


@loan_bp.route('/<loan_id>/renew', methods=['POST'])
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

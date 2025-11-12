"""
FAQ Routes
Routes for managing Frequently Asked Questions
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import librarian_required
from app.models.mongodb_schemas import FAQStatus
from datetime import datetime, timezone
from app.exceptions import ApiError

faq_bp = Blueprint('faq', __name__)


@faq_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_faq():
    """Lấy danh sách FAQ (admin có thể xem tất cả status)"""
    from flask_jwt_extended import get_jwt
    from app.models.mongodb_schemas import UserRole
    
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    status = request.args.get('status', '')

    query = {}

    # Kiểm tra authentication và role nếu status='all'
    if status == 'all':
        # Kiểm tra xem có token hợp lệ không
        try:
            # Lấy JWT claims (sẽ có nếu có token hợp lệ)
            jwt_claims = get_jwt()
            if jwt_claims:
                user_role = jwt_claims.get('role')
                # Chỉ admin và librarian mới được xem tất cả
                if user_role in [UserRole.ADMIN.value, UserRole.LIBRARIAN.value]:
                    # Không filter theo status, lấy tất cả
                    pass
                else:
                    # Nếu không phải admin/librarian, chỉ lấy published
                    query['status'] = FAQStatus.PUBLISHED.value
            else:
                # Không có token, chỉ lấy published
                query['status'] = FAQStatus.PUBLISHED.value
        except Exception:
            # Nếu có lỗi (token không hợp lệ, hết hạn, etc.), chỉ lấy published
            query['status'] = FAQStatus.PUBLISHED.value
    elif status and status in ['published', 'draft', 'archived']:
        # Filter theo status cụ thể
        query['status'] = status
    else:
        # Mặc định chỉ lấy published cho public
        query['status'] = FAQStatus.PUBLISHED.value

    if category:
        query['category'] = category

    if search:
        query['$text'] = {'$search': search}

    faqs = MongoHelper.find_many('faq', query=query, sort=[('updated_at', -1)])

    return jsonify({'faqs': faqs}), 200


@faq_bp.route('', methods=['POST'])
@jwt_required()
@librarian_required()
def create_faq():
    """Tạo FAQ mới"""
    data = request.get_json()
    current_user = get_jwt_identity()

    data['updated_by'] = current_user.get('id') if isinstance(current_user, dict) else current_user
    data['updated_at'] = datetime.now(timezone.utc)
    data['created_at'] = datetime.now(timezone.utc)

    faq_id = MongoHelper.insert_one('faq', data)

    return jsonify({
        'message': 'Tạo FAQ thành công',
        'faq_id': faq_id
    }), 201


@faq_bp.route('/<faq_id>', methods=['PUT'])
@jwt_required()
@librarian_required()
def update_faq(faq_id):
    """Cập nhật FAQ"""
    data = request.get_json()
    current_user = get_jwt_identity()

    data['updated_by'] = current_user.get('id') if isinstance(current_user, dict) else current_user
    data['updated_at'] = datetime.now(timezone.utc)

    modified = MongoHelper.update_one('faq', {'_id': faq_id}, data)

    if modified == 0:
        from app.exceptions import NotFoundError
        raise NotFoundError('Không tìm thấy FAQ')

    return jsonify({'message': 'Cập nhật FAQ thành công'}), 200


@faq_bp.route('/<faq_id>', methods=['DELETE'])
@jwt_required()
@librarian_required()
def delete_faq(faq_id):
    """Xóa FAQ"""
    from app.exceptions import NotFoundError
    
    deleted = MongoHelper.delete_one('faq', {'_id': faq_id})

    if deleted == 0:
        raise NotFoundError('Không tìm thấy FAQ')

    return jsonify({'message': 'Xóa FAQ thành công'}), 200

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
def get_faq():
    """Lấy danh sách FAQ"""
    category = request.args.get('category', '')
    search = request.args.get('search', '')

    query = {'status': FAQStatus.PUBLISHED.value}

    if category:
        query['category'] = category

    if search:
        query['$text'] = {'$search': search}

    faqs = MongoHelper.find_many('faq', query=query)

    return jsonify({'faqs': faqs}), 200


@faq_bp.route('', methods=['POST'])
@jwt_required()
@librarian_required()
def create_faq():
    """Tạo FAQ mới"""
    data = request.get_json()
    current_user = get_jwt_identity()

    data['updated_by'] = current_user
    data['updated_at'] = datetime.now(timezone.utc)

    faq_id = MongoHelper.insert_one('faq', data)

    return jsonify({
        'message': 'Tạo FAQ thành công',
        'faq_id': faq_id
    }), 201

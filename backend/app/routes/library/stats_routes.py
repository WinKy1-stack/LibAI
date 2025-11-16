"""
Statistics Routes
Routes for library statistics and analytics
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import librarian_required
from app.models.mongodb_schemas import ItemStatus, LoanStatus, FAQStatus
from app.exceptions import ApiError

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/overview', methods=['GET'])
@jwt_required()
@librarian_required()
def get_stats_overview():
    """Lấy thống kê tổng quan"""
    stats = {
        'total_marc_records': MongoHelper.count('marc_21', {}),
        'total_items': MongoHelper.count('items', {}),
        'available_items': MongoHelper.count('items', {'status': ItemStatus.AVAILABLE.value}),
        'ongoing_loans': MongoHelper.count('loans', {'status': LoanStatus.ONGOING.value}),
        'overdue_loans': MongoHelper.count('loans', {'status': LoanStatus.OVERDUE.value}),
        'total_users': MongoHelper.count('users', {}),
        'total_faq': MongoHelper.count('faq', {'status': FAQStatus.PUBLISHED.value})
    }

    return jsonify({'stats': stats}), 200

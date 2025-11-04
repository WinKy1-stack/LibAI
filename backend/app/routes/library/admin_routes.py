"""
Admin Routes
Routes for managing admin configurations
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.mongo_helper import MongoHelper
from app.utils.decorators import admin_required
from datetime import datetime, timezone
from app.exceptions import NotFoundError, ValidationError

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/configs', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_configs():
    """Lấy tất cả admin configs"""
    configs = MongoHelper.find_many('admin_configs')
    return jsonify({'configs': configs}), 200


@admin_bp.route('/configs/<key>', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_config(key):
    """Lấy một config theo key"""
    config = MongoHelper.find_one('admin_configs', {'key': key})
    if not config:
        raise NotFoundError('Không tìm thấy config')
    return jsonify({'config': config}), 200


@admin_bp.route('/configs', methods=['POST'])
@jwt_required()
@admin_required()
def update_admin_config():
    """Cập nhật hoặc tạo mới admin config"""
    data = request.get_json()
    current_user = get_jwt_identity()

    if 'key' not in data or 'value' not in data:
        raise ValidationError('Thiếu key hoặc value')

    data['updated_by'] = current_user
    data['updated_at'] = datetime.now(timezone.utc)

    # Upsert (update if exists, insert if not)
    existing = MongoHelper.find_one('admin_configs', {'key': data['key']})
    if existing:
        MongoHelper.update_one('admin_configs', {'key': data['key']}, data)
    else:
        MongoHelper.insert_one('admin_configs', data)

    return jsonify({'message': 'Cập nhật config thành công'}), 200

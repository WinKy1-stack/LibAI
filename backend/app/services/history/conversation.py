"""
Conversation Routes
Routes for managing user chat conversations and messages
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

from app.utils.mongo_helper import MongoHelper
from app.exceptions import ApiError
from .ConversationManager import ConversationManager

conversation_bp = Blueprint('conversations', __name__)


@conversation_bp.route('', methods=['GET'])
@jwt_required()
def get_conversations():
    """Lấy danh sách conversations của user hiện tại (kèm message_count)"""
    current_user = get_jwt_identity()
    try:
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))
        conversations = ConversationManager.get_by_user(current_user, limit=limit, skip=skip)
        return jsonify({'conversations': conversations}), 200
    except Exception as e:
        raise ApiError(f"Lỗi lấy conversations: {e}", 500)


@conversation_bp.route('', methods=['POST'])
@jwt_required()
def create_conversation():
    """Tạo conversation mới"""
    current_user = get_jwt_identity()
    try:
        conversation_id = ConversationManager.create(current_user)
        return jsonify({
            'conversation_id': conversation_id,
            'message': 'Đã tạo cuộc trò chuyện mới'
        }), 201
    except Exception as e:
        raise ApiError(f"Lỗi tạo conversation: {e}", 500)


@conversation_bp.route('/<conv_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conv_id):
    """Lấy messages trong conversation (cast conv_id về ObjectId nếu cần)"""
    try:
        try:
            conv_oid = ObjectId(conv_id)
        except Exception:
            conv_oid = conv_id

        messages = MongoHelper.find_many(
            'messages',
            query={'conversation_id': conv_oid},
            sort=[('ts', 1)]
        )
        return jsonify({'messages': messages}), 200
    except Exception as e:
        raise ApiError(f"Lỗi lấy messages: {e}", 500)


@conversation_bp.route('/<conv_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conv_id):
    """Xóa 1 conversation thuộc về current_user + cascade messages"""
    current_user = get_jwt_identity()
    ok = ConversationManager.delete(conv_id, user_id=current_user)
    if not ok:
        raise ApiError("Không tìm thấy cuộc trò chuyện hoặc không có quyền xóa", 404)
    return jsonify({"message": "Đã xóa cuộc trò chuyện"}), 200
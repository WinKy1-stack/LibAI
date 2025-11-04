"""
Conversation Routes
Routes for managing user chat conversations and messages
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.mongo_helper import MongoHelper
from app.exceptions import ApiError

conversation_bp = Blueprint('conversations', __name__)


@conversation_bp.route('', methods=['GET'])
@jwt_required()
def get_conversations():
    """Lấy danh sách conversations của user hiện tại"""
    current_user = get_jwt_identity()

    conversations = MongoHelper.find_many(
        'conversations',
        query={'user_id': current_user},
        sort=[('started_at', -1)],
        limit=50
    )

    return jsonify({'conversations': conversations}), 200


@conversation_bp.route('/<conv_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conv_id):
    """Lấy messages trong conversation"""
    messages = MongoHelper.find_many(
        'messages',
        query={'conversation_id': conv_id},
        sort=[('ts', 1)]
    )

    return jsonify({'messages': messages}), 200

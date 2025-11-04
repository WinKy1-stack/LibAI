"""
History Routes - Quản lý lịch sử chat và conversations
"""
import logging
from flask import Blueprint, jsonify, request

from app.services.history import get_chat_history_service
from app.exceptions import ApiError, ValidationError
from app.utils.decorators import token_required
from app.routes.helpers import (
    validate_request_data,
    build_success_response
)

logger = logging.getLogger(__name__)

history_bp = Blueprint('chat_history', __name__)


@history_bp.route('/history/<conversation_id>', methods=['GET'])
@token_required
def get_conversation_history(current_user, conversation_id):
    """
    Lấy lịch sử chat của một conversation
    
    Query Params:
        limit: int (optional) - Số lượng tin nhắn tối đa (default: 100)
    """
    limit = request.args.get('limit', 100, type=int)

    if limit < 1 or limit > 500:
        raise ValidationError("Limit phải trong khoảng 1-500")

    history_service = get_chat_history_service()
    messages = history_service.get_conversation_history(
        conversation_id=conversation_id,
        limit=limit
    )

    response_data = build_success_response(
        data={
            'conversation_id': conversation_id,
            'messages': messages,
            'count': len(messages)
        },
        user_id=current_user['id'],
        metadata={'limit': limit}
    )

    return jsonify(response_data), 200


@history_bp.route('/conversations', methods=['GET'])
@token_required
def get_user_conversations(current_user):
    """
    Lấy danh sách conversations của user
    
    Query Params:
        limit: int (optional) - Số lượng conversations (default: 20)
        skip: int (optional) - Bỏ qua số lượng (default: 0)
    """
    limit = request.args.get('limit', 20, type=int)
    skip = request.args.get('skip', 0, type=int)

    if limit < 1 or limit > 100:
        raise ValidationError("Limit phải trong khoảng 1-100")
    if skip < 0:
        raise ValidationError("Skip phải >= 0")

    history_service = get_chat_history_service()
    conversations = history_service.get_user_conversations(
        user_id=current_user['id'],
        limit=limit,
        skip=skip
    )

    response_data = build_success_response(
        data={
            'conversations': conversations,
            'count': len(conversations)
        },
        user_id=current_user['id'],
        metadata={'limit': limit, 'skip': skip}
    )

    return jsonify(response_data), 200


@history_bp.route('/conversation/end', methods=['POST'])
@token_required
def end_conversation(current_user):
    """
    Kết thúc một conversation
    
    Request Body:
        {
            "conversation_id": str (required) - ID của conversation
        }
    """
    data = validate_request_data(required_fields=['conversation_id'])
    conversation_id = data['conversation_id']

    history_service = get_chat_history_service()
    success = history_service.end_conversation(conversation_id)

    if not success:
        raise ApiError("Không thể kết thúc conversation")

    response_data = build_success_response(
        data={
            'conversation_id': conversation_id,
            'ended': True
        },
        user_id=current_user['id']
    )

    logger.info("Ended conversation %s for user %s", conversation_id, current_user['id'])
    return jsonify(response_data), 200


@history_bp.route('/stats', methods=['GET'])
@token_required
def get_conversation_stats(current_user):
    """
    Lấy thống kê chat của user
    """
    history_service = get_chat_history_service()
    stats = history_service.get_conversation_stats(current_user['id'])

    response_data = build_success_response(
        data={'stats': stats},
        user_id=current_user['id']
    )

    return jsonify(response_data), 200

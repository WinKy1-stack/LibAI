import logging
from flask import Blueprint, jsonify, request

from app.services.history import ConversationManager, MessageManager
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

    messages = MessageManager.get_by_conversation(
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

    conversations = ConversationManager.get_by_user(
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


@history_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
@token_required
def delete_conversation(current_user, conversation_id):
    """Xóa một conversation và tất cả messages"""
    if not ConversationManager.belongs_to_user(conversation_id, current_user['id']):
        raise ApiError("Không có quyền xóa conversation này", status_code=403)

    success = ConversationManager.delete(conversation_id, current_user['id'])
    
    if not success:
        raise ApiError("Không thể xóa conversation", status_code=500)

    response_data = build_success_response(
        data={'conversation_id': conversation_id, 'deleted': True},
        user_id=current_user['id']
    )
    
    logger.info("Deleted conversation %s for user %s", conversation_id, current_user['id'])
    return jsonify(response_data), 200


@history_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
@token_required
def get_conversation_messages(current_user, conversation_id):
    """Lấy messages của một conversation"""
    if not ConversationManager.belongs_to_user(conversation_id, current_user['id']):
        raise ApiError("Không có quyền truy cập conversation này", status_code=403)
    
    limit = request.args.get('limit', 100, type=int)
    
    if limit < 1 or limit > 500:
        raise ValidationError("Limit phải trong khoảng 1-500")
    
    messages = MessageManager.get_by_conversation(conversation_id, limit)
    
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

    success = ConversationManager.end(conversation_id)

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
    try:
        user_id = current_user['id']

        # Get conversation stats
        conv_stats = ConversationManager.get_stats(user_id)

        # Get message stats
        conv_ids = ConversationManager.get_all_ids_by_user(user_id)
        msg_stats = MessageManager.get_stats(conv_ids)

        # Combine stats
        stats = {
            **conv_stats,
            **msg_stats
        }

        # Calculate average messages per conversation
        total_conv = stats.get('total_conversations', 0)
        total_msg = stats.get('total_messages', 0)

        if total_conv > 0:
            stats['avg_messages_per_conversation'] = total_msg / total_conv
        else:
            stats['avg_messages_per_conversation'] = 0

    except Exception as e:
        logger.error("Error getting combined stats: %s", str(e))
        stats = {
            'total_conversations': 0,
            'total_messages': 0,
            'avg_messages_per_conversation': 0
        }

    response_data = build_success_response(
        data={'stats': stats},
        user_id=current_user['id']
    )

    return jsonify(response_data), 200

import logging
from flask import Blueprint, jsonify, request

from app.services.history import ConversationManager, MessageManager
from app.exceptions import ApiError, ValidationError
from app.utils.decorators import token_required
from app.routes.helpers import build_success_response

logger = logging.getLogger(__name__)

conversations_bp = Blueprint('conversations', __name__, url_prefix='/api/conversations')


@conversations_bp.route('', methods=['GET'])
@token_required
def get_conversations(current_user):
    """Lấy danh sách conversations của user"""
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


@conversations_bp.route('/<conversation_id>', methods=['DELETE'])
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


@conversations_bp.route('/<conversation_id>/messages', methods=['GET'])
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

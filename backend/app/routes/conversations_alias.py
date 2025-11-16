"""
Conversations Alias Routes
- Cung cấp alias để tương thích với frontend đang gọi /api/conversations/*
- Ủy quyền sang ChatHistoryService/ConversationManager hiện có
"""
from flask import Blueprint, jsonify, request
import logging

from app.utils.decorators import token_required
from app.routes.helpers import build_success_response
from app.services.history import get_chat_history_service
from app.services.history.ConversationManager import ConversationManager
from app.exceptions import ApiError

logger = logging.getLogger(__name__)

conversations_alias_bp = Blueprint("conversations_alias", __name__)


@conversations_alias_bp.route("", methods=["GET"])
@token_required
def list_conversations(current_user):
    """Alias: GET /api/conversations -> danh sách conversations của user"""
    limit = request.args.get("limit", 20, type=int)
    skip = request.args.get("skip", 0, type=int)

    history_service = get_chat_history_service()
    conversations = history_service.get_user_conversations(
        user_id=current_user["id"], limit=limit, skip=skip
    )

    response = build_success_response(
        data={"conversations": conversations, "count": len(conversations)},
        user_id=current_user["id"],
        metadata={"limit": limit, "skip": skip},
    )
    return jsonify(response), 200


@conversations_alias_bp.route("/<conversation_id>/messages", methods=["GET"])
@token_required
def list_messages(current_user, conversation_id: str):
    """Alias: GET /api/conversations/<id>/messages -> lịch sử tin nhắn"""
    # Bảo vệ quyền sở hữu
    history_service = get_chat_history_service()
    if not history_service.conversation_belongs_to_user(conversation_id, current_user["id"]):
        raise ApiError("Không có quyền truy cập conversation này", status_code=403)

    limit = request.args.get("limit", 100, type=int)
    messages = history_service.get_conversation_history(conversation_id, limit=limit)

    response = build_success_response(
        data={"conversation_id": conversation_id, "messages": messages, "count": len(messages)},
        user_id=current_user["id"],
        metadata={"limit": limit},
    )
    return jsonify(response), 200


@conversations_alias_bp.route("/<conversation_id>", methods=["DELETE"])
@token_required
def delete_conversation(current_user, conversation_id: str):
    """Alias: DELETE /api/conversations/<id> -> xóa conversation + messages"""
    history_service = get_chat_history_service()

    # Kiểm tra quyền sở hữu trước
    if not history_service.conversation_belongs_to_user(conversation_id, current_user["id"]):
        raise ApiError("Không tìm thấy cuộc trò chuyện hoặc không có quyền xóa", status_code=404)

    # Đánh dấu kết thúc (không bắt buộc, giữ lại để thống nhất luồng)
    history_service.end_conversation(conversation_id)
    del_ok = ConversationManager.delete(conversation_id, user_id=current_user["id"])

    if not del_ok:
        raise ApiError("Không tìm thấy cuộc trò chuyện hoặc không có quyền xóa", status_code=404)

    response = build_success_response(
        data={"conversation_id": conversation_id, "deleted": True},
        user_id=current_user["id"],
    )
    return jsonify(response), 200


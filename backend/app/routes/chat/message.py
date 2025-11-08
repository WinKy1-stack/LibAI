"""
Message Route - Xử lý chat message với AI
"""
import logging
import time
from flask import Blueprint, jsonify

from app.services.prompt import get_prompt_service
from app.services.history import get_chat_history_service
from app.exceptions import ApiError, ValidationError, GeminiAPIError
from app.utils.decorators import token_required
from app.routes.helpers import (
    validate_request_data,
    build_success_response
)

logger = logging.getLogger(__name__)

message_bp = Blueprint('chat_message', __name__)


@message_bp.route('/message', methods=['POST'])
@token_required
def send_message(current_user):
    """
    Gửi tin nhắn và nhận phản hồi từ AI (CÓ ĐĂNG NHẬP - LƯU LỊCH SỬ)
    
    Request Body:
        {
            "message": str (required) - Tin nhắn người dùng,
            "chat_history": list (optional) - Lịch sử chat,
            "context": str (optional) - Context bổ sung,
            "conversation_id": str (optional) - ID conversation đang chat
        }
    """
    # Validate và lấy data
    data = validate_request_data(required_fields=['message'])

    user_message = data['message'].strip()
    chat_history = data.get('chat_history', [])
    context = data.get('context')
    conversation_id = data.get('conversation_id')

    logger.info("User %s sent message: %s...", current_user['id'], user_message[:50])

    # Tạo conversation mới nếu chưa có
    history_service = get_chat_history_service()
    if not conversation_id:
        conversation_id = history_service.create_conversation(
            user_id=current_user['id'],
            channel='web',
            model='gemini-2.0-flash-exp'
        )
        logger.info("Created new conversation: %s", conversation_id)
    else:
        # Validate conversation_id thuộc user hiện tại
        if not history_service.conversation_belongs_to_user(conversation_id, current_user['id']):
            logger.warning("Unauthorized access to conversation %s by user %s", conversation_id, current_user['id'])
            raise ApiError("Không có quyền truy cập conversation này", status_code=403)
        logger.debug("Using existing conversation: %s for user %s", conversation_id, current_user['id'])

    # Generate response with timing
    start_time = time.time()
    prompt_service = get_prompt_service()
    
    # Lấy patron_id từ user profile nếu có
    patron_id = current_user.get('koha_patron_id') or current_user.get('patron_id')
    
    # Dùng method có session để lưu history conversation
    ai_response = prompt_service.generate_response_with_session(
        conversation_id=conversation_id,
        user_message=user_message,
        instruction_type='default',
        history_service=history_service,  # Truyền history_service để lưu/lấy từ DB
        latency_ms=int((time.time() - start_time) * 1000),  # Tính latency
        patron_id=patron_id,  # Truyền patron_id để lấy thông tin từ Koha
        auto_inject_koha_context=True  # Tự động inject Koha context
    )
    latency_ms = int((time.time() - start_time) * 1000)

    # Lưu vào database đã được thực hiện bên trong generate_response_with_session()
    # Nên không cần lưu lại ở đây

    response_data = build_success_response(
        data={
            'message': ai_response,
            'conversation_id': conversation_id
        },
        user_id=current_user['id'],
        metadata={
            'message_length': len(ai_response),
            'has_context': context is not None,
            'history_length': len(chat_history),
            'latency_ms': latency_ms
        }
    )

    logger.info("Response generated successfully for user %s", current_user['id'])
    return jsonify(response_data), 200


@message_bp.route('/message/guest', methods=['POST'])
def send_message_guest():
    """
    Gửi tin nhắn KHÔNG CẦN ĐĂNG NHẬP (KHÔNG LƯU LỊCH SỬ)
    
    Request Body:
        {
            "message": str (required) - Tin nhắn người dùng,
            "chat_history": list (optional) - Lịch sử chat (chỉ local),
            "context": str (optional) - Context bổ sung
        }
    """
    # Validate và lấy data
    data = validate_request_data(required_fields=['message'])

    user_message = data['message'].strip()
    chat_history = data.get('chat_history', [])
    context = data.get('context')

    logger.info("Guest sent message: %s...", user_message[:50])

    # Generate response with timing (KHÔNG LƯU DB)
    start_time = time.time()
    prompt_service = get_prompt_service()
    ai_response = prompt_service.generate_response(
        user_message=user_message,
        chat_history=chat_history,
        context=context
    )
    latency_ms = int((time.time() - start_time) * 1000)

    response_data = build_success_response(
        data={
            'message': ai_response,
            'conversation_id': None  # Không có conversation_id
        },
        user_id='guest',
        metadata={
            'message_length': len(ai_response),
            'has_context': context is not None,
            'history_length': len(chat_history),
            'latency_ms': latency_ms
        }
    )

    logger.info("Guest response generated successfully")
    return jsonify(response_data), 200

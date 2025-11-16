import logging
import time
import asyncio
from flask import Blueprint, jsonify

from app.ai.pipelines.prompt import get_prompt_service
from app.services.history import ConversationManager, MessageManager
from app.exceptions import ApiError, ValidationError, GeminiAPIError
from app.utils.decorators import token_required
from app.routes.helpers import (
    validate_request_data,
    build_success_response
)

logger = logging.getLogger(__name__)

message_bp = Blueprint('chat_message', __name__)


async def _send_message_async(current_user, data):
    """Helper function để xử lý async logic"""
    user_message = data['message'].strip()
    chat_history = data.get('chat_history', [])
    context = data.get('context')
    conversation_id = data.get('conversation_id')


    logger.info("User %s sent message: %s...", current_user['id'], user_message[:50])

    if not conversation_id:
        conversation_id = ConversationManager.create(
            user_id=current_user['id'],
            channel='web'
        )
        logger.info("Created new conversation: %s", conversation_id)
    else:
        if not ConversationManager.belongs_to_user(conversation_id, current_user['id']):
            logger.warning("Unauthorized access to conversation %s by user %s - creating new one", conversation_id, current_user['id'])
            conversation_id = ConversationManager.create(
                user_id=current_user['id'],
                channel='web'
            )
            logger.info("Created new conversation: %s for user %s", conversation_id, current_user['id'])
        else:
            logger.debug("Using existing conversation: %s for user %s", conversation_id, current_user['id'])

    start_time = time.time()
    prompt_service = get_prompt_service()

    try:
        # Use structured output để có books data cho rich UI
        ai_response = await asyncio.wait_for(
            asyncio.to_thread(
                prompt_service.generate_response_structured,
                conversation_id=conversation_id,
                user_message=user_message,
                instruction_type='default',
                latency_ms=int((time.time() - start_time) * 1000)
            ),
            timeout=30.0
        )
    except asyncio.TimeoutError:
        logger.error("AI response timeout for user %s after 30s", current_user['id'])
        raise ApiError("AI đang xử lý quá lâu, vui lòng thử lại", status_code=503)
    except GeminiAPIError as e:
        logger.exception("Gemini API error for user %s: %s", current_user['id'], str(e))
        error_msg = str(e)
        if "503" in error_msg or "UNAVAILABLE" in error_msg or "overloaded" in error_msg.lower():
            raise ApiError("Dịch vụ AI hiện quá tải, vui lòng thử lại sau vài giây", status_code=503)
        raise ApiError(f"Lỗi AI: {str(e)}", status_code=502)
    except Exception as e:
        logger.exception("Unexpected error during AI generation for user %s", current_user['id'])
        raise ApiError("Lỗi xử lý tin nhắn, vui lòng thử lại", status_code=500)

    latency_ms = int((time.time() - start_time) * 1000)

    response_text = ai_response.get('text', '') if isinstance(ai_response, dict) else str(ai_response)
    response_books = ai_response.get('books') if isinstance(ai_response, dict) else None
    response_metadata = ai_response.get('metadata') if isinstance(ai_response, dict) else None

    data = {
        'message': response_text,
        'conversation_id': conversation_id
    }
    if response_books: 
        data['books'] = response_books

    response_data = build_success_response(
        data=data,
        user_id=current_user['id'],
        metadata={
            'message_length': len(response_text),
            'books_count': len(response_books) if response_books else 0,
            'tool_metadata': response_metadata,
            'has_context': context is not None,
            'history_length': len(chat_history),
            'latency_ms': latency_ms
        }
    )

    logger.info("Response generated successfully for user %s", current_user['id'])
    return jsonify(response_data), 200


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
    data = validate_request_data(required_fields=['message'])

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_send_message_async(current_user, data))
    finally:
        loop.close()


async def _send_message_guest_async(data):
    import uuid

    user_message = data['message'].strip()
    conversation_id = data.get('conversation_id') or f"guest_{uuid.uuid4().hex[:16]}"

    logger.info("Guest sent message: %s... (session: %s)", user_message[:50], conversation_id)

    start_time = time.time()
    prompt_service = get_prompt_service()

    try:
        ai_response = await asyncio.wait_for(
            asyncio.to_thread(
                prompt_service.generate_response_with_session,
                conversation_id=conversation_id,
                user_message=user_message,
                instruction_type='default',
                latency_ms=0
            ),
            timeout=30.0
        )
    except asyncio.TimeoutError:
        logger.error("AI response timeout for guest after 30s")
        raise ApiError("AI đang xử lý quá lâu, vui lòng thử lại", status_code=503)
    except GeminiAPIError as e:
        logger.exception("Gemini API error for guest: %s", str(e))
        error_msg = str(e)
        if "503" in error_msg or "UNAVAILABLE" in error_msg or "overloaded" in error_msg.lower():
            raise ApiError("Dịch vụ AI hiện quá tải, vui lòng thử lại sau vài giây", status_code=503)
        raise ApiError(f"Lỗi AI: {str(e)}", status_code=502)
    except Exception as e:
        logger.exception("Unexpected error during AI generation for guest")
        raise ApiError("Lỗi xử lý tin nhắn, vui lòng thử lại", status_code=500)

    latency_ms = int((time.time() - start_time) * 1000)

    response_data = build_success_response(
        data={
            'message': ai_response,
            'conversation_id': conversation_id
        },
        user_id='guest',
        metadata={
            'message_length': len(ai_response),
            'latency_ms': latency_ms
        }
    )

    logger.info("Guest response generated successfully")
    return jsonify(response_data), 200


@message_bp.route('/message/guest', methods=['POST'])
def send_message_guest():
    """
    Gửi tin nhắn KHÔNG CẦN ĐĂNG NHẬP (LƯU HISTORY IN-MEMORY)

    Request Body:
        {
            "message": str (required) - Tin nhắn người dùng,
            "conversation_id": str (optional) - Session ID để maintain history
        }
    """
    data = validate_request_data(required_fields=['message'])

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_send_message_guest_async(data))
    finally:
        loop.close()

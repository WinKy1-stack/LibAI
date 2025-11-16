import logging
from flask import request, jsonify

from app.ai.exceptions import ChatServiceError, ValidationError

logger = logging.getLogger(__name__)


def build_error_response(error: Exception, default_status: int = 500) -> tuple:
    """
    Build error response từ exception
    
    Args:
        error: Exception instance
        default_status: Default status code nếu không xác định được
    
    Returns:
        Tuple (response_dict, status_code)
    """
    if isinstance(error, ChatServiceError):
        return jsonify({
            'success': False,
            'error': {
                'message': error.message,
                'type': error.__class__.__name__
            }
        }), error.status_code
    
    # Generic error
    logger.error("Unhandled error: %s", str(error), exc_info=True)
    return jsonify({
        'success': False,
        'error': {
            'message': 'Đã xảy ra lỗi không mong muốn',
            'type': 'InternalServerError'
        }
    }), default_status


def validate_request_data(required_fields: list = None) -> dict:
    """
    Validate và lấy request data
    
    Args:
        required_fields: List các field bắt buộc
    
    Returns:
        Request data dict
        
    Raises:
        ValidationError: Nếu data không hợp lệ
    """
    data = request.get_json()
    
    if not data:
        raise ValidationError("Request body không được để trống")
    
    if required_fields:
        missing = [field for field in required_fields if field not in data]
        if missing:
            raise ValidationError(f"Thiếu các trường bắt buộc: {', '.join(missing)}")
    
    return data


def build_success_response(data: dict, user_id: str, metadata: dict = None) -> dict:
    """
    Build success response với format chuẩn
    
    Args:
        data: Data chính cần trả về
        user_id: ID của user
        metadata: Metadata bổ sung
    
    Returns:
        Response dict
    """
    from datetime import datetime
    
    response = {
        'success': True,
        'data': {
            **data,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }
    }
    
    if metadata:
        response['data']['metadata'] = metadata
    
    return response

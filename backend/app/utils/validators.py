"""
Validators - Các hàm validate dữ liệu
"""
import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_user_data(data):
    """
    Validate dữ liệu user
    Returns: (is_valid, error_message)
    """
    required_fields = ['username', 'email', 'password']

    # Kiểm tra các trường bắt buộc
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f'Trường {field} là bắt buộc'

    # Validate username
    username = data.get('username')
    if len(username) < 3:
        return False, 'Username phải có ít nhất 3 ký tự'
    if len(username) > 80:
        return False, 'Username không được vượt quá 80 ký tự'

    # Validate email
    email = data.get('email')
    if not validate_email(email):
        return False, 'Email không hợp lệ'

    # Validate password
    password = data.get('password')
    if len(password) < 6:
        return False, 'Password phải có ít nhất 6 ký tự'

    return True, None

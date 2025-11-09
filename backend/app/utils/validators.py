"""
Validators - Các hàm validate dữ liệu
"""
import re
from bson import ObjectId
from bson.errors import InvalidId

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """
    Validate password
    - Ít nhất 8 ký tự
    - Có ít nhất 1 chữ hoa
    - Có ít nhất 1 chữ thường
    - Có ít nhất 1 số
    """
    if len(password) < 8:
        return False, 'Mật khẩu phải có ít nhất 8 ký tự'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Mật khẩu phải có ít nhất 1 chữ hoa'
    
    if not re.search(r'[a-z]', password):
        return False, 'Mật khẩu phải có ít nhất 1 chữ thường'
    
    if not re.search(r'\d', password):
        return False, 'Mật khẩu phải có ít nhất 1 số'
    
    return True, 'Mật khẩu hợp lệ'

def validate_username(username):
    """
    Validate username
    - 3-20 ký tự
    - Chỉ chứa chữ, số, dấu gạch dưới
    """
    if len(username) < 3 or len(username) > 20:
        return False, 'Tên đăng nhập phải từ 3-20 ký tự'
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới'
    
    return True, 'Tên đăng nhập hợp lệ'

def validate_phone(phone):
    """Validate phone number (Vietnam format)"""
    pattern = r'^(0|\+84)[0-9]{9,10}$'
    return bool(re.match(pattern, phone))

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
    username_valid, username_msg = validate_username(username)
    if not username_valid:
        return False, username_msg

    # Validate email
    email = data.get('email')
    if not validate_email(email):
        return False, 'Email không hợp lệ'

    # Validate password
    password = data.get('password')
    password_valid, password_msg = validate_password(password)
    if not password_valid:
        return False, password_msg

    return True, None

def validate_object_id(id_string):
    """
    Validate MongoDB ObjectId
    Returns: (is_valid, ObjectId or None, error_message)
    """
    if not id_string:
        return False, None, 'ID không được để trống'
    
    try:
        object_id = ObjectId(id_string)
        return True, object_id, None
    except (InvalidId, TypeError, ValueError):
        return False, None, 'ID không hợp lệ'

def validate_name(name):
    """
    Validate tên người dùng
    - 2-100 ký tự
    - Không chứa ký tự đặc biệt nguy hiểm
    Returns: (is_valid, error_message)
    """
    if not name or not name.strip():
        return False, 'Tên không được để trống'
    
    name = name.strip()
    
    if len(name) < 2:
        return False, 'Tên phải có ít nhất 2 ký tự'
    
    if len(name) > 100:
        return False, 'Tên không được vượt quá 100 ký tự'
    
    dangerous_chars = ['<', '>', '{', '}', '$', '\\', '|']
    if any(char in name for char in dangerous_chars):
        return False, 'Tên chứa ký tự không hợp lệ'
    
    return True, None

def validate_student_id(student_id):
    """
    Validate mã sinh viên
    - 3-20 ký tự
    - Chỉ chứa chữ, số, dấu gạch ngang và gạch dưới
    Returns: (is_valid, error_message)
    """
    if not student_id or not student_id.strip():
        return False, 'Mã sinh viên không được để trống'
    
    student_id = student_id.strip()
    
    if len(student_id) < 3 or len(student_id) > 20:
        return False, 'Mã sinh viên phải từ 3-20 ký tự'
    
    if not re.match(r'^[a-zA-Z0-9_-]+$', student_id):
        return False, 'Mã sinh viên chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới'
    
    return True, None

def validate_major(major):
    """
    Validate chuyên ngành
    - Tối đa 100 ký tự
    - Không chứa ký tự đặc biệt nguy hiểm
    Returns: (is_valid, error_message)
    """
    if not major:
        return True, None
    
    major = major.strip()
    
    if len(major) > 100:
        return False, 'Chuyên ngành không được vượt quá 100 ký tự'
    
    dangerous_chars = ['<', '>', '{', '}', '$', '\\', '|']
    if any(char in major for char in dangerous_chars):
        return False, 'Chuyên ngành chứa ký tự không hợp lệ'
    
    return True, None

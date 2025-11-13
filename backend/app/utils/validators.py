import re
from bson import ObjectId
from bson.errors import InvalidId

# === Regex patterns ===
PATTERNS = {
    "email": re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"),
    "username": re.compile(r"^[a-zA-Z0-9_]{3,20}$"),
    "student_id": re.compile(r"^[a-zA-Z0-9_-]{3,20}$"),
    "phone": re.compile(r"^(0|\+84)[0-9]{9,10}$")
}

DANGEROUS_CHARS = {"<", ">"}

# === Base utilities ===
def _has_dangerous_chars(value: str) -> bool:
    return any(c in value for c in DANGEROUS_CHARS)

def _empty(value: str) -> bool:
    return not value or not value.strip()

# === Validators ===
def validate_email(email: str) -> bool:
    return bool(PATTERNS["email"].fullmatch(email or ""))

def validate_password(password: str):
    if not password or len(password) < 8:
        return False, "Mật khẩu phải có ít nhất 8 ký tự"
    rules = [
        (r"[A-Z]", "ít nhất 1 chữ hoa"),
        (r"[a-z]", "ít nhất 1 chữ thường"),
        (r"\d", "ít nhất 1 số")
    ]
    for regex, msg in rules:
        if not re.search(regex, password):
            return False, f"Mật khẩu phải có {msg}"
    return True, None

def validate_username(username: str):
    if not PATTERNS["username"].fullmatch(username or ""):
        return False, "Tên đăng nhập chỉ được chứa chữ, số, gạch dưới (3–20 ký tự)"
    return True, None

def validate_phone(phone: str) -> bool:
    return bool(PATTERNS["phone"].fullmatch(phone or ""))

def validate_text_field(value: str, field: str, min_len=2, max_len=100):
    if _empty(value):
        return False, f"{field} không được để trống"
    value = value.strip()
    if len(value) < min_len:
        return False, f"{field} phải có ít nhất {min_len} ký tự"
    if len(value) > max_len:
        return False, f"{field} không được vượt quá {max_len} ký tự"
    if _has_dangerous_chars(value):
        return False, f"{field} chứa ký tự không hợp lệ"
    return True, None

def validate_object_id(id_string: str):
    if _empty(id_string):
        return False, None, "ID không được để trống"
    try:
        return True, ObjectId(id_string), None
    except (InvalidId, TypeError, ValueError) as e:
        return False, None, f"ID không hợp lệ ({e})"

def validate_user_data(data: dict):
    for field in ("username", "email", "password"):
        if _empty(data.get(field)):
            return False, f"Trường {field} là bắt buộc"
    ok, msg = validate_username(data["username"])
    if not ok: return False, msg
    if not validate_email(data["email"]):
        return False, "Email không hợp lệ"
    ok, msg = validate_password(data["password"])
    if not ok: return False, msg
    return True, None

def validate_name(name: str):
    return validate_text_field(name, "Tên", min_len=2, max_len=100)

def validate_student_id(student_id: str):
    if not PATTERNS["student_id"].fullmatch(student_id or ""):
        return False, "Mã sinh viên chỉ được chứa chữ, số, gạch ngang/gạch dưới (3–20 ký tự)"
    return True, None

def validate_major(major: str):
    if _empty(major):
        return True, None
    return validate_text_field(major, "Chuyên ngành", min_len=1, max_len=100)

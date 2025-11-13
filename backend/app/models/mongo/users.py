from typing import Any, Dict

from .base import utc_now
from .enums import UserRole, UserStatus


def get_user_schema() -> Dict[str, Any]:
    return {
        "email": "",
        "student_id": "",
        "name": "",
        "role": UserRole.READER.value,
        "major": "",
        "status": UserStatus.ACTIVE.value,
        "preferences": {
            "lang": "vi",
            "theme": "light",
        },
        "created_at": utc_now(),
    }

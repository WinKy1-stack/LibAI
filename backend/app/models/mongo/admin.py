from typing import Any, Dict

from .base import utc_now


def get_admin_config_schema() -> Dict[str, Any]:
    return {
        "key": "",
        "value": {},
        "updated_at": utc_now(),
        "updated_by": None,
    }


def get_auth_session_schema() -> Dict[str, Any]:
    return {
        "user_id": None,
        "refresh_token": "",
        "device": "",
        "ip": "",
        "created_at": utc_now(),
        "expired_at": None,
    }

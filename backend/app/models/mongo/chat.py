from typing import Any, Dict

from .base import utc_now
from .enums import MessageRole, RecommendEvent


def get_conversation_schema() -> Dict[str, Any]:
    return {
        "user_id": None,
        "started_at": utc_now(),
        "ended_at": None,
        "meta": {
            "channel": "web",
            "model": "gpt-4o",
            "lang": "vi",
        },
    }


def get_message_schema() -> Dict[str, Any]:
    return {
        "conversation_id": None,
        "role": MessageRole.USER.value,
        "content": "",
        "citations": [],
        "books": None,
        "metadata": None,
        "latency_ms": 0,
        "ts": utc_now(),
    }


def get_recommend_event_schema() -> Dict[str, Any]:
    return {
        "user_id": None,
        "record_id": None,
        "event": RecommendEvent.VIEW.value,
        "score": 1.0,
        "context": {},
        "ts": utc_now(),
    }

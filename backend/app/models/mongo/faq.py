from typing import Any, Dict

from .base import utc_now
from .enums import FAQStatus


def get_faq_schema() -> Dict[str, Any]:
    return {
        "category": "",
        "question": "",
        "answer": "",
        "tags": [],
        "status": FAQStatus.PUBLISHED.value,
        "updated_by": None,
        "updated_at": utc_now(),
    }

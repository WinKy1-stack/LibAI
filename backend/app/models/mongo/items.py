from typing import Any, Dict

from .base import utc_now
from .enums import ItemStatus


def get_item_schema() -> Dict[str, Any]:
    return {
        "record_id": None,
        "barcode": "",
        "status": ItemStatus.AVAILABLE.value,
        "location": {
            "branch": "",
            "shelf": "",
        },
        "call_number": "",
        "updated_at": utc_now(),
    }

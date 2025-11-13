from typing import Any, Dict

from .base import utc_now
from .enums import SIP2EventType


def get_z3950_cache_schema() -> Dict[str, Any]:
    return {
        "query_hash": "",
        "results": [],
        "expired_at": None,
        "source_host": "",
    }


def get_oai_record_schema() -> Dict[str, Any]:
    return {
        "oai_identifier": "",
        "datestamp": "",
        "setSpec": [],
        "metadata": {},
        "mapped_record_id": None,
        "harvest_log": [],
    }


def get_sip2_event_schema() -> Dict[str, Any]:
    return {
        "type": SIP2EventType.CHECKOUT.value,
        "request": {"payload": ""},
        "response": {"payload": "", "code": ""},
        "user_id": None,
        "item_id": None,
        "ts": utc_now(),
    }

"""
MongoDB Schemas cho Library Chatbox System
Định nghĩa cấu trúc dữ liệu cho các collections
"""

from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from enum import Enum

class UserRole(str, Enum):
    """Roles cho users"""
    READER = "reader"
    LIBRARIAN = "librarian"
    ADMIN = "admin"

class UserStatus(str, Enum):
    """Status cho users"""
    ACTIVE = "active"
    BLOCKED = "blocked"

class ItemStatus(str, Enum):
    """Status cho items (bản sách)"""
    AVAILABLE = "available"
    ON_LOAN = "on_loan"
    RESERVED = "reserved"
    LOST = "lost"

class LoanStatus(str, Enum):
    """Status cho loans"""
    ONGOING = "ongoing"
    RETURNED = "returned"
    OVERDUE = "overdue"

class MessageRole(str, Enum):
    """Roles cho messages"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class FAQStatus(str, Enum):
    """Status cho FAQ"""
    DRAFT = "draft"
    PUBLISHED = "published"

class DocumentType(str, Enum):
    """Types cho documents"""
    PDF = "pdf"
    HTML = "html"
    TXT = "txt"

class DocumentSource(str, Enum):
    """Sources cho documents"""
    INTERNAL = "internal"
    WEB = "web"
    UPLOAD = "upload"

class RecommendEvent(str, Enum):
    """Events cho recommend_events"""
    VIEW = "view"
    CLICK = "click"
    BORROW = "borrow"

class MetricKind(str, Enum):
    """Kinds cho metrics"""
    LLM_COST = "llm_cost"
    LATENCY = "latency"
    ERROR = "error"
    TRAFFIC = "traffic"

class SIP2EventType(str, Enum):
    """Types cho SIP2 events"""
    CHECKOUT = "checkout"
    RENEW = "renew"
    STATUS = "status"

class MARCRecordSource(str, Enum):
    """Sources cho MARC records"""
    LOCAL = "local"
    Z3950 = "z3950"
    OAI = "oai"

# Schema Templates
def get_user_schema() -> Dict[str, Any]:
    """Schema cho collection users"""
    return {
        "email": "",  # unique
        "student_id": "",  # unique
        "name": "",
        "role": UserRole.READER.value,
        "major": "",
        "status": UserStatus.ACTIVE.value,
        "preferences": {
            "lang": "vi",
            "theme": "light"
        },
        "created_at": datetime.now(timezone.utc)
    }

def get_marc_record_schema() -> Dict[str, Any]:
    """Schema cho collection marc_records (LibraryRecordLite format)"""
    return {
        "record_id": "",  # UUID string
        "title": {
            "main": "",
            "subtitle": None
        },
        "contributors": [],  # [{"role": "", "name": ""}]
        "subjects": [],  # [{"term": "", "subdivisions": []}]
        "publication": {
            "place": None,
            "publisher": None,
            "year": ""  # Format: "YYYY"
        },
        "identifiers": {
            "isbn": []  # [{"value": ""}]
        },
        "languages": [],  # ["vi", "en"]
        "format": [],  # ["book", "ebook"]
        "holdings": []  # [{"location_code": "", "call_number": "", "status": ""}]
    }

def get_item_schema() -> Dict[str, Any]:
    """Schema cho collection items
    Note: marc_record schema đã có trường 'holdings' tích hợp sẵn.
    Collection 'items' này có thể được dùng cho quản lý chi tiết hơn hoặc deprecated.
    """
    return {
        "record_id": None,  # UUID string ref to marc_records.record_id (hoặc ObjectId nếu dùng _id)
        "barcode": "",  # unique
        "status": ItemStatus.AVAILABLE.value,
        "location": {
            "branch": "",
            "shelf": ""
        },
        "call_number": "",
        "updated_at": datetime.now(timezone.utc)
    }

def get_loan_schema() -> Dict[str, Any]:
    """Schema cho collection loans"""
    return {
        "user_id": None,  # ObjectId ref to users
        "item_id": None,  # ObjectId ref to items
        "loan_date": datetime.now(timezone.utc),
        "due_date": None,
        "return_date": None,
        "status": LoanStatus.ONGOING.value,
        "sip2": {
            "last_txn_id": "",
            "code": ""
        }
    }

def get_conversation_schema() -> Dict[str, Any]:
    """Schema cho collection conversations"""
    return {
        "user_id": None,  # ObjectId ref to users
        "started_at": datetime.now(timezone.utc),
        "ended_at": None,
        "meta": {
            "channel": "web",
            "model": "gpt-4o",
            "lang": "vi"
        }
    }

def get_message_schema() -> Dict[str, Any]:
    """Schema cho collection messages"""
    return {
        "conversation_id": None,  # ObjectId ref to conversations
        "role": MessageRole.USER.value,
        "content": "",
        "citations": [],  # [{"type": "marc|doc", "record_id": "...", ...}]
        "latency_ms": 0,
        "ts": datetime.now(timezone.utc)
    }

def get_faq_schema() -> Dict[str, Any]:
    """Schema cho collection faq"""
    return {
        "category": "",  # rules | howto | hours
        "question": "",
        "answer": "",
        "tags": [],
        "status": FAQStatus.PUBLISHED.value,
        "updated_by": None,  # ObjectId ref to users
        "updated_at": datetime.now(timezone.utc)
    }

def get_document_schema() -> Dict[str, Any]:
    """Schema cho collection documents"""
    return {
        "title": "",
        "type": DocumentType.PDF.value,
        "source": DocumentSource.INTERNAL.value,
        "lang": "vi",
        "chunks": [],  # [{"seq": 0, "text": "..."}]
        "file_ref": "",  # GridFS reference
        "updated_at": datetime.now(timezone.utc)
    }

def get_recommend_event_schema() -> Dict[str, Any]:
    """Schema cho collection recommend_events"""
    return {
        "user_id": None,  # ObjectId ref to users
        "record_id": None,  # ObjectId ref to marc_records
        "event": RecommendEvent.VIEW.value,
        "score": 1.0,
        "context": {},  # {"query": "...", "major": "..."}
        "ts": datetime.now(timezone.utc)
    }

def get_metric_schema() -> Dict[str, Any]:
    """Schema cho collection metrics"""
    return {
        "kind": MetricKind.LLM_COST.value,
        "labels": {},  # {"model": "gpt-4o", "route": "/chat"}
        "value": 0.0,
        "unit": "usd",  # usd | ms | count
        "ts": datetime.now(timezone.utc),
        "window": "minute"  # minute | hour | day
    }

def get_admin_config_schema() -> Dict[str, Any]:
    """Schema cho collection admin_configs"""
    return {
        "key": "",  # unique
        "value": {},
        "updated_at": datetime.now(timezone.utc),
        "updated_by": None  # ObjectId ref to users
    }

def get_z3950_cache_schema() -> Dict[str, Any]:
    """Schema cho collection z3950_cache"""
    return {
        "query_hash": "",  # unique, sha256
        "results": [],  # [{"control_number": "...", "match_score": 0.92, "snapshot": {}}]
        "expired_at": None,
        "source_host": ""
    }

def get_oai_record_schema() -> Dict[str, Any]:
    """Schema cho collection oai_records"""
    return {
        "oai_identifier": "",  # unique
        "datestamp": "",
        "setSpec": [],
        "metadata": {},  # MARCXML/DC
        "mapped_record_id": None,  # ObjectId ref to marc_records
        "harvest_log": []  # [{"ts": ISODate(), "status": "ok", "note": ""}]
    }

def get_sip2_event_schema() -> Dict[str, Any]:
    """Schema cho collection sip2_events"""
    return {
        "type": SIP2EventType.CHECKOUT.value,
        "request": {"payload": ""},
        "response": {"payload": "", "code": ""},
        "user_id": None,  # ObjectId ref to users
        "item_id": None,  # ObjectId ref to items
        "ts": datetime.now(timezone.utc)
    }

def get_auth_session_schema() -> Dict[str, Any]:
    """Schema cho collection auth_sessions"""
    return {
        "user_id": None,  # ObjectId ref to users
        "refresh_token": "",
        "device": "",
        "ip": "",
        "created_at": datetime.now(timezone.utc),
        "expired_at": None
    }

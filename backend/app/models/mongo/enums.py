from enum import Enum


class UserRole(str, Enum):
    READER = "reader"
    LIBRARIAN = "librarian"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"


class ItemStatus(str, Enum):
    AVAILABLE = "available"
    ON_LOAN = "on_loan"
    RESERVED = "reserved"
    LOST = "lost"


class LoanStatus(str, Enum):
    ONGOING = "ongoing"
    RETURNED = "returned"
    OVERDUE = "overdue"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class FAQStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class DocumentType(str, Enum):
    PDF = "pdf"
    HTML = "html"
    TXT = "txt"


class DocumentSource(str, Enum):
    INTERNAL = "internal"
    WEB = "web"
    UPLOAD = "upload"


class RecommendEvent(str, Enum):
    VIEW = "view"
    CLICK = "click"
    BORROW = "borrow"


class MetricKind(str, Enum):
    LLM_COST = "llm_cost"
    LATENCY = "latency"
    ERROR = "error"
    TRAFFIC = "traffic"


class SIP2EventType(str, Enum):
    CHECKOUT = "checkout"
    RENEW = "renew"
    STATUS = "status"


class MARCRecordSource(str, Enum):
    LOCAL = "local"
    Z3950 = "z3950"
    OAI = "oai"

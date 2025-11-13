from typing import Any, Dict

from .base import utc_now
from .enums import LoanStatus


def get_loan_schema() -> Dict[str, Any]:
    return {
        "user_id": None,
        "item_id": None,
        "loan_date": utc_now(),
        "due_date": None,
        "return_date": None,
        "status": LoanStatus.ONGOING.value,
        "sip2": {
            "last_txn_id": "",
            "code": "",
        },
    }

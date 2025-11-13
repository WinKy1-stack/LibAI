from typing import Any, Dict

from .base import utc_now
from .enums import MetricKind


def get_metric_schema() -> Dict[str, Any]:
    return {
        "kind": MetricKind.LLM_COST.value,
        "labels": {},
        "value": 0.0,
        "unit": "usd",
        "ts": utc_now(),
        "window": "minute",
    }

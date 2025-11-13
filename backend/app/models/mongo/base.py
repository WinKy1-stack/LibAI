from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

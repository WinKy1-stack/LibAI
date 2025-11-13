from typing import Any, Dict

from .base import utc_now_iso
from .enums import MARCRecordSource


def get_marc_record_schema() -> Dict[str, Any]:
    now_iso = utc_now_iso()
    return {
        "record_id": "",
        "leader": "",
        "control_number": "",
        "agency_code": "",
        "updated_at": now_iso,
        "created_at": now_iso,
        "source": MARCRecordSource.LOCAL.value,
        "rights": {
            "access": "",
            "format": [],
        },
        "fixed_fields": {
            "date_entered": "",
            "type_of_record": "",
            "language": "",
            "publication_year": "",
        },
        "identifiers": {
            "isbn": [],
            "other": [],
        },
        "title": {
            "main": "",
            "subtitle": None,
        },
        "contributors": [],
        "edition": "",
        "publication": {
            "publisher": "",
            "place": "",
            "year": "",
        },
        "physical_description": {
            "extent": "",
            "size": "",
            "illustration": "",
        },
        "notes": [],
        "subjects": [],
        "classification": {
            "ddc": "",
            "lcc": "",
        },
        "holdings": [],
        "access": {
            "online_url": "",
            "restrictions": "",
        },
        "format": [],
        "image_url": "",
    }

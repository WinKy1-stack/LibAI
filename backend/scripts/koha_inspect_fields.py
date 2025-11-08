"""
Koha Fields Inspector
- Calls key Koha REST API v1 endpoints
- Prints returned field names and a few sample values for verification

Usage:
  python scripts/koha_inspect_fields.py
"""
import os
import sys
import json
from typing import Any, Dict, List
from dotenv import load_dotenv

# Ensure we can import the Flask app when running this script directly
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(SCRIPT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

# Load .env from backend root explicitly (avoid failing if cwd differs)
dotenv_path = os.path.join(BACKEND_ROOT, '.env')
load_dotenv(dotenv_path=dotenv_path)

try:
    from app import create_app
    from app.config import DevelopmentConfig
except Exception as import_err:
    print("Failed to import app modules. Verify BACKEND_ROOT path.")
    print(f"BACKEND_ROOT={BACKEND_ROOT}")
    print(f"Import error: {import_err}")
    sys.exit(1)

# Import Koha tools/client
from app.services.library.koha_client import KohaClient


def print_header(title: str):
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)


def flatten_keys(d: Any, prefix: str = "") -> List[str]:
    keys: List[str] = []
    if isinstance(d, dict):
        for k, v in d.items():
            full = f"{prefix}.{k}" if prefix else str(k)
            keys.append(full)
            keys.extend(flatten_keys(v, full))
    elif isinstance(d, list) and d:
        keys.extend(flatten_keys(d[0], prefix + "[]"))
    return keys


def sample_value(d: Dict[str, Any], path: str):
    parts = path.replace("[]", "").split(".")
    cur: Any = d
    try:
        for p in parts:
            if isinstance(cur, list):
                cur = cur[0] if cur else None
            if isinstance(cur, dict):
                cur = cur.get(p)
        return cur
    except Exception:
        return None


def inspect_endpoint(name: str, data: Any, keys_root: str = ""):
    print_header(f"{name} - RAW (truncated)")
    text = json.dumps(data, ensure_ascii=False, indent=2)
    print(text[:2000] + ("..." if len(text) > 2000 else ""))

    print_header(f"{name} - FIELD KEYS")
    root_obj = data if isinstance(data, dict) else ({"items": data} if isinstance(data, list) else {"value": data})
    keys = sorted(set(flatten_keys(root_obj)))
    for k in keys:
        val = sample_value(root_obj, k)
        if isinstance(val, (dict, list)):
            t = "dict" if isinstance(val, dict) else "list"
            print(f"- {k} : <{t}>")
        else:
            print(f"- {k} : {val}")


def main():
    app = create_app(DevelopmentConfig)
    with app.app_context():
        client = KohaClient()

        # 1) Patrons list (first page)
        try:
            url = f"{client.base_url}/api/v1/patrons?_page=1&_per_page=5"
            import requests
            resp = requests.get(url, headers=client._headers(), timeout=15)
            patrons = client._handle_response(resp)
            inspect_endpoint("GET /api/v1/patrons?_page=1&_per_page=5", patrons)
        except Exception as e:
            print_header("Patrons list ERROR")
            print(str(e))

        # 2) Patron by id (1)
        try:
            patron = client.get_patron(1)
            inspect_endpoint("GET /api/v1/patrons/1", patron)
        except Exception as e:
            print_header("Patron by id ERROR")
            print(str(e))

        # 3) Biblio by id (1..3)
        for bid in [1, 2, 3]:
            try:
                biblio = client.get_biblio(bid)
                inspect_endpoint(f"GET /api/v1/biblios/{bid}", biblio)
            except Exception as e:
                print_header(f"Biblio {bid} ERROR")
                print(str(e))

        # 4) Items for each biblio
        for bid in [1, 2, 3]:
            try:
                items = client.get_items_by_biblio(bid)
                inspect_endpoint(f"GET /api/v1/biblios/{bid}/items", items)
            except Exception as e:
                print_header(f"Items for biblio {bid} ERROR")
                print(str(e))

        # 5) Checkouts for patron 1
        try:
            checkouts = client.get_patron_checkouts(1)
            inspect_endpoint("GET /api/v1/patrons/1/checkouts", checkouts)
        except Exception as e:
            print_header("Checkouts ERROR")
            print(str(e))

        # 6) Holds for patron 1
        try:
            holds = client.get_patron_holds(1)
            inspect_endpoint("GET /api/v1/patrons/1/holds", holds)
        except Exception as e:
            print_header("Holds ERROR")
            print(str(e))


if __name__ == "__main__":
    main()

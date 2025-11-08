"""Test Accept header với Koha"""
import requests
import json
import base64

KOHA_BASE_URL = "http://45.118.146.109:8082"
KOHA_USERNAME = "admin"
KOHA_PASSWORD = "Idt882013!"

def get_headers(accept='application/json'):
    token = base64.b64encode(f"{KOHA_USERNAME}:{KOHA_PASSWORD}".encode()).decode()
    return {
        'Authorization': f"Basic {token}",
        'Accept': accept,
    }

print("=" * 80)
print("TEST Accept HEADER VÀ ENCODING")
print("=" * 80)

query = "toán"
koha_query = {"title": {"-like": f"%{query}%"}}

# Test 1: Dùng json.dumps với ensure_ascii=False
print("\n1. json.dumps với ensure_ascii=False")
q_param = json.dumps(koha_query, ensure_ascii=False)
print(f"Query param: {q_param}")
url = f"{KOHA_BASE_URL}/api/v1/biblios"
params = {'q': q_param, '_per_page': 2}

resp = requests.get(url, headers=get_headers('application/json'), params=params, timeout=10)
print(f"Status: {resp.status_code}")
print(f"Content-Type: {resp.headers.get('Content-Type')}")
print(f"First 100 chars: {resp.text[:100]}")

# Test 2: Dùng json.dumps với ensure_ascii=TRUE (default)
print("\n2. json.dumps với ensure_ascii=True (default)")
q_param2 = json.dumps(koha_query, ensure_ascii=True)
print(f"Query param: {q_param2}")
params2 = {'q': q_param2, '_per_page': 2}

resp2 = requests.get(url, headers=get_headers('application/json'), params=params2, timeout=10)
print(f"Status: {resp2.status_code}")
print(f"Content-Type: {resp2.headers.get('Content-Type')}")
print(f"First 100 chars: {resp2.text[:100]}")

# Test 3: No 'q' param
print("\n3. No 'q' param (get all)")
params3 = {'_per_page': 2}
resp3 = requests.get(url, headers=get_headers('application/json'), params=params3, timeout=10)
print(f"Status: {resp3.status_code}")
print(f"Content-Type: {resp3.headers.get('Content-Type')}")
print(f"First 100 chars: {resp3.text[:100]}")
if resp3.status_code == 200:
    try:
        data = resp3.json()
        print(f"✓ JSON parse OK, type: {type(data)}, len: {len(data) if isinstance(data, list) else '?'}")
    except:
        print(f"✗ JSON parse failed")

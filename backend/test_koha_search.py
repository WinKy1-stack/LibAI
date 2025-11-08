"""
Test Koha API endpoints trực tiếp để tìm cách search hoạt động

Koha REST API docs: https://koha-community.org/manual/latest/en/html/restfulapi.html
"""
import requests
import json
import base64

# Config từ .env
KOHA_BASE_URL = "http://45.118.146.109:8082"
KOHA_USERNAME = "admin"
KOHA_PASSWORD = "Idt882013!"

def get_headers():
    token = base64.b64encode(f"{KOHA_USERNAME}:{KOHA_PASSWORD}".encode()).decode()
    return {
        'Authorization': f"Basic {token}",
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

print("=" * 80)
print("TEST KOHA REST API - TÌM CÁCH SEARCH BIBLIOS")
print("=" * 80)

# Test 1: GET /api/v1/biblios (no params) - xem có list không
print("\n1. GET /api/v1/biblios (no params)")
print("-" * 80)
try:
    url = f"{KOHA_BASE_URL}/api/v1/biblios"
    resp = requests.get(url, headers=get_headers(), timeout=10)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Response type: {type(data)}")
        if isinstance(data, list):
            print(f"✓ Trả về list với {len(data)} items")
            if data:
                print(f"  Sample keys: {list(data[0].keys())[:5]}")
        elif isinstance(data, dict):
            print(f"✓ Trả về dict với keys: {list(data.keys())}")
    else:
        print(f"✗ Error: {resp.text[:200]}")
except Exception as e:
    print(f"✗ Exception: {e}")

# Test 2: GET /api/v1/biblios với pagination params
print("\n2. GET /api/v1/biblios?_page=1&_per_page=5")
print("-" * 80)
try:
    url = f"{KOHA_BASE_URL}/api/v1/biblios"
    resp = requests.get(url, headers=get_headers(), params={'_page': 1, '_per_page': 5}, timeout=10)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list):
            print(f"✓ Trả về {len(data)} biblios")
            for item in data[:2]:
                print(f"  - ID {item.get('biblio_id')}: {item.get('title', 'N/A')[:50]}")
    else:
        print(f"✗ Error: {resp.text[:200]}")
except Exception as e:
    print(f"✗ Exception: {e}")

# Test 3: Search với q parameter (theo Koha docs)
print("\n3. GET /api/v1/biblios?q={\"title\": {\"like\": \"%toán%\"}}")
print("-" * 80)
try:
    url = f"{KOHA_BASE_URL}/api/v1/biblios"
    # Koha JSON query format
    query_json = {"title": {"-like": "%toán%"}}
    resp = requests.get(url, headers=get_headers(), params={'q': json.dumps(query_json)}, timeout=10)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✓ Success! Found {len(data) if isinstance(data, list) else 'N/A'} results")
        if isinstance(data, list) and data:
            for item in data[:2]:
                print(f"  - ID {item.get('biblio_id')}: {item.get('title', 'N/A')[:50]}")
    else:
        print(f"✗ Error: {resp.text[:300]}")
except Exception as e:
    print(f"✗ Exception: {e}")

# Test 4: Search bằng author
print("\n4. GET /api/v1/biblios?q={\"author\": {\"like\": \"%Nguyễn%\"}}")
print("-" * 80)
try:
    url = f"{KOHA_BASE_URL}/api/v1/biblios"
    query_json = {"author": {"-like": "%Nguyễn%"}}
    resp = requests.get(url, headers=get_headers(), params={'q': json.dumps(query_json)}, timeout=10)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✓ Found {len(data) if isinstance(data, list) else 'N/A'} results")
        if isinstance(data, list) and data:
            for item in data[:2]:
                print(f"  - {item.get('title', 'N/A')[:40]} by {item.get('author', 'N/A')}")
    else:
        print(f"✗ Error: {resp.text[:300]}")
except Exception as e:
    print(f"✗ Exception: {e}")

# Test 5: Try simple URL query (không dùng JSON)
print("\n5. GET /api/v1/biblios?title=toán")
print("-" * 80)
try:
    url = f"{KOHA_BASE_URL}/api/v1/biblios"
    resp = requests.get(url, headers=get_headers(), params={'title': 'toán'}, timeout=10)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✓ Found {len(data) if isinstance(data, list) else 'N/A'} results")
    else:
        print(f"✗ Error: {resp.text[:300]}")
except Exception as e:
    print(f"✗ Exception: {e}")

print("\n" + "=" * 80)
print("KẾT LUẬN:")
print("=" * 80)
print("Dựa vào kết quả trên, xác định endpoint/params nào hoạt động")
print("để update koha_client.py")

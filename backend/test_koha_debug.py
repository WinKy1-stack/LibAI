"""Debug Koha search request chi tiết"""
import requests
import json
import base64

KOHA_BASE_URL = "http://45.118.146.109:8082"
KOHA_USERNAME = "admin"
KOHA_PASSWORD = "Idt882013!"

def get_headers():
    token = base64.b64encode(f"{KOHA_USERNAME}:{KOHA_PASSWORD}".encode()).decode()
    return {
        'Authorization': f"Basic {token}",
        'Accept': 'application/json',
    }

print("=" * 80)
print("DEBUG KOHA SEARCH - XEM REQUEST/RESPONSE CHI TIẾT")
print("=" * 80)

# Test theo đúng cách đã test thành công trước đó
query = "toán"
koha_query = {"title": {"-like": f"%{query}%"}}
params = {
    'q': json.dumps(koha_query),
    '_per_page': 5,
    '_page': 1
}

url = f"{KOHA_BASE_URL}/api/v1/biblios"

print(f"\n📤 REQUEST:")
print(f"URL: {url}")
print(f"Headers: {dict(get_headers())}")
print(f"Params: {params}")
print(f"Params (URL encoded): {requests.utils.requote_uri(requests.Request('GET', url, params=params).prepare().url)}")

try:
    resp = requests.get(url, headers=get_headers(), params=params, timeout=10)
    
    print(f"\n📥 RESPONSE:")
    print(f"Status: {resp.status_code}")
    print(f"Headers: {dict(resp.headers)}")
    print(f"Content-Type: {resp.headers.get('Content-Type')}")
    print(f"Body length: {len(resp.text)} bytes")
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"\n✓ Success!")
        print(f"Response type: {type(data)}")
        if isinstance(data, list):
            print(f"Results: {len(data)} items")
            if data:
                print(f"\nFirst result:")
                first = data[0]
                print(f"  biblio_id: {first.get('biblio_id')}")
                print(f"  title: {first.get('title', 'N/A')[:50]}")
                print(f"  author: {first.get('author', 'N/A')}")
        elif isinstance(data, dict):
            print(f"Response dict keys: {list(data.keys())}")
    else:
        print(f"\n✗ Error!")
        print(f"Body: {resp.text[:500]}")
        
except Exception as e:
    print(f"\n💥 Exception: {e}")
    import traceback
    traceback.print_exc()

# Also try without q parameter
print("\n" + "=" * 80)
print("TEST 2: Get all (no filter)")
print("=" * 80)
try:
    params2 = {'_per_page': 5, '_page': 1}
    resp2 = requests.get(url, headers=get_headers(), params=params2, timeout=10)
    print(f"Status: {resp2.status_code}")
    if resp2.status_code == 200:
        data2 = resp2.json()
        print(f"✓ Got {len(data2) if isinstance(data2, list) else '?'} results")
        if isinstance(data2, list) and data2:
            print(f"Sample: {data2[0].get('title', 'N/A')[:40]}")
except Exception as e2:
    print(f"✗ Failed: {e2}")

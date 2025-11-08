"""
Script test Koha API endpoints qua Flask backend
Chạy: python test_koha_api.py (sau khi đã start server bằng python run.py)
"""
import requests
import json
import time

BASE_URL = "http://localhost:5000"

def print_response(title, response):
    """In kết quả response"""
    print(f"\n{'='*70}")
    print(f"📋 {title}")
    print(f"{'='*70}")
    print(f"Status: {response.status_code}")
    
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
    except:
        print(f"Response: {response.text}")
    
    print(f"{'='*70}\n")

def test_search_books():
    """Test tìm kiếm sách"""
    url = f"{BASE_URL}/api/library/koha/search"
    params = {"query": "toán", "limit": 3}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print_response("TEST: Search Books (query='toán', limit=3)", response)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_biblio():
    """Test lấy thông tin biblio"""
    biblio_id = 2
    url = f"{BASE_URL}/api/library/koha/biblio/{biblio_id}"
    
    try:
        response = requests.get(url, timeout=10)
        print_response(f"TEST: Get Biblio (id={biblio_id})", response)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_patron():
    """Test lấy thông tin patron"""
    patron_id = 1
    url = f"{BASE_URL}/api/library/koha/patron/{patron_id}"
    
    try:
        response = requests.get(url, timeout=10)
        print_response(f"TEST: Get Patron (id={patron_id})", response)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_patron_checkouts():
    """Test lấy danh sách mượn sách của patron"""
    patron_id = 1
    url = f"{BASE_URL}/api/library/koha/patron/{patron_id}/checkouts"
    
    try:
        response = requests.get(url, timeout=10)
        print_response(f"TEST: Get Patron Checkouts (patron_id={patron_id})", response)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_patron_holds():
    """Test lấy danh sách holds của patron"""
    patron_id = 1
    url = f"{BASE_URL}/api/library/koha/patron/{patron_id}/holds"
    
    try:
        response = requests.get(url, timeout=10)
        print_response(f"TEST: Get Patron Holds (patron_id={patron_id})", response)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_item():
    """Test lấy thông tin item"""
    item_id = 1
    url = f"{BASE_URL}/api/library/koha/item/{item_id}"
    
    try:
        response = requests.get(url, timeout=10)
        print_response(f"TEST: Get Item (id={item_id})", response)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_server():
    """Kiểm tra server có đang chạy không"""
    try:
        response = requests.get(BASE_URL, timeout=5)
        return True
    except:
        return False

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🧪 KOHA API INTEGRATION TESTING")
    print("="*70)
    
    # Kiểm tra server
    print("\n⏳ Checking if server is running...")
    time.sleep(2)
    
    if not check_server():
        print("❌ Server is not running!")
        print("💡 Please start server first: python run.py")
        exit(1)
    
    print("✅ Server is running!")
    
    # Chạy các test
    results = {
        "Search Books": test_search_books(),
        "Get Biblio": test_get_biblio(),
        "Get Patron": test_get_patron(),
        "Get Patron Checkouts": test_get_patron_checkouts(),
        "Get Patron Holds": test_get_patron_holds(),
        "Get Item": test_get_item(),
    }
    
    # Tổng kết
    print("\n" + "="*70)
    print("📊 TEST SUMMARY")
    print("="*70)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:30s} {status}")
    
    passed_count = sum(results.values())
    total_count = len(results)
    print(f"\n{passed_count}/{total_count} tests passed")
    print("="*70 + "\n")

"""
Test Suite cho Chat AI Service
Kiểm tra tất cả các endpoints của chat service
"""
import requests
import json
import sys
from typing import Optional

BASE_URL = "http://localhost:5000"


class Colors:
    """ANSI color codes"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_header(text: str):
    """Print colored header"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.HEADER}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'=' * 60}{Colors.END}\n")


def print_test(test_name: str):
    """Print test name"""
    print(f"{Colors.BLUE}{Colors.BOLD}🧪 {test_name}{Colors.END}")


def print_success(message: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")


def print_error(message: str):
    """Print error message"""
    print(f"{Colors.FAIL}❌ {message}{Colors.END}")


def print_info(message: str):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ️  {message}{Colors.END}")


def print_response(response: requests.Response, show_full: bool = False):
    """Print response với format đẹp"""
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        if show_full:
            print(f"Response:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            # Chỉ show summary
            if data.get('success'):
                print_success("Request successful")
                if 'data' in data:
                    if 'message' in data['data']:
                        msg = data['data']['message']
                        print(f"  Message: {msg[:100]}...")
                    if 'metadata' in data['data']:
                        print(f"  Metadata: {data['data']['metadata']}")
            else:
                print_error("Request failed")
                if 'error' in data:
                    print(f"  Error: {data['error'].get('message')}")
                    print(f"  Type: {data['error'].get('type')}")
    except json.JSONDecodeError:
        print(f"Response: {response.text}")
    
    print()


def test_health() -> bool:
    """Test 1: Health check endpoint"""
    print_test("Test 1: Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/api/chat/health", timeout=10)
        print_response(response, show_full=True)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data['data']['status'] == 'healthy':
                print_success("Health check passed!")
                return True
        
        print_error("Health check failed!")
        return False
        
    except requests.exceptions.RequestException as e:
        print_error(f"Connection error: {str(e)}")
        return False


def test_login() -> Optional[str]:
    """Test 2: Login to get JWT token"""
    print_test("Test 2: Authentication")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "username": "admin@ntt.edu.vn",
                "password": "Password123"
            },
            timeout=10
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            if token:
                print_success(f"Login successful! Token: {token[:30]}...")
                return token
        
        print_error("Login failed!")
        print_info("Thử với: admin@ntt.edu.vn / Password123")
        return None
        
    except requests.exceptions.RequestException as e:
        print_error(f"Login error: {str(e)}")
        return None


def test_chat_message(token: str) -> bool:
    """Test 3: Chat message endpoint"""
    print_test("Test 3: Simple Chat Message")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "message": "Xin chào! Bạn có thể giúp tôi tìm sách về Python không?"
            },
            timeout=30
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'message' in data.get('data', {}):
                print_success("Chat message successful!")
                return True
        
        print_error("Chat message failed!")
        return False
        
    except requests.exceptions.RequestException as e:
        print_error(f"Chat error: {str(e)}")
        return False


def test_chat_with_history(token: str) -> bool:
    """Test 4: Chat with history"""
    print_test("Test 4: Chat với lịch sử")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "message": "Tôi là người mới bắt đầu, sách nào phù hợp?",
                "chat_history": [
                    {
                        "role": "user",
                        "content": "Tôi muốn học Python"
                    },
                    {
                        "role": "assistant",
                        "content": "Python là ngôn ngữ tuyệt vời để bắt đầu!"
                    }
                ]
            },
            timeout=30
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Chat with history successful!")
                return True
        
        print_error("Chat with history failed!")
        return False
        
    except requests.exceptions.RequestException as e:
        print_error(f"Error: {str(e)}")
        return False


def test_recommendations(token: str) -> bool:
    """Test 5: Book recommendations"""
    print_test("Test 5: Gợi ý sách")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/chat/recommend",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "preferences": {
                    "category": "Programming",
                    "level": "Beginner",
                    "topics": "Python, Machine Learning"
                },
                "available_books": [
                    {
                        "title": "Python Crash Course",
                        "author": "Eric Matthes",
                        "category": "Programming"
                    },
                    {
                        "title": "Hands-On Machine Learning",
                        "author": "Aurélien Géron",
                        "category": "AI"
                    },
                    {
                        "title": "Clean Code",
                        "author": "Robert C. Martin",
                        "category": "Programming"
                    }
                ]
            },
            timeout=30
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Book recommendations successful!")
                return True
        
        print_error("Book recommendations failed!")
        return False
        
    except requests.exceptions.RequestException as e:
        print_error(f"Error: {str(e)}")
        return False


def test_search(token: str) -> bool:
    """Test 6: AI search"""
    print_test("Test 6: Tìm kiếm thông minh")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/chat/search",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "query": "Sách về Machine Learning cho người mới bắt đầu",
                "books_data": [
                    {
                        "_id": "book1",
                        "title": "Python Machine Learning",
                        "author": "Sebastian Raschka",
                        "category": "AI"
                    },
                    {
                        "_id": "book2",
                        "title": "Deep Learning",
                        "author": "Ian Goodfellow",
                        "category": "AI"
                    }
                ]
            },
            timeout=30
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("AI search successful!")
                return True
        
        print_error("AI search failed!")
        return False
        
    except requests.exceptions.RequestException as e:
        print_error(f"Error: {str(e)}")
        return False


def test_error_handling(token: str) -> bool:
    """Test 7: Error handling"""
    print_test("Test 7: Error Handling")
    
    tests = [
        ("Empty message", {"message": ""}),
        ("Missing message", {}),
        ("Empty books", {"query": "test", "books_data": []})
    ]
    
    passed = 0
    for test_name, payload in tests:
        try:
            print_info(f"Testing: {test_name}")
            response = requests.post(
                f"{BASE_URL}/api/chat/message",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if not data.get('success') and 'error' in data:
                    print_success(f"  Correctly handled: {data['error']['message']}")
                    passed += 1
            else:
                print_error(f"  Expected 400, got {response.status_code}")
                
        except Exception as e:
            print_error(f"  Error: {str(e)}")
    
    print()
    if passed == len(tests):
        print_success("All error handling tests passed!")
        return True
    
    print_error(f"Only {passed}/{len(tests)} error tests passed")
    return False


def main():
    """Run all tests"""
    print_header("🚀 CHAT AI SERVICE - TEST SUITE")
    
    print_info(f"Testing server at: {BASE_URL}")
    print_info("Make sure server is running: python backend/run.py\n")
    
    # Test results
    results = {
        'passed': 0,
        'failed': 0,
        'total': 7
    }
    
    # Test 1: Health check
    if test_health():
        results['passed'] += 1
    else:
        results['failed'] += 1
        print_error("Server không chạy! Thoát test.")
        sys.exit(1)
    
    # Test 2: Login
    token = test_login()
    if token:
        results['passed'] += 1
    else:
        results['failed'] += 1
        print_error("Không thể login! Thoát test.")
        sys.exit(1)
    
    # Test 3-7: API tests
    tests = [
        ("Chat Message", test_chat_message),
        ("Chat với History", test_chat_with_history),
        ("Book Recommendations", test_recommendations),
        ("AI Search", test_search),
        ("Error Handling", test_error_handling)
    ]
    
    for test_name, test_func in tests:
        try:
            if test_func(token):
                results['passed'] += 1
            else:
                results['failed'] += 1
        except Exception as e:
            print_error(f"{test_name} crashed: {str(e)}")
            results['failed'] += 1
    
    # Print summary
    print_header("📊 TEST SUMMARY")
    print(f"Total Tests: {results['total']}")
    print(f"{Colors.GREEN}✅ Passed: {results['passed']}{Colors.END}")
    print(f"{Colors.FAIL}❌ Failed: {results['failed']}{Colors.END}")
    
    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED!{Colors.END}")
        sys.exit(0)
    
    print(f"\n{Colors.FAIL}{Colors.BOLD}❌ SOME TESTS FAILED{Colors.END}")
    sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}⚠️  Tests interrupted by user{Colors.END}")
        sys.exit(130)
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server!")
        print_info("Make sure server is running: python backend/run.py")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)

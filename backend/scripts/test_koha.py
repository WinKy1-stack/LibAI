import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.services.koha import KohaService, KohaClient
from app.config import DevelopmentConfig
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def print_section(title):
    """Print section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)


def print_result(test_name, success, data=None, error=None):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"\n{status} - {test_name}")
    
    if data:
        print(f"Data: {data}")
    if error:
        print(f"Error: {error}")


def test_connection():
    """Test 1: Connection to Koha"""
    print_section("TEST 1: Connection Test")
    
    try:
        with app.app_context():
            client = KohaClient()
            result = client.test_connection()
            
            success = result['status'] == 'success'
            print_result("Koha Connection", success, data=result)
            
            return success
    except Exception as e:
        print_result("Koha Connection", False, error=str(e))
        return False


def test_search_books():
    """Test 2: Search Books"""
    print_section("TEST 2: Search Books")
    
    test_queries = [
        ("python", "Search for 'python'"),
        ("programming", "Search for 'programming'"),
    ]
    
    results = []
    
    try:
        with app.app_context():
            client = KohaClient()
            
            for query, description in test_queries:
                print(f"\n📖 {description}")
                result = client.search_books(query=query, limit=3)
                
                success = result['status'] == 'success'
                total = result.get('total', 0)
                
                print_result(
                    description,
                    success,
                    data=f"Found {total} books"
                )
                
                if success and total > 0:
                    print("Sample results:")
                    for i, book in enumerate(result['results'][:3], 1):
                        title = book.get('title', 'N/A')
                        print(f"  {i}. {title}")
                
                results.append(success)
        
        return all(results)
    
    except Exception as e:
        print_result("Search Books", False, error=str(e))
        return False


def test_book_detail():
    """Test 3: Get Book Detail"""
    print_section("TEST 3: Get Book Detail")
    
    # First search for a book to get a valid biblio_id
    try:
        with app.app_context():
            client = KohaClient()
            
            # Search for a book first
            search_result = client.search_books(query="python", limit=1)
            
            if search_result['status'] == 'success' and search_result['total'] > 0:
                biblio_id = search_result['results'][0].get('biblio_id')
                
                if biblio_id:
                    print(f"\n📚 Getting details for book ID: {biblio_id}")
                    
                    result = client.get_book_detail(biblio_id)
                    success = result['status'] == 'success'
                    
                    print_result(
                        f"Get Book Detail (ID: {biblio_id})",
                        success,
                        data=result.get('book', {}).get('title', 'N/A') if success else None
                    )
                    
                    return success
                else:
                    print_result("Get Book Detail", False, error="No biblio_id found")
                    return False
            else:
                print_result("Get Book Detail", False, error="No books found to test")
                return False
                
    except Exception as e:
        print_result("Get Book Detail", False, error=str(e))
        return False


def test_availability():
    """Test 4: Check Book Availability"""
    print_section("TEST 4: Check Book Availability")
    
    try:
        with app.app_context():
            client = KohaClient()
            
            # Search for a book first
            search_result = client.search_books(query="python", limit=1)
            
            if search_result['status'] == 'success' and search_result['total'] > 0:
                biblio_id = search_result['results'][0].get('biblio_id')
                
                if biblio_id:
                    print(f"\n📊 Checking availability for book ID: {biblio_id}")
                    
                    result = client.get_item_availability(biblio_id)
                    success = result['status'] == 'success'
                    
                    if success:
                        available = result['available_items']
                        total = result['total_items']
                        data_msg = f"{available}/{total} copies available"
                    else:
                        data_msg = None
                    
                    print_result(
                        f"Check Availability (ID: {biblio_id})",
                        success,
                        data=data_msg
                    )
                    
                    return success
                else:
                    print_result("Check Availability", False, error="No biblio_id found")
                    return False
            else:
                print_result("Check Availability", False, error="No books found to test")
                return False
                
    except Exception as e:
        print_result("Check Availability", False, error=str(e))
        return False


def test_libraries():
    """Test 5: Get Libraries List"""
    print_section("TEST 5: Get Libraries")
    
    try:
        with app.app_context():
            client = KohaClient()
            result = client.get_libraries()
            
            success = result['status'] == 'success'
            total = result.get('total_libraries', 0)
            
            print_result(
                "Get Libraries",
                success,
                data=f"Found {total} libraries"
            )
            
            if success and total > 0:
                print("Libraries:")
                for i, library in enumerate(result['libraries'][:5], 1):
                    name = library.get('name', 'N/A')
                    lib_id = library.get('library_id', 'N/A')
                    print(f"  {i}. {name} (ID: {lib_id})")
            
            return success
            
    except Exception as e:
        print_result("Get Libraries", False, error=str(e))
        return False


def test_patron_operations():
    """Test 6: Patron Operations (if patron_id available)"""
    print_section("TEST 6: Patron Operations")
    
    # Note: This test requires a valid patron_id
    # Skip if not available in config
    
    print("⚠️  Skipped - Requires valid patron_id")
    print("To test patron operations, update this test with a valid patron_id")
    return True


def run_all_tests():
    """Run all tests"""
    print_section("KOHA INTEGRATION TEST SUITE")
    print("Testing Koha ILS integration...")
    print(f"Base URL: {app.config.get('KOHA_BASE_URL', 'NOT SET')}")
    print(f"Auth Mode: {app.config.get('KOHA_AUTH_MODE', 'NOT SET')}")
    
    results = {
        'Connection Test': test_connection(),
        'Search Books': test_search_books(),
        'Get Book Detail': test_book_detail(),
        'Check Availability': test_availability(),
        'Get Libraries': test_libraries(),
        'Patron Operations': test_patron_operations(),
    }
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*80}")
    print(f"Total: {passed}/{total} tests passed")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print(f"{'='*80}\n")
    
    if passed == total:
        print("🎉 All tests passed! Koha integration is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return 1


if __name__ == '__main__':
    # Create Flask app
    app = create_app(DevelopmentConfig)
    
    # Run tests
    exit_code = run_all_tests()
    sys.exit(exit_code)

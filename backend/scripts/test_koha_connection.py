"""
Test Koha Connection - Kiểm tra kết nối với Koha ILS
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.config import DevelopmentConfig
from app.services.koha.koha_client import KohaClient

print("="*70)
print("KIỂM TRA KẾT NỐI KOHA ILS")
print("="*70)

# Create Flask app context
app = create_app(DevelopmentConfig)

try:
    with app.app_context():
        # Khởi tạo Koha client
        print("\n1. Khởi tạo Koha client...")
        client = KohaClient()
        print("   ✅ Khởi tạo thành công")
    
        # Test connection
        print("\n2. Test kết nối đến Koha API...")
        result = client.service.test_connection()
        
        if result['status'] == 'success':
            print(f"   ✅ {result['message']}")
            print(f"   📍 Base URL: {result['base_url']}")
        else:
            print(f"   ❌ {result['message']}")
            sys.exit(1)
        
        # Lấy danh sách thư viện
        print("\n3. Lấy danh sách thư viện...")
        libs_result = client.get_libraries()
        
        if libs_result['status'] == 'success':
            libraries = libs_result['libraries']
            print(f"   ✅ Tìm thấy {len(libraries)} thư viện")
            
            # Hiển thị 5 thư viện đầu
            print("\n   📚 Danh sách thư viện:")
            for i, lib in enumerate(libraries[:5], 1):
                print(f"      {i}. {lib.get('name', 'N/A')} (ID: {lib.get('library_id', 'N/A')})")
            
            if len(libraries) > 5:
                print(f"      ... và {len(libraries) - 5} thư viện khác")
        else:
            print(f"   ❌ Lỗi: {libs_result.get('message', 'Unknown error')}")
        
        # Test tìm kiếm sách (có thể không có kết quả nếu database trống)
        print("\n4. Test tìm kiếm sách...")
        search_result = client.search_books("python", limit=3)
        
        if search_result['status'] == 'success':
            total = search_result['total']
            if total > 0:
                print(f"   ✅ Tìm thấy {total} kết quả cho 'python'")
            else:
                print(f"   ⚠️  Không có sách nào (database có thể trống)")
        else:
            print(f"   ❌ Lỗi tìm kiếm: {search_result.get('message', 'Unknown error')}")
        
        # Kết luận
        print("\n" + "="*70)
        print("✅ KẾT NỐI KOHA THÀNH CÔNG!")
        print("="*70)
        print("\n📋 Bạn có thể:")
        print("   • Hỏi chatbot: 'có những thư viện nào?'")
        print("   • Hỏi chatbot: 'tìm sách về lập trình'")
        print("   • Hỏi chatbot: 'thông tin về thư viện Centerville'")
        print("\n")
    
except Exception as e:
    print(f"\n❌ LỖI: {str(e)}")
    print("\n💡 Kiểm tra:")
    print("   1. File .env có KOHA_BASE_URL đúng không?")
    print("   2. Koha server có đang chạy không?")
    print("   3. Network/firewall có chặn không?")
    print("\n")
    sys.exit(1)

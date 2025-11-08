"""
Test Koha Debug Logging - Demo để xem logs khi AI gọi API
"""
import sys
import os

# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging to show all INFO level messages
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from app.services.library.koha_tools import search_books_ai, get_book_detail_ai
from app.services.prompt.koha_context import build_koha_context_for_books, build_koha_context_for_book_detail

def main():
    print("\n" + "=" * 100)
    print("TEST KOHA DEBUG LOGGING - Giống như khi AI chat gọi API")
    print("=" * 100)
    print("\nQuan sát logs bên dưới để thấy:\n")
    print("  🔵 KOHA API CALL - Mỗi lần gọi API thật đến Koha")
    print("  ✅ KOHA API RESPONSE - Kết quả từ Koha")
    print("  🤖 AI REQUEST - Khi AI cần dữ liệu")
    print("  ✅ AI SUCCESS - AI nhận được dữ liệu từ Koha")
    print("\n" + "=" * 100 + "\n")
    
    # Test 1: Search books
    print("\n### TEST 1: Tìm kiếm sách (giống khi user hỏi 'tìm sách về toán')")
    print("-" * 100)
    result = search_books_ai("toán", limit=3)
    print(f"\n📊 Kết quả: Tìm thấy {result.get('count', 0)} cuốn sách")
    if result.get('results'):
        for book in result['results'][:2]:
            print(f"   - {book.get('title')} (ID: {book.get('id')})")
    
    # Test 2: Get book detail
    print("\n### TEST 2: Xem chi tiết sách (giống khi user hỏi 'cho tôi biết về sách ID 2')")
    print("-" * 100)
    detail = get_book_detail_ai("2")
    if detail.get('success'):
        summary = detail.get('summary', {})
        print(f"\n📊 Kết quả: {summary.get('title')}")
        print(f"   Tác giả: {', '.join(summary.get('authors', []))}")
        print(f"   NXB: {summary.get('publisher')} ({summary.get('year')})")
    
    # Test 3: Build context (như khi AI chuẩn bị prompt)
    print("\n### TEST 3: Build context cho AI (Koha → AI prompt)")
    print("-" * 100)
    context = build_koha_context_for_books("lịch sử", limit=2)
    print(f"\n📊 Context length: {len(context)} characters")
    print(f"Preview:\n{context[:300]}...")
    
    print("\n" + "=" * 100)
    print("✅ HOÀN TẤT - Kiểm tra logs phía trên để thấy quá trình gọi API Koha")
    print("=" * 100)
    print("\nNhững dòng log quan trọng:")
    print("  - '🔵 KOHA API CALL' → Đang gọi API thật")
    print("  - 'URL: http://45.118.146.109:8082/api/v1/...' → Endpoint Koha")
    print("  - '✅ KOHA API RESPONSE' → Nhận dữ liệu thành công")
    print("  - 'Records returned: X' → Số lượng bản ghi từ Koha")
    print("\nKhi bạn chat với AI, bạn sẽ thấy CHÍNH XÁC các logs này!")
    print("=" * 100 + "\n")

if __name__ == "__main__":
    main()

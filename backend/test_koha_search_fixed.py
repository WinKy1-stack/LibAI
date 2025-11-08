"""Test search sau khi fix koha_client.py"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / '.env')

from app.services.library.koha_tools import search_books_ai
from app.services.prompt.koha_context import build_koha_context_for_books
import json

print("=" * 80)
print("TEST KOHA SEARCH SAU KHI FIX")
print("=" * 80)

# Test 1: Search bằng koha_tools
print("\n1. search_books_ai('toán', limit=5)")
print("-" * 80)
result = search_books_ai('toán', limit=5)
print(f"Success: {result.get('success')}")
print(f"Count: {result.get('count', 0)}")
if result.get('success') and result.get('count', 0) > 0:
    print(f"✓ Tìm thấy {result['count']} cuốn:")
    for book in result.get('results', [])[:3]:
        print(f"  - [{book.get('id')}] {book.get('title')}")
        print(f"    Tác giả: {', '.join(book.get('authors', ['N/A']))}")
        print(f"    NXB: {book.get('publisher', 'N/A')} ({book.get('year', 'N/A')})")
else:
    print(f"✗ Failed: {result.get('message', 'Unknown error')}")

# Test 2: Search bằng author
print("\n2. search_books_ai('Nguyễn', limit=3)")
print("-" * 80)
result = search_books_ai('Nguyễn', limit=3)
print(f"Success: {result.get('success')}")
print(f"Count: {result.get('count', 0)}")
if result.get('success') and result.get('count', 0) > 0:
    print(f"✓ Tìm thấy {result['count']} cuốn:")
    for book in result.get('results', []):
        print(f"  - {book.get('title', 'N/A')[:50]} - {', '.join(book.get('authors', ['N/A']))}")

# Test 3: Context cho AI
print("\n3. build_koha_context_for_books('lịch sử', limit=3)")
print("-" * 80)
context = build_koha_context_for_books('lịch sử', limit=3)
print(context[:500] if context else "Empty context")

print("\n" + "=" * 80)
print("✅ KẾT LUẬN:")
print("=" * 80)
print("Nếu test trên thành công → AI giờ có thể tìm kiếm sách từ Koha!")
print("Không cần MongoDB cache, chỉ dùng Koha API thuần.")

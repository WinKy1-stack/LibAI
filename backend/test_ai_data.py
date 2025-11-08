"""Test what data AI actually receives from Koha"""
import sys
import os
from pathlib import Path

# Add backend to path and load .env
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
dotenv_path = backend_dir / '.env'
load_dotenv(dotenv_path)

from app.services.library.koha_tools import get_book_detail_ai, search_books_ai, get_item_availability_ai
from app.services.prompt.koha_context import build_koha_context_for_book_detail
import json

print('=' * 80)
print('TEST 1: Search Books (sẽ fail vì Koha search không hoạt động)')
print('=' * 80)
try:
    result = search_books_ai('toán', limit=3)
    print(json.dumps(result, indent=2, ensure_ascii=False))
except Exception as e:
    print(f'❌ ERROR: {e}')

print('\n' + '=' * 80)
print('TEST 2: Get Book Detail cho biblio ID 2')
print('=' * 80)
detail = get_book_detail_ai('2')
print(f"✓ Success: {detail.get('success')}")
if detail.get('success'):
    summary = detail.get('summary', {})
    print(f"✓ Title: {summary.get('title')}")
    print(f"✓ Authors: {summary.get('authors')}")
    print(f"✓ Publisher: {summary.get('publisher')}")
    print(f"✓ Year: {summary.get('year')}")
    print(f"✓ Abstract: {summary.get('abstract', 'N/A')[:100]}...")
    print(f"✓ Holdings count: {summary.get('holdings_count', 0)}")
    print(f"✓ Items: {len(summary.get('items', []))} items")
    
    # Show first item detail
    if summary.get('items'):
        item = summary['items'][0]
        print(f"\n  First item detail:")
        print(f"    - item_id: {item.get('item_id')}")
        print(f"    - location: {item.get('location')}")
        print(f"    - checked_out_date: {item.get('checked_out_date')}")
        print(f"    - not_for_loan_status: {item.get('not_for_loan_status')}")

print('\n' + '=' * 80)
print('TEST 3: Get Availability cho biblio ID 2')
print('=' * 80)
avail = get_item_availability_ai('2')
print(f"✓ Success: {avail.get('success')}")
if avail.get('success'):
    print(f"✓ Available: {avail.get('available', 0)}")
    print(f"✓ Checked out: {avail.get('checked_out', 0)}")
    print(f"✓ On hold: {avail.get('on_hold', 0)}")
    print(f"✓ Total: {avail.get('total', 0)}")
    print(f"✓ Status counts: {avail.get('counts_by_status', {})}")

print('\n' + '=' * 80)
print('TEST 4: Context string AI sẽ nhận (book detail)')
print('=' * 80)
context = build_koha_context_for_book_detail('2')
print(context)

print('\n' + '=' * 80)
print('KẾT LUẬN:')
print('=' * 80)
print('- Search: KHÔNG hoạt động (Koha API trả về 400/500)')
print('- Get by ID: Hoạt động TỐT')
print('- AI chỉ có thể trả lời đúng khi:')
print('  1. User cung cấp biblio ID trực tiếp (VD: "sách ID 2")')
print('  2. KHÔNG thể tìm kiếm bằng tên/tác giả/từ khóa')
print('  3. Do đó AI sẽ "bịa" khi user hỏi về sách mà không có ID')

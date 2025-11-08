"""Test trực tiếp KohaClient"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / '.env')

from app.services.library.koha_client import KohaClient
import json

client = KohaClient()

print("=" * 80)
print("TEST TRỰC TIẾP KohaClient.search_biblios()")
print("=" * 80)

try:
    result = client.search_biblios('toán', limit=5)
    print(f"✓ Success!")
    print(f"Query: {result.get('query')}")
    print(f"Count: {result.get('count')}")
    print(f"Results: {len(result.get('results', []))}")
    
    for r in result.get('results', [])[:3]:
        print(f"  - [{r.get('biblio_id')}] {r.get('title', 'N/A')[:50]}")
        
except Exception as e:
    print(f"✗ Failed: {e}")
    import traceback
    traceback.print_exc()

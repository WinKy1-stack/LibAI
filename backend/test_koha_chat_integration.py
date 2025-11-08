"""
Test Koha integration với AI chatbot
Chạy: python test_koha_chat_integration.py
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.prompt.koha_context import (
    build_koha_context_for_patron,
    build_koha_context_for_books,
    build_koha_context_for_book_detail,
    build_faq_context
)

print("=" * 70)
print("🧪 TESTING KOHA INTEGRATION WITH AI CHATBOT")
print("=" * 70)

# Test 1: Build patron context
print("\n📋 TEST 1: Build Patron Context")
print("-" * 70)
patron_context = build_koha_context_for_patron("1")
if patron_context:
    print("✅ SUCCESS - Patron context:")
    print(patron_context[:500] + "..." if len(patron_context) > 500 else patron_context)
else:
    print("❌ FAILED - No patron context")

# Test 2: Build books search context
print("\n📋 TEST 2: Build Books Search Context")
print("-" * 70)
books_context = build_koha_context_for_books("toán", limit=3)
if books_context:
    print("✅ SUCCESS - Books context:")
    print(books_context[:500] + "..." if len(books_context) > 500 else books_context)
else:
    print("❌ FAILED - No books context")

# Test 3: Build book detail context
print("\n📋 TEST 3: Build Book Detail Context")
print("-" * 70)
book_detail_context = build_koha_context_for_book_detail("2")
if book_detail_context:
    print("✅ SUCCESS - Book detail context:")
    print(book_detail_context[:500] + "..." if len(book_detail_context) > 500 else book_detail_context)
else:
    print("❌ FAILED - No book detail context")

# Test 4: Build FAQ context
print("\n📋 TEST 4: Build FAQ Context")
print("-" * 70)
faq_context = build_faq_context(limit=3)
if faq_context:
    print("✅ SUCCESS - FAQ context:")
    print(faq_context[:500] + "..." if len(faq_context) > 500 else faq_context)
else:
    print("❌ FAILED - No FAQ context")

print("\n" + "=" * 70)
print("✅ KOHA CONTEXT TESTS COMPLETED")
print("=" * 70)

# Test 5: Full integration with PromptService
print("\n📋 TEST 5: Full Integration with PromptService")
print("-" * 70)

try:
    from app import create_app
    from app.config import DevelopmentConfig
    from app.services.prompt import get_prompt_service
    
    # Create Flask app context
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        prompt_service = get_prompt_service()
        
        # Test message với keywords để trigger Koha context
        test_messages = [
            ("Tôi muốn tìm sách về toán cao cấp", "Search books test"),
            ("Tôi đang mượn sách gì?", "Borrow status test"),
            ("Làm thế nào để mượn sách?", "FAQ test"),
        ]
        
        for message, desc in test_messages:
            print(f"\n🔹 Testing: {desc}")
            print(f"   User: {message}")
            
            try:
                # Test with extract search query
                search_query = prompt_service._extract_search_query(message)
                print(f"   Extracted query: '{search_query}'")
                
                # Test with build context
                context = prompt_service._build_koha_context_from_message(
                    message, 
                    patron_id="1"
                )
                
                if context:
                    print(f"   ✅ Context generated: {len(context)} chars")
                    print(f"   Preview: {context[:200]}...")
                else:
                    print(f"   ⚠️  No context generated")
                    
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    print("\n✅ FULL INTEGRATION TEST COMPLETED")
    
except Exception as e:
    print(f"\n❌ FULL INTEGRATION TEST FAILED: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("🎉 ALL TESTS COMPLETED")
print("=" * 70)

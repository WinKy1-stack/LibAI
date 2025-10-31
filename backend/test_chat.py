"""
Quick test script for chat API
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Test import
try:
    from app.services.prompt import get_prompt_service
    
    print("=" * 70)
    print("TESTING CHAT SERVICE")
    print("=" * 70)
    
    service = get_prompt_service()
    
    print("\n✓ Service initialized successfully")
    print(f"Model: {service.model_id}")
    
    # Test message
    print("\nSending test message: 'CHO TÔI MỘT QUYỂN SÁCH VỀ TOÁN'")
    response = service.generate_response("CHO TÔI MỘT QUYỂN SÁCH VỀ TOÁN")
    
    print("\n" + "=" * 70)
    print("RESPONSE:")
    print("=" * 70)
    print(response)
    print("=" * 70)
    print("✅ Test completed successfully!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

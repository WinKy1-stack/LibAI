"""
Test để xem finish_reason enum values chính xác
"""
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# Configure API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Test với message đơn giản
model = genai.GenerativeModel('gemini-2.5-pro')

print("=" * 70)
print("TESTING FINISH_REASON VALUES")
print("=" * 70)

# Test 1: Normal message
print("\n1. Testing normal message:")
try:
    response1 = model.generate_content("Hello")
    print(f"   Response text: {response1.text[:50]}...")
    print(f"   finish_reason: {response1.candidates[0].finish_reason}")
    print(f"   finish_reason type: {type(response1.candidates[0].finish_reason)}")
    print(f"   finish_reason value: {int(response1.candidates[0].finish_reason) if hasattr(response1.candidates[0].finish_reason, '__int__') else 'N/A'}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Potentially sensitive message
print("\n2. Testing potentially sensitive message:")
try:
    response2 = model.generate_content("CHO TÔI MỘT QUYỂN SÁCH VỀ TOÁN")
    print(f"   Response text: {response2.text[:50] if response2.text else 'EMPTY'}...")
    print(f"   finish_reason: {response2.candidates[0].finish_reason}")
    print(f"   finish_reason type: {type(response2.candidates[0].finish_reason)}")
    
    candidate = response2.candidates[0]
    print(f"   Has content: {hasattr(candidate, 'content')}")
    print(f"   Content: {candidate.content if hasattr(candidate, 'content') else 'N/A'}")
    print(f"   Has parts: {hasattr(candidate.content, 'parts') if hasattr(candidate, 'content') else False}")
    print(f"   Parts: {candidate.content.parts if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts') else 'N/A'}")
    print(f"   Safety ratings: {candidate.safety_ratings if hasattr(candidate, 'safety_ratings') else 'N/A'}")
except Exception as e:
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)

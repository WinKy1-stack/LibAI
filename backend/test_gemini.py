"""
Test script để kiểm tra Gemini API và list models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

print("=" * 70)
print("🔍 LISTING AVAILABLE GEMINI MODELS")
print("=" * 70)
print(f"API Key: {api_key[:10]}...{api_key[-4:]}")
print()

try:
    genai.configure(api_key=api_key)
    
    print("📋 Available Models:")
    print("-" * 70)
    
    # List all models
    models = genai.list_models()
    
    for i, model in enumerate(models, 1):
        print(f"{i}. Model Name: {model.name}")
        print(f"   Display Name: {model.display_name}")
        print(f"   Supported Methods: {model.supported_generation_methods}")
        if hasattr(model, 'description'):
            desc = model.description[:100] if len(model.description) > 100 else model.description
            print(f"   Description: {desc}")
        print()
        
    print("=" * 70)
    print("✅ Models listed successfully!")
    print("=" * 70)
    
except (ValueError, ConnectionError, TimeoutError) as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    print("=" * 70)

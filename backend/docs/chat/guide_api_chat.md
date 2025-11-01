# Guide API Chat - LibAI

> Hướng dẫn sử dụng và kiến trúc hệ thống Chat AI với Gemini

---

## Quick Start - Chạy trong 2 phút

### **1. Clone & Setup (lần đầu)**

```bash
# Clone repo (nếu chưa có)
git clone https://github.com/LockMan04/LibAI.git
cd LibAI/backend

# Tạo virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Cài dependencies
pip install -r requirements.txt
```

### **2. Cấu hình API Key**

Tạo file `.env` trong `backend/`:

```bash
# Tạo file .env
echo GEMINI_API_KEY=your-api-key-here > .env
```

**Lấy API key:** Vào https://aistudio.google.com/app/apikey → Create API Key

### **3. Chạy server**

```bash
python run.py
```

Nếu thành công, bạn sẽ thấy:

```
 * Running on http://127.0.0.1:5000
 * Chat service initialized with model: gemini-2.0-flash-exp
```

### **4. Test ngay**

Mở terminal mới và chạy:

```bash
# Test health check
curl http://localhost:5000/api/chat/health
```

Hoặc chạy test suite:

```bash
cd backend
python tests/test_chat.py
```

**Done! Chat service đã sẵn sàng!**

---

## Cấu trúc File

### **Các file cần thiết để chạy Chat Service:**

```
backend/
├── run.py                              # FILE CHÍNH - Chạy server
│
├── .env                                # Cấu hình (tạo mới)
│
├── app/
│   ├── __init__.py                     # App factory
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chat_routes.py              # API endpoints chat
│   │   ├── chat_helpers.py             # Helper functions
│   │   └── auth.py                     # Authentication routes
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── prompt_service.py           # Core AI logic
│   │   ├── prompt_validators.py        # Validation logic
│   │   ├── prompt_formatters.py        # Formatting helpers
│   │   ├── chat_config.py              # Configuration
│   │   └── exceptions.py               # Custom exceptions
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   └── decorators.py               # @token_required
│   │
│   └── config.py                       # App configuration
│
├── tests/
│   └── test_chat.py                    # Test suite
│
└── requirements.txt                    # Dependencies
```

### **Mô tả từng file:**

| File | Chức năng | Bắt buộc |
|------|-----------|----------|
| **run.py** | Entry point, khởi chạy Flask server | Yes |
| **.env** | Chứa GEMINI_API_KEY và config | Yes |
| **chat_routes.py** | API endpoints (/message, /recommend, /search) | Yes |
| **prompt_service.py** | Logic xử lý AI, gọi Gemini API | Yes |
| **prompt_validators.py** | Validate input (message, books, history) | Yes |
| **prompt_formatters.py** | Format prompts cho Gemini | Yes |
| **chat_config.py** | Load config từ .env | Yes |
| **exceptions.py** | Custom errors (ValidationError, GeminiAPIError) | Yes |
| **chat_helpers.py** | Helper functions (build_error_response, ...) | Yes |
| **decorators.py** | JWT authentication decorator | Yes |
| **auth.py** | Login endpoint để lấy token | Yes |

---

## Cài đặt nhanh

### **Bước 1: Cài dependencies**

```bash
cd backend

# Cài tất cả dependencies
pip install -r requirements.txt

# Hoặc cài thủ công:
pip install flask flask-cors flask-jwt-extended
pip install google-genai
pip install python-dotenv
```

### **Bước 2: Tạo file `.env`**

Tạo file `.env` trong thư mục `backend/`:

```bash
# backend/.env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=1000
MAX_BOOKS_IN_CONTEXT=30
MAX_MESSAGE_LENGTH=2000

# JWT Config
JWT_SECRET_KEY=your-secret-key-here

# Flask Config
FLASK_ENV=development
```

**Lấy Gemini API key:** https://aistudio.google.com/app/apikey

### **Bước 3: Kiểm tra cấu trúc file**

Đảm bảo các file sau tồn tại:

```bash
# Kiểm tra file quan trọng
ls backend/run.py
ls backend/app/routes/chat_routes.py
ls backend/app/services/prompt_service.py
ls backend/app/services/prompt_validators.py
ls backend/app/services/prompt_formatters.py
ls backend/app/services/chat_config.py
ls backend/app/services/exceptions.py
ls backend/app/routes/chat_helpers.py
ls backend/app/utils/decorators.py
```

### **Bước 4: Chạy server**

```bash
cd backend
python run.py

# Output:
# * Running on http://localhost:5000
# * Chat service initialized!
```

### **Bước 5: Test API**

```bash
# Test health check
curl http://localhost:5000/api/chat/health

# Nếu thành công, bạn sẽ thấy:
# {"success": true, "data": {"status": "healthy", ...}}
```

---

## API Endpoints

### **Base URL:** `http://localhost:5000/api/chat`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/message` | Chat thông thường | Yes |
| POST | `/recommend` | Gợi ý sách | Yes |
| POST | `/search` | Tìm kiếm thông minh | Yes |
| GET | `/health` | Health check | No |

---

## 1. Chat thông thường

**Endpoint:** `POST /api/chat/message`

### Request
```json
{
  "message": "Tìm sách về Python cho người mới",
  "chat_history": [
    {"role": "user", "content": "Xin chào"},
    {"role": "assistant", "content": "Chào bạn!"}
  ],
  "context": "Bạn là trợ lý thư viện"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "message": "Tôi gợi ý cho bạn...",
    "user_id": "123",
    "timestamp": "2025-10-31T10:00:00",
    "metadata": {
      "message_length": 150,
      "has_context": false,
      "history_length": 2
    }
  }
}
```

---

## 2. Gợi ý sách

**Endpoint:** `POST /api/chat/recommend`

### Request
```json
{
  "preferences": {
    "category": "Programming",
    "level": "Beginner",
    "topics": "Python, Machine Learning"
  },
  "available_books": [
    {
      "title": "Python Crash Course",
      "author": "Eric Matthes",
      "category": "Programming"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "recommendations": "Dựa trên sở thích của bạn...",
    "metadata": {
      "books_analyzed": 10,
      "preferences_count": 3
    }
  }
}
```

---

## 3. Tìm kiếm thông minh

**Endpoint:** `POST /api/chat/search`

### Request
```json
{
  "query": "Sách ML cho người mới bắt đầu",
  "books_data": [
    {
      "_id": "book123",
      "title": "Hands-On ML",
      "author": "Aurélien Géron",
      "category": "AI"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "results": "Tôi tìm thấy các sách sau...",
    "query": "Sách ML cho người mới bắt đầu",
    "metadata": {
      "books_searched": 30,
      "query_length": 32
    }
  }
}
```

---

## 4. Health Check

**Endpoint:** `GET /api/chat/health`

### Response
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "chat",
    "model": "gemini-2.0-flash-exp",
    "config": {
      "max_tokens": 1000,
      "temperature": 0.7
    }
  }
}
```

---

## Authentication

Tất cả endpoints (trừ `/health`) yêu cầu **JWT token**.

### Flow xác thực:

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ntt.edu.vn","password":"Password123"}'

# Response:
# {"access_token": "eyJ..."}

# 2. Dùng token để chat
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

## Code Examples

### Python - Chat đơn giản

```python
import requests

BASE_URL = "http://localhost:5000"

# Login
login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username": "admin@ntt.edu.vn",
    "password": "Password123"
})
token = login_res.json()["access_token"]

# Chat
chat_res = requests.post(
    f"{BASE_URL}/api/chat/message",
    headers={"Authorization": f"Bearer {token}"},
    json={"message": "Tìm sách về Python"}
)

print(chat_res.json()["data"]["message"])
```

### Python - Chat với lịch sử

```python
chat_history = []

def chat(message, token):
    response = requests.post(
        "http://localhost:5000/api/chat/message",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "message": message,
            "chat_history": chat_history
        }
    )
    
    ai_msg = response.json()["data"]["message"]
    
    # Lưu lịch sử
    chat_history.append({"role": "user", "content": message})
    chat_history.append({"role": "assistant", "content": ai_msg})
    
    return ai_msg

# Dùng
print(chat("Xin chào", token))
print(chat("Gợi ý sách Python", token))
```

### JavaScript - Chat service

```javascript
class ChatService {
  constructor(token) {
    this.baseUrl = 'http://localhost:5000/api/chat';
    this.token = token;
  }

  async sendMessage(message, history = []) {
    const res = await fetch(`${this.baseUrl}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, chat_history: history })
    });
    
    const data = await res.json();
    return data.data.message;
  }
}

// Dùng
const chat = new ChatService(token);
const response = await chat.sendMessage('Hello!');
console.log(response);
```

### React Hook

```typescript
import { useState } from 'react';

export function useChat(token: string) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          chat_history: messages
        })
      });

      const data = await res.json();
      
      if (data.success) {
        const newMsgs = [
          ...messages,
          { role: 'user', content: message },
          { role: 'assistant', content: data.data.message }
        ];
        setMessages(newMsgs);
      }

      return data.data.message;
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}

// Trong component
function ChatBox() {
  const { messages, sendMessage, loading } = useChat(token);

  return (
    <div>
      {messages.map((msg, i) => (
        <p key={i}><strong>{msg.role}:</strong> {msg.content}</p>
      ))}
      <button onClick={() => sendMessage('Hi')} disabled={loading}>
        Send
      </button>
    </div>
  );
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Tin nhắn không được để trống",
    "type": "ValidationError"
  }
}
```

### Error Codes

| Code | Type | Mô tả | Giải pháp |
|------|------|-------|-----------|
| 400 | `ValidationError` | Dữ liệu không hợp lệ | Kiểm tra request body |
| 401 | `Unauthorized` | Thiếu/sai token | Login lại |
| 500 | `ChatServiceError` | Lỗi server | Báo team dev |
| 503 | `GeminiAPIError` | API Gemini lỗi | Kiểm tra API key/quota |

### Python - Safe error handling

```python
def safe_chat(message, token):
    try:
        response = requests.post(
            "http://localhost:5000/api/chat/message",
            headers={"Authorization": f"Bearer {token}"},
            json={"message": message},
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            print(f"Error: {data['error']['message']}")
            return None
        
        return data["data"]["message"]
        
    except Exception as e:
        print(f"Error: {e}")
        return None
```

---

## Kiến trúc hệ thống

### Tổng quan

```
Client (Web/Mobile)
        ↓
   JWT Auth Check
        ↓
   chat_routes.py  ← API Gateway
        ↓
   prompt_service.py  ← Business Logic
        ↓
   Gemini AI API
```

### Cấu trúc thư mục

```
backend/app/
├── routes/
│   └── chat_routes.py          # Endpoints + validation
├── services/
│   ├── prompt_service.py       # Core AI logic
│   ├── chat_config.py          # Configuration
│   └── exceptions.py           # Custom errors
└── utils/
    └── decorators.py           # @token_required
```

### Components chi tiết

#### 1. **chat_routes.py** - API Layer
- Nhận HTTP requests
- Validate input data
- Gọi PromptService
- Format JSON responses
- Handle errors

**Key functions:**
```python
@token_required
def send_message(current_user):
    # Chat thông thường
    
@token_required
def get_book_recommendations(current_user):
    # Gợi ý sách
    
@token_required
def search_books_with_ai(current_user):
    # Tìm kiếm thông minh
    
def health_check():
    # Không cần auth
```

#### 2. **prompt_service.py** - Business Logic
- Xử lý Gemini API
- Build system prompts
- Validate data
- Logging

**Key methods:**
```python
generate_response(message, history, context)
    → str  # AI response

generate_book_recommendation(preferences, books)
    → str  # Recommendations

search_books_with_ai(query, books_data)
    → str  # Search results
```

#### 3. **chat_config.py** - Configuration
- Load environment variables
- Validate config
- Store system instructions

```python
@dataclass
class ChatConfig:
    gemini_api_key: str
    gemini_model: str = "gemini-2.0-flash-exp"
    temperature: float = 0.7
    max_tokens: int = 1000
    max_books_in_context: int = 30
```

#### 4. **exceptions.py** - Error Handling

```python
ChatServiceError (base)
├── ValidationError (400)
├── GeminiAPIError (503)
├── InvalidConfigurationError (500)
└── EmptyResponseError (500)
```

### Data Flow

```
1. Client gửi request
   POST /api/chat/message
   Headers: Authorization: Bearer <token>
   Body: {"message": "..."}

2. chat_routes.py
   - Verify JWT token (@token_required)
   - Validate request body
   - Extract current_user info

3. prompt_service.py
   - Validate message length
   - Build Gemini prompt
   - Call Gemini API
   - Process response

4. Response
   {
     "success": true,
     "data": {
       "message": "AI response",
       "metadata": {...}
     }
   }
```

### Design Patterns

#### Singleton Pattern
```python
_instance = None

def get_prompt_service():
    global _instance
    if _instance is None:
        _instance = PromptService()
    return _instance
```

#### Decorator Pattern
```python
@token_required  # JWT verification
def send_message(current_user):
    # current_user đã được verify
```

#### Dependency Injection
```python
class PromptService:
    def __init__(self, config: ChatConfig):
        self.config = config
        self.client = genai.Client(api_key=config.gemini_api_key)
```

---

## Cấu hình nâng cao

### Environment Variables

| Variable | Default | Mô tả |
|----------|---------|-------|
| `GEMINI_API_KEY` | *required* | API key từ Google AI |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | Model version |
| `GEMINI_TEMPERATURE` | `0.7` | Độ sáng tạo (0-2) |
| `GEMINI_MAX_TOKENS` | `1000` | Độ dài response |
| `MAX_BOOKS_IN_CONTEXT` | `30` | Số sách tối đa |
| `MAX_MESSAGE_LENGTH` | `2000` | Độ dài tin nhắn |

### System Prompts

```python
SYSTEM_INSTRUCTIONS = {
    'default': """
        Bạn là trợ lý thư viện thông minh...
    """,
    
    'recommendation': """
        Dựa trên sở thích của người dùng...
    """,
    
    'search': """
        Phân tích query và tìm sách phù hợp...
    """
}
```

---

## Testing

### Manual test

```bash
# 1. Health check
curl http://localhost:5000/api/chat/health

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ntt.edu.vn","password":"Password123"}'

# 3. Chat
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Unit test (future)

```python
def test_generate_response():
    service = PromptService(test_config)
    response = service.generate_response("Hello")
    
    assert isinstance(response, str)
    assert len(response) > 0
```

---

## Troubleshooting

### Lỗi: `GEMINI_API_KEY not found`
**Nguyên nhân:** Thiếu API key trong `.env`  
**Giải pháp:** Thêm `GEMINI_API_KEY=xxx` vào file `.env`

### Lỗi: `401 Unauthorized`
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ  
**Giải pháp:** Login lại để lấy token mới

### Lỗi: `503 Service Unavailable`
**Nguyên nhân:** Gemini API không kết nối được  
**Giải pháp:** Kiểm tra API key, quota, hoặc network

### Lỗi: `400 Validation Error`
**Nguyên nhân:** Request body không đúng format  
**Giải pháp:** Kiểm tra JSON format và required fields

---

## Tài liệu tham khảo

- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **Flask-JWT-Extended:** https://flask-jwt-extended.readthedocs.io
- **Backend README:** `backend/README.md`

---

**Cần hỗ trợ?** Liên hệ team dev hoặc mở issue trên GitHub.

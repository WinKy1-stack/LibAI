# Guide Chat History - LibAI

> Hướng dẫn sử dụng hệ thống lưu lịch sử chat vào MongoDB

---

## Quick Start - Test trong 3 phút

### **1. Verify MongoDB Connection**

```bash
cd backend

# Test MongoDB connection
python scripts/test_chat_history.py
```

Nếu thành công, bạn sẽ thấy:
```
==============================================================
  MONGODB CHAT HISTORY TEST
==============================================================
ChatHistoryService initialized
Created conversation: 676a5b2c8f3d4e1234567890
Saved chat exchange
Retrieved 4 messages
...
TEST SUITE PASSED
==============================================================
```

### **2. Test API Endpoints**

```bash
# 1. Login để lấy token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ntt.edu.vn","password":"Password123"}'

# Response: {"access_token": "eyJ..."}

# 2. Chat và nhận conversation_id
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Xin chào"}'

# Response: {"data": {"conversation_id": "abc123", ...}}

# 3. Lấy lịch sử
curl -X GET http://localhost:5000/api/chat/history/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Xem danh sách conversations
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Xem thống kê
curl -X GET http://localhost:5000/api/chat/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Done! Chat history system đã hoạt động!**

---

## Cấu trúc File

### **Các file liên quan đến Chat History:**

```
backend/
├── app/
│   ├── services/
│   │   └── history/                    # Chat history services
│   │       ├── __init__.py
│   │       ├── service.py              # ChatHistoryService (facade)
│   │       ├── conversation.py         # ConversationManager
│   │       └── message.py              # MessageManager
│   │
│   ├── routes/
│   │   └── chat/
│   │       ├── message.py              # POST /message (with history saving)
│   │       └── history.py              # History endpoints
│   │
│   ├── models/
│   │   └── mongodb_schemas.py          # Database schemas
│   │
│   ├── utils/
│   │   └── mongo_helper.py             # MongoDB CRUD helper
│   │
│   └── config.py                       # MongoDB configuration
│
└── scripts/
    └── test_chat_history.py            # Test script
```

### **Mô tả từng file:**

| File | Chức năng | Lines |
|------|-----------|-------|
| **service.py** | Facade pattern, tổng hợp operations | 150 |
| **conversation.py** | CRUD cho conversations | 220 |
| **message.py** | CRUD cho messages | 220 |
| **history.py** | API endpoints cho history | 170 |
| **mongodb_schemas.py** | Schema definitions | Existing |
| **mongo_helper.py** | MongoDB operations helper | Existing |
| **test_chat_history.py** | Test suite | 200 |

---

## Tổng quan hệ thống

### **Mục đích**

Lưu trữ toàn bộ lịch sử chat giữa user và AI vào MongoDB để:
1. **Thống kê**: Track usage, analyze patterns
2. **Debugging**: Review conversations khi có vấn đề
3. **Context**: Maintain conversation context cho multi-turn chat
4. **Analytics**: User behavior analysis, model performance

### **Kiến trúc**

```
Client Request
      ↓
POST /api/chat/message
      ↓
[Create/Get Conversation]
      ↓
[Generate AI Response]
      ↓
[Save to MongoDB]  ← Auto-save user + AI messages
      ↓
Return Response (with conversation_id)
```

### **Database Collections**

**conversations**: Chat sessions
- conversation_id (UUID)
- user_id
- started_at, ended_at
- metadata (channel, model, language)

**messages**: Individual messages
- message_id (UUID)
- conversation_id (link to conversation)
- role (USER/ASSISTANT/SYSTEM)
- content
- timestamp
- latency_ms (for AI responses)

---

## API Endpoints

### **Base URL:** `http://localhost:5000/api/chat`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/message` | Chat (auto-save history) | Yes |
| GET | `/history/<id>` | Lấy lịch sử conversation | Yes |
| GET | `/conversations` | Danh sách conversations | Yes |
| POST | `/conversation/end` | Kết thúc conversation | Yes |
| GET | `/stats` | Thống kê chat | Yes |

---

## 1. Chat với History (Auto-save)

**Endpoint:** `POST /api/chat/message`

### First Message (New Conversation)

**Request:**
```json
{
  "message": "Tìm sách về Python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Tôi có thể gợi ý...",
    "conversation_id": "676a5b2c8f3d4e1234567890"
  },
  "metadata": {
    "latency_ms": 1250
  }
}
```

**Important:** Save `conversation_id` để tiếp tục chat!

### Continue Conversation

**Request:**
```json
{
  "message": "Có sách nào cho người mới?",
  "conversation_id": "676a5b2c8f3d4e1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Dạ, tôi gợi ý...",
    "conversation_id": "676a5b2c8f3d4e1234567890"
  }
}
```

**Note:** Mọi exchange (user message + AI response) được tự động lưu vào MongoDB.

---

## 2. Lấy lịch sử chat

**Endpoint:** `GET /api/chat/history/<conversation_id>`

### Request

```bash
GET /api/chat/history/676a5b2c8f3d4e1234567890?limit=50
```

**Query Parameters:**
- `limit` (optional): Số lượng messages tối đa (default: 100, max: 500)

### Response

```json
{
  "success": true,
  "data": {
    "conversation_id": "676a5b2c8f3d4e1234567890",
    "messages": [
      {
        "message_id": "msg_001",
        "role": "USER",
        "content": "Tìm sách về Python",
        "timestamp": "2025-11-01T10:00:00Z",
        "latency_ms": 0
      },
      {
        "message_id": "msg_002",
        "role": "ASSISTANT",
        "content": "Tôi có thể gợi ý...",
        "timestamp": "2025-11-01T10:00:01Z",
        "latency_ms": 1250
      }
    ],
    "count": 2
  }
}
```

---

## 3. Danh sách Conversations

**Endpoint:** `GET /api/chat/conversations`

### Request

```bash
GET /api/chat/conversations?limit=20&skip=0
```

**Query Parameters:**
- `limit` (optional): Số lượng conversations (default: 20, max: 100)
- `skip` (optional): Bỏ qua số lượng (default: 0) - for pagination

### Response

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "676a5b2c8f3d4e1234567890",
        "user_id": "user_123",
        "started_at": "2025-11-01T10:00:00Z",
        "ended_at": null,
        "meta": {
          "channel": "web",
          "model": "gemini-2.0-flash-exp",
          "lang": "vi"
        },
        "message_count": 4
      }
    ],
    "count": 1
  }
}
```

---

## 4. Kết thúc Conversation

**Endpoint:** `POST /api/chat/conversation/end`

### Request

```json
{
  "conversation_id": "676a5b2c8f3d4e1234567890"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "conversation_id": "676a5b2c8f3d4e1234567890",
    "ended": true
  }
}
```

**Note:** Sets `ended_at` timestamp, marks conversation as completed.

---

## 5. Thống kê Chat

**Endpoint:** `GET /api/chat/stats`

### Request

```bash
GET /api/chat/stats
```

### Response

```json
{
  "success": true,
  "data": {
    "stats": {
      "total_conversations": 10,
      "total_messages": 150,
      "avg_messages_per_conversation": 15.0,
      "active_conversations": 3,
      "completed_conversations": 7,
      "average_latency_ms": 1234.56
    }
  }
}
```

---

## Database Schema

### Collection: conversations

```javascript
{
  "_id": ObjectId("..."),
  "conversation_id": "676a5b2c8f3d4e1234567890",  // UUID
  "user_id": "user_123",                          // From JWT
  "started_at": ISODate("2025-11-01T10:00:00Z"),
  "ended_at": null,                               // or ISODate
  "meta": {
    "channel": "web",                             // web/mobile/api
    "model": "gemini-2.0-flash-exp",
    "lang": "vi"                                  // vi/en
  }
}
```

**Indexes:**
- `user_id` (for querying user's conversations)
- `started_at` (for sorting)

### Collection: messages

```javascript
{
  "_id": ObjectId("..."),
  "message_id": "msg_001",                        // UUID
  "conversation_id": "676a5b2c8f3d4e1234567890",  // Link
  "role": "USER",                                 // USER/ASSISTANT/SYSTEM
  "content": "Tìm sách về Python",
  "timestamp": ISODate("2025-11-01T10:00:00Z"),
  "citations": [],                                // Optional
  "latency_ms": 0                                 // Only for ASSISTANT
}
```

**Indexes:**
- `conversation_id` (for querying conversation messages)
- `timestamp` (for sorting)

---

## Code Examples

### Python - Chat với History

```python
import requests

BASE_URL = "http://localhost:5000"
TOKEN = "your-jwt-token"

# Start new conversation
def start_chat(message):
    response = requests.post(
        f"{BASE_URL}/api/chat/message",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={"message": message}
    )
    data = response.json()
    
    conversation_id = data["data"]["conversation_id"]
    ai_message = data["data"]["message"]
    
    return conversation_id, ai_message

# Continue conversation
def continue_chat(conversation_id, message):
    response = requests.post(
        f"{BASE_URL}/api/chat/message",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={
            "message": message,
            "conversation_id": conversation_id
        }
    )
    return response.json()["data"]["message"]

# Get history
def get_history(conversation_id, limit=50):
    response = requests.get(
        f"{BASE_URL}/api/chat/history/{conversation_id}",
        headers={"Authorization": f"Bearer {TOKEN}"},
        params={"limit": limit}
    )
    return response.json()["data"]["messages"]

# Usage
conv_id, reply = start_chat("Xin chào")
print(f"Conversation: {conv_id}")
print(f"AI: {reply}")

reply2 = continue_chat(conv_id, "Tìm sách Python")
print(f"AI: {reply2}")

history = get_history(conv_id)
print(f"Total messages: {len(history)}")
```

### Python - Chat Service Class

```python
class ChatHistoryService:
    def __init__(self, token, base_url="http://localhost:5000"):
        self.token = token
        self.base_url = base_url
        self.conversation_id = None
    
    def send_message(self, message):
        """Send message and auto-handle conversation"""
        data = {"message": message}
        
        if self.conversation_id:
            data["conversation_id"] = self.conversation_id
        
        response = requests.post(
            f"{self.base_url}/api/chat/message",
            headers={"Authorization": f"Bearer {self.token}"},
            json=data
        )
        
        result = response.json()
        
        # Save conversation_id for future messages
        self.conversation_id = result["data"]["conversation_id"]
        
        return result["data"]["message"]
    
    def get_history(self, limit=50):
        """Get current conversation history"""
        if not self.conversation_id:
            return []
        
        response = requests.get(
            f"{self.base_url}/api/chat/history/{self.conversation_id}",
            headers={"Authorization": f"Bearer {self.token}"},
            params={"limit": limit}
        )
        
        return response.json()["data"]["messages"]
    
    def get_all_conversations(self):
        """Get all user's conversations"""
        response = requests.get(
            f"{self.base_url}/api/chat/conversations",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        return response.json()["data"]["conversations"]
    
    def end_conversation(self):
        """End current conversation"""
        if not self.conversation_id:
            return False
        
        response = requests.post(
            f"{self.base_url}/api/chat/conversation/end",
            headers={"Authorization": f"Bearer {self.token}"},
            json={"conversation_id": self.conversation_id}
        )
        
        self.conversation_id = None
        return response.json()["data"]["ended"]

# Usage
chat = ChatHistoryService(token)

print(chat.send_message("Xin chào"))
print(chat.send_message("Tìm sách Python"))

history = chat.get_history()
print(f"Messages: {len(history)}")

chat.end_conversation()
```

### JavaScript - Chat với History

```javascript
class ChatHistoryClient {
  constructor(token, baseUrl = 'http://localhost:5000') {
    this.token = token;
    this.baseUrl = baseUrl;
    this.conversationId = null;
  }

  async sendMessage(message) {
    const body = { message };
    
    if (this.conversationId) {
      body.conversation_id = this.conversationId;
    }

    const res = await fetch(`${this.baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    
    // Save conversation ID
    this.conversationId = data.data.conversation_id;
    
    return data.data.message;
  }

  async getHistory(limit = 50) {
    if (!this.conversationId) return [];

    const res = await fetch(
      `${this.baseUrl}/api/chat/history/${this.conversationId}?limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );

    const data = await res.json();
    return data.data.messages;
  }

  async getAllConversations() {
    const res = await fetch(`${this.baseUrl}/api/chat/conversations`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    const data = await res.json();
    return data.data.conversations;
  }

  async endConversation() {
    if (!this.conversationId) return false;

    const res = await fetch(`${this.baseUrl}/api/chat/conversation/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation_id: this.conversationId })
    });

    this.conversationId = null;
    const data = await res.json();
    return data.data.ended;
  }
}

// Usage
const chat = new ChatHistoryClient(token);

const reply1 = await chat.sendMessage('Xin chào');
console.log(reply1);

const reply2 = await chat.sendMessage('Tìm sách Python');
console.log(reply2);

const history = await chat.getHistory();
console.log(`Total messages: ${history.length}`);

await chat.endConversation();
```

### React Hook

```typescript
import { useState, useCallback } from 'react';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

export function useChatHistory(token: string) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    
    try {
      const body: any = { message };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      const res = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      // Update conversation ID
      setConversationId(data.data.conversation_id);
      
      // Add to local messages
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: data.data.message, timestamp: new Date().toISOString() }
      ]);

      return data.data.message;
    } finally {
      setLoading(false);
    }
  }, [token, conversationId]);

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;

    const res = await fetch(
      `http://localhost:5000/api/chat/history/${conversationId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await res.json();
    setMessages(data.data.messages);
  }, [token, conversationId]);

  const endConversation = useCallback(async () => {
    if (!conversationId) return;

    await fetch('http://localhost:5000/api/chat/conversation/end', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation_id: conversationId })
    });

    setConversationId(null);
    setMessages([]);
  }, [token, conversationId]);

  return {
    conversationId,
    messages,
    loading,
    sendMessage,
    loadHistory,
    endConversation
  };
}

// Usage in component
function ChatBox({ token }: { token: string }) {
  const { messages, loading, sendMessage, endConversation } = useChatHistory(token);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSend()}
        disabled={loading}
      />
      
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      
      <button onClick={endConversation}>
        End Conversation
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
    "message": "Conversation không tồn tại",
    "type": "ChatServiceError"
  }
}
```

### Common Errors

| Code | Type | Mô tả | Giải pháp |
|------|------|-------|-----------|
| 400 | `ValidationError` | Invalid conversation_id hoặc limit | Kiểm tra parameters |
| 401 | `Unauthorized` | Token hết hạn | Login lại |
| 404 | `NotFound` | Conversation không tồn tại | Kiểm tra conversation_id |
| 500 | `ChatServiceError` | MongoDB connection failed | Kiểm tra MongoDB |

### Non-blocking Errors

Nếu MongoDB fail khi save history, chat vẫn hoạt động:

```python
try:
    history_service.save_chat_exchange(...)
    logger.info("Saved chat to database")
except Exception as db_error:
    logger.error("Failed to save: %s", str(db_error))
    # Continue - user vẫn nhận được AI response
```

**Graceful Degradation:**
- User vẫn chat được bình thường
- Error được log để admin debug
- Stats có thể thiếu data nhưng không crash

---

## Configuration

### MongoDB Connection

**File:** `backend/app/config.py`

```python
# MongoDB Cloud Atlas
MONGO_URI_CLOUD = "mongodb+srv://username:password@cluster.mongodb.net/library_chatbox"
DATABASE_NAME = "library_chatbox"
COLLECTION_CONVERSATIONS = "conversations"
COLLECTION_MESSAGES = "messages"
```

### Environment Variables

```bash
# .env file
MONGO_URI_CLOUD=mongodb+srv://...
```

---

## Testing

### Unit Test

```bash
cd backend
python scripts/test_chat_history.py
```

**Test scenarios:**
1. Create conversation
2. Save messages
3. Get conversation history
4. Get user conversations
5. Get stats
6. End conversation
7. Verify ended state

### Integration Test

```bash
cd backend/tests
python test_chat.py
```

### Manual API Test

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ntt.edu.vn","password":"Password123"}' \
  | jq -r '.access_token')

# 2. Start chat
CONV_ID=$(curl -s -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' \
  | jq -r '.data.conversation_id')

# 3. Continue chat
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Test\",\"conversation_id\":\"$CONV_ID\"}"

# 4. Get history
curl -X GET "http://localhost:5000/api/chat/history/$CONV_ID" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get stats
curl -X GET http://localhost:5000/api/chat/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Service Architecture

### Component Structure

```
services/history/
├── service.py          # ChatHistoryService (Facade)
│   └── Methods: create_conversation, save_message,
│                save_chat_exchange, get_conversation_history,
│                get_user_conversations, end_conversation,
│                get_conversation_stats
│
├── conversation.py     # ConversationManager
│   └── Methods: create, get_by_user, end, get_stats,
│                get_all_ids_by_user
│
└── message.py          # MessageManager
    └── Methods: save, save_exchange, get_by_conversation,
                 get_stats
```

### Design Patterns

**Facade Pattern:**
```python
class ChatHistoryService:
    # Simplified interface
    @staticmethod
    def save_chat_exchange(conv_id, user_msg, ai_msg):
        # Internally calls:
        # MessageManager.save() twice
        pass
```

**Singleton Pattern:**
```python
_chat_history_service = None

def get_chat_history_service():
    global _chat_history_service
    if _chat_history_service is None:
        _chat_history_service = ChatHistoryService()
    return _chat_history_service
```

### Data Flow

```
1. POST /api/chat/message
   ↓
2. Get/Create conversation_id
   ↓
3. Generate AI response
   ↓
4. ChatHistoryService.save_chat_exchange()
   ├→ MessageManager.save(USER message)
   └→ MessageManager.save(ASSISTANT message)
   ↓
5. Return response + conversation_id
```

---

## Best Practices

### 1. Always Save conversation_id

```javascript
// Good
let conversationId = null;

async function chat(message) {
  const response = await sendMessage(message, conversationId);
  conversationId = response.conversation_id; // Save it!
  return response.message;
}

// Bad
async function chat(message) {
  const response = await sendMessage(message);
  // Forgot to save conversation_id
  // Next message will create NEW conversation
  return response.message;
}
```

### 2. Handle Missing conversation_id

```python
# Server auto-creates if missing
def send_message(message, conversation_id=None):
    if not conversation_id:
        conversation_id = create_new_conversation()
    # ...
```

### 3. Pagination for Large History

```python
# Get recent messages only
messages = get_history(conversation_id, limit=50)

# Implement "load more"
def load_more(conversation_id, offset):
    # Use MongoDB skip + limit
    pass
```

### 4. End Conversations Properly

```python
# When user leaves or closes chat
def cleanup():
    if conversation_id:
        end_conversation(conversation_id)
```

---

## Troubleshooting

### Problem: conversation_id không được lưu

**Solution:**
```javascript
// Always extract and store conversation_id from response
const response = await chat.sendMessage('Hello');
this.conversationId = response.data.conversation_id;
```

### Problem: History trống

**Possible causes:**
1. Sai conversation_id
2. Messages chưa được save (check logs)
3. MongoDB connection issues

**Solution:**
```bash
# Check MongoDB connection
python scripts/test_chat_history.py

# Check logs
tail -f backend/logs/app.log | grep "chat_history"
```

### Problem: Stats không chính xác

**Possible causes:**
1. MongoDB indexes chưa được tạo
2. Old data không có metadata

**Solution:**
```bash
# Create indexes
python scripts/init_mongodb_indexes.py

# Verify
mongo> db.messages.getIndexes()
```

### Problem: Slow performance

**Solution:**
- Add indexes on `conversation_id`, `user_id`, `timestamp`
- Use pagination với `limit` parameter
- Cache conversation list
- Archive old conversations

---

## Advanced Features

### 1. Search Conversations

```python
def search_conversations(user_id, keyword):
    # Search in message content
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$lookup": {
                "from": "messages",
                "localField": "conversation_id",
                "foreignField": "conversation_id",
                "as": "messages"
            }
        },
        {
            "$match": {
                "messages.content": {"$regex": keyword, "$options": "i"}
            }
        }
    ]
    return mongo.db.conversations.aggregate(pipeline)
```

### 2. Export Conversation

```python
def export_conversation(conversation_id, format="json"):
    messages = get_history(conversation_id, limit=1000)
    
    if format == "json":
        return json.dumps(messages, indent=2)
    elif format == "txt":
        lines = [f"{m['role']}: {m['content']}" for m in messages]
        return "\n".join(lines)
```

### 3. Conversation Tags

```python
def tag_conversation(conversation_id, tags):
    mongo.db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": {"tags": tags}}
    )
```

### 4. Auto-cleanup Old Data

```python
def cleanup_old_conversations(days=30):
    cutoff = datetime.now() - timedelta(days=days)
    
    mongo.db.conversations.delete_many({
        "ended_at": {"$lt": cutoff}
    })
```

---

## Benefits Summary

### Statistics & Analytics
- Track usage patterns per user
- Analyze conversation length distribution
- Monitor AI response latency
- Identify peak usage times

### Debugging & Monitoring
- Review exact conversations when bugs reported
- Track AI response quality
- Identify slow responses
- Audit user interactions for compliance

### Future Enhancements
- Multi-turn context maintenance
- User behavior analysis
- Model A/B testing
- Training data collection
- Conversation summarization
- Sentiment analysis

---

## Tài liệu tham khảo

- **MongoDB Documentation:** https://docs.mongodb.com
- **Chat API Guide:** `backend/docs/chat/guide_api_chat.md`
- **Backend README:** `backend/README.md`

---

**Cần hỗ trợ?** Liên hệ team dev hoặc mở issue trên GitHub.

## What Was Implemented

### 1. ChatHistoryService (NEW)
**File**: `backend/app/services/chat_history_service.py` (400 lines)

**Methods**:
```python
# Conversation Management
create_conversation(user_id, channel, model, language) -> conversation_id
end_conversation(conversation_id) -> bool
get_user_conversations(user_id, limit, skip) -> [conversations]
get_conversation_stats(user_id) -> {stats}

# Message Management  
save_message(conversation_id, role, content, latency_ms) -> message_id
save_chat_exchange(conversation_id, user_msg, ai_msg, latency_ms) -> {ids}
get_conversation_history(conversation_id, limit) -> [messages]
```

**Features**:
- Singleton pattern với `get_chat_history_service()`
- Auto-generate conversation_id khi tạo mới
- Track metadata: channel, model, language
- Measure latency cho mỗi message
- Full error handling và logging

### 2. Updated Chat Routes
**File**: `backend/app/routes/chat_routes.py`

#### Modified Endpoint
**POST /message** - Đã tích hợp lưu history
- Auto-create conversation nếu chưa có
- Save user message + AI response sau mỗi exchange
- Return conversation_id trong response
- Accept conversation_id trong request để tiếp tục chat
- Track latency_ms cho mỗi request

**Request Example**:
```json
{
  "message": "Tìm sách về Python",
  "chat_history": [...],
  "context": "...",
  "conversation_id": "optional_existing_id"
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "message": "AI response...",
    "conversation_id": "676a5b2c8f3d4e1234567890"
  },
  "metadata": {
    "message_length": 150,
    "latency_ms": 1250,
    ...
  }
}
```

#### New Endpoints Added

**GET /history/<conversation_id>** - Lấy lịch sử chat
- Query params: `?limit=100` (default: 100, max: 500)
- Returns: Array of messages với role, content, timestamp, latency
- Protected với JWT

**GET /conversations** - Danh sách conversations của user
- Query params: `?limit=20&skip=0`
- Returns: Array of conversations với metadata
- Protected với JWT

**POST /conversation/end** - Kết thúc conversation
- Body: `{"conversation_id": "..."}`
- Sets ended_at timestamp
- Protected với JWT

**GET /stats** - Thống kê chat của user
- Returns:
  ```json
  {
    "total_conversations": 10,
    "total_messages": 150,
    "avg_messages_per_conversation": 15.0,
    "active_conversations": 3,
    "completed_conversations": 7,
    "average_latency_ms": 1234.56
  }
  ```

### 3. Test Script (NEW)
**File**: `backend/scripts/test_chat_history.py`

**Tests**:
1. Create conversation
2. Save chat exchange (2 lần)
3. Get conversation history
4. Get user conversations
5. Get conversation stats
6. End conversation
7. Verify conversation ended

**Run**:
```bash
cd backend
python scripts/test_chat_history.py
```

## Database Schema

### Collection: conversations
```python
{
  "_id": ObjectId,
  "conversation_id": str,          # UUID generated
  "user_id": str,                  # From JWT
  "started_at": datetime,
  "ended_at": datetime | null,
  "meta": {
    "channel": str,                # web/mobile/api
    "model": str,                  # gemini-2.0-flash-exp
    "language": str                # vi/en
  }
}
```

### Collection: messages
```python
{
  "_id": ObjectId,
  "message_id": str,               # UUID generated
  "conversation_id": str,          # Link to conversation
  "role": str,                     # USER/ASSISTANT/SYSTEM
  "content": str,
  "timestamp": datetime,
  "citations": [] | null,
  "latency_ms": int | null        # Only for ASSISTANT messages
}
```

## Usage Flow

### 1. Start New Chat
```javascript
// Client gửi message đầu tiên
POST /api/chat/message
{
  "message": "Tìm sách về Python"
}

// Server response
{
  "success": true,
  "data": {
    "message": "AI response...",
    "conversation_id": "new_conv_id"  // Save this!
  }
}
```

### 2. Continue Chat
```javascript
// Client gửi message tiếp theo với conversation_id
POST /api/chat/message
{
  "message": "Có sách nào cho người mới?",
  "conversation_id": "new_conv_id"  // From previous response
}
```

### 3. Retrieve History
```javascript
// Get messages của conversation
GET /api/chat/history/{conversation_id}?limit=50

// Get all conversations của user
GET /api/chat/conversations?limit=20&skip=0
```

### 4. End Chat
```javascript
POST /api/chat/conversation/end
{
  "conversation_id": "conv_id"
}
```

### 5. View Stats
```javascript
GET /api/chat/stats
```

## Configuration

### MongoDB Connection
**File**: `backend/app/config.py`
```python
MONGO_URI_CLOUD = "mongodb+srv://nptb137:...@cluster0.e5wsuwa.mongodb.net/library_chatbox"
DATABASE_NAME = "library_chatbox"
COLLECTION_CONVERSATIONS = "conversations"
COLLECTION_MESSAGES = "messages"
```

### Required Dependencies
Already installed:
- pymongo
- python-dotenv
- colorama (for test script)

## Testing

### Manual Testing với test_chat.py
```bash
cd backend/tests
python test_chat.py
```

### MongoDB Connection Test
```bash
cd backend
python scripts/test_chat_history.py
```

**Expected Output**:
```
==============================================================
  MONGODB CHAT HISTORY TEST
==============================================================
✓ ChatHistoryService initialized
✓ Created conversation: 676a5b2c8f3d4e1234567890
✓ Saved user message: msg_id_1
✓ Saved AI message: msg_id_2
✓ Retrieved 4 messages
✓ User has 1 conversation(s)
✓ Stats retrieved:
  Total conversations: 1
  Total messages: 4
  ...
==============================================================
  TEST SUITE PASSED ✓
==============================================================
```

### API Testing với curl
```bash
# 1. Login để lấy token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Test chat với history
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Xin chào"}'

# 3. Get conversations
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get history
curl -X GET http://localhost:5000/api/chat/history/CONV_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Get stats
curl -X GET http://localhost:5000/api/chat/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Non-blocking DB Errors
Nếu MongoDB fail khi save history, API sẽ vẫn return response thành công:
```python
try:
    history_service.save_chat_exchange(...)
except Exception as db_error:
    logger.error("Failed to save: %s", str(db_error))
    # Continue - không block user experience
```

### Graceful Degradation
- User vẫn nhận được AI response
- Error được log để debug
- Stats có thể bị thiếu nhưng chat vẫn hoạt động

## Benefits

### 1. Statistics & Analytics
- Track số lượng conversations per user
- Average messages per conversation
- Response latency tracking
- Active vs completed conversations
- Usage patterns by time/channel

### 2. Debugging & Monitoring
- Review exact conversation history khi có bug
- Track AI response quality
- Identify slow responses (latency_ms)
- Audit user interactions

### 3. Future Features
- Conversation context cho multi-turn chat
- User behavior analysis
- Model performance comparison
- Training data collection
- Compliance & audit trails

## Files Changed/Created

### Created:
1. `backend/app/services/chat_history_service.py` (400 lines)
2. `backend/scripts/test_chat_history.py` (200 lines)
3. `backend/docs/chat/chat_history_implementation.md` (this file)

### Modified:
1. `backend/app/routes/chat_routes.py` (+150 lines)
   - Updated /message endpoint
   - Added 4 new endpoints

### Not Modified (Already Exists):
1. `backend/app/models/mongodb_schemas.py` - Schemas already defined
2. `backend/app/utils/mongo_helper.py` - Helper already exists
3. `backend/app/config.py` - MongoDB URI already configured

## Next Steps

### Immediate:
1. Run `python scripts/test_chat_history.py` để verify MongoDB connection
2. Update `backend/tests/test_chat.py` với history test cases
3. Test all endpoints với Postman/curl

### Future Enhancements:
1. Add pagination cho large history
2. Add search/filter cho conversations
3. Export conversation history (JSON/CSV)
4. Add conversation tags/categories
5. Implement conversation summarization
6. Add analytics dashboard
7. Auto-cleanup old conversations

## Troubleshooting

### MongoDB Connection Issues
```python
# Check connection
from app.utils.mongo_helper import MongoHelper
helper = MongoHelper()
helper.test_connection()  # Should not raise exception
```

### Missing conversation_id
- Server auto-creates nếu không có trong request
- Client should save conversation_id từ first response

### Large History
- Use limit parameter: `?limit=50`
- Implement pagination nếu cần

### Performance
- Index on: conversation_id, user_id, timestamp
- Run: `python scripts/init_mongodb_indexes.py`

## Conclusion

Hệ thống chat history đã được implement hoàn chỉnh với:
- ✓ Auto-save mọi chat exchange
- ✓ Non-blocking error handling
- ✓ Complete CRUD operations
- ✓ Stats & analytics
- ✓ Test utilities
- ✓ Full API documentation

System ready for production use sau khi test MongoDB connection!

# Hướng Dẫn Debug - Kiểm Tra AI Chat Có Gọi API Koha Không

## 🎯 Mục Đích
File này hướng dẫn cách xem logs để **chứng minh AI chat đang gọi API thật từ Koha**, không phải MongoDB hay dữ liệu giả.

---

## 📋 Các Loại Log Quan Trọng

Khi AI chat gọi API Koha, bạn sẽ thấy các log này:

### 1️⃣ **Koha API Call** (🔵)
```
🔵 KOHA API CALL
   Method: GET
   URL: http://45.118.146.109:8082/api/v1/biblios
   Params: {'_per_page': 5, '_page': 1, 'q': '{"title":{"-like":"%toán%"}}'}
================================================================================
```
**Ý nghĩa:** Đang gọi API thật đến server Koha

### 2️⃣ **Koha API Response** (✅)
```
✅ KOHA API RESPONSE - Status: 200
   Records returned: 5
   Preview: {'biblio_id': 2, 'title': 'Bài tập toán cao cấp', ...}...
================================================================================
```
**Ý nghĩa:** Nhận được dữ liệu thật từ Koha

### 3️⃣ **AI Request** (🤖)
```
🤖 AI SEARCH REQUEST: query='toán', limit=5
```
**Ý nghĩa:** AI đang yêu cầu tìm kiếm

### 4️⃣ **AI Success** (✅)
```
✅ AI SEARCH SUCCESS: Found 5 books from Koha API
```
**Ý nghĩa:** AI nhận được dữ liệu từ Koha thành công

### 5️⃣ **Context Building** (🔍)
```
🔍 BUILD CONTEXT FOR BOOKS: query='toán', limit=5
✅ FOUND 5 BOOKS from Koha, building context...
✅ CONTEXT BUILT: 542 characters
```
**Ý nghĩa:** AI đang build context từ dữ liệu Koha để đưa vào prompt

---

## 🧪 Cách Test Ngay

### Test Script (Không cần chạy Flask app)
```bash
cd C:\Workspace\TTTN\LibAI\backend
python test_koha_debug_logging.py
```

**Kết quả:** Bạn sẽ thấy toàn bộ logs chi tiết cho 3 test cases:
1. Tìm kiếm sách
2. Xem chi tiết sách
3. Build context cho AI

---

## 🚀 Cách Xem Log Khi Chạy Flask App

### Bước 1: Chạy Flask với log level INFO
```bash
cd C:\Workspace\TTTN\LibAI\backend
$env:FLASK_ENV="development"
python run.py
```

### Bước 2: Mở Console/Terminal để xem logs
Flask sẽ in logs ra console. Bạn sẽ thấy mỗi request từ AI.

### Bước 3: Chat với AI
Ví dụ hỏi:
- "Tìm sách về toán"
- "Cho tôi biết về sách ID 2"
- "Sách của tác giả Nguyễn Đình Trí"

### Bước 4: Quan sát Logs
Ngay khi bạn hỏi, logs sẽ hiện:
```
🤖 AI SEARCH REQUEST: query='toán', limit=10
🔵 KOHA API CALL
   Method: GET
   URL: http://45.118.146.109:8082/api/v1/biblios
   Params: {...}
✅ KOHA API RESPONSE - Status: 200
   Records returned: 5
✅ AI SEARCH SUCCESS: Found 5 books from Koha API
```

**Nếu KHÔNG thấy logs này → AI KHÔNG gọi Koha**
**Nếu THẤY logs này → AI ĐANG GỌI Koha thật 100%**

---

## 📊 Ví Dụ Log Hoàn Chỉnh

```
INFO:app.services.prompt.koha_context:🔍 BUILD CONTEXT FOR BOOKS: query='toán', limit=5
INFO:app.services.library.koha_tools:🤖 AI SEARCH REQUEST: query='toán', limit=5
INFO:app.services.library.koha_client:================================================================================
INFO:app.services.library.koha_client:🔵 KOHA API CALL
INFO:app.services.library.koha_client:   Method: GET
INFO:app.services.library.koha_client:   URL: http://45.118.146.109:8082/api/v1/biblios
INFO:app.services.library.koha_client:   Params: {'_per_page': 5, '_page': 1, 'q': '{"title":{"-like":"%toán%"}}'}
INFO:app.services.library.koha_client:================================================================================
INFO:app.services.library.koha_client:Koha search strategy 1: ... with params=...
INFO:app.services.library.koha_client:Koha response: status=200, content_length=3421
INFO:app.services.library.koha_client:Koha data type: list, results count: 5
INFO:app.services.library.koha_client:================================================================================
INFO:app.services.library.koha_client:✅ KOHA API RESPONSE - Status: 200
INFO:app.services.library.koha_client:   Records returned: 5
INFO:app.services.library.koha_client:   Preview: {'biblio_id': 2, 'title': 'Bài tập toán cao cấp', ...}...
INFO:app.services.library.koha_client:================================================================================
INFO:app.services.library.koha_tools:✅ AI SEARCH SUCCESS: Found 5 books from Koha API
INFO:app.services.prompt.koha_context:✅ FOUND 5 BOOKS from Koha, building context...
INFO:app.services.prompt.koha_context:✅ CONTEXT BUILT: 542 characters
```

**Giải thích từng bước:**
1. **Line 1:** AI context builder bắt đầu build context cho query 'toán'
2. **Line 2:** AI tools request tìm kiếm
3. **Lines 3-8:** Gọi API Koha thật với URL + params chi tiết
4. **Lines 9-11:** Nhận response từ Koha (status 200, 5 results)
5. **Lines 12-16:** Koha trả về 5 sách thành công
6. **Line 17:** AI tools xác nhận nhận được 5 sách từ Koha
7. **Lines 18-19:** Build context hoàn tất (542 ký tự)

---

## 🔍 Cách Phân Biệt Dữ Liệu Koha vs MongoDB

| Dấu Hiệu | Koha | MongoDB |
|----------|------|---------|
| Log có `🔵 KOHA API CALL` | ✅ Có | ❌ Không |
| Log có `URL: http://45.118.146.109:8082` | ✅ Có | ❌ Không |
| Log có `Records returned: X` | ✅ Có | ❌ Không |
| Log có `MongoHelper` | ❌ Không | ✅ Có |
| Log có `MongoDB query` | ❌ Không | ✅ Có |

---

## ⚠️ Troubleshooting

### Không thấy logs gì cả?
```bash
# Set log level về INFO
export FLASK_DEBUG=1  # Linux/Mac
$env:FLASK_DEBUG=1     # Windows PowerShell
```

### Thấy logs nhưng không có 🔵 emoji?
- Terminal không hỗ trợ emoji
- Vẫn hợp lệ! Tìm dòng "KOHA API CALL"

### Logs quá nhiều, khó đọc?
```bash
# Filter chỉ Koha logs
python run.py 2>&1 | findstr "KOHA API"
```

---

## 📝 Checklist Xác Nhận AI Gọi Koha

Khi chat với AI, check các điều này:

- [ ] Thấy log `🔵 KOHA API CALL` mỗi khi hỏi về sách
- [ ] URL trong log là `http://45.118.146.109:8082/api/v1/...`
- [ ] Thấy `✅ KOHA API RESPONSE` với status 200
- [ ] Thấy `Records returned: X` với X > 0
- [ ] Thấy `✅ AI SEARCH SUCCESS: Found X books from Koha API`
- [ ] KHÔNG thấy log về MongoDB (MongoHelper, MongoDB query)

**Nếu tất cả đều ✅ → AI 100% đang gọi Koha API thật!**

---

## 🎓 Hiểu Thêm

### Tại sao cần logs này?
- **Transparency:** Biết chính xác AI lấy dữ liệu từ đâu
- **Debugging:** Nếu AI trả lời sai, kiểm tra xem Koha có trả đúng data không
- **Performance:** Đếm số lần gọi API để optimize

### Flow hoàn chỉnh từ User → AI → Koha:
```
User hỏi "Tìm sách toán"
    ↓
Frontend gửi request đến Flask /chat
    ↓
AI service build prompt (koha_context.py)
    ↓  [🔍 BUILD CONTEXT FOR BOOKS]
AI tools search (koha_tools.py)
    ↓  [🤖 AI SEARCH REQUEST]
Koha client gọi API (koha_client.py)
    ↓  [🔵 KOHA API CALL]
Koha server response
    ↓  [✅ KOHA API RESPONSE]
AI nhận data
    ↓  [✅ AI SEARCH SUCCESS]
Context được build
    ↓  [✅ CONTEXT BUILT]
AI generate response với context
    ↓
Response trả về user
```

Mỗi bước đều có log tương ứng!

---

## 🚀 Quick Start

```bash
# Test ngay không cần Flask
python backend/test_koha_debug_logging.py

# Hoặc chạy Flask và chat
python backend/run.py
# Rồi chat: "Tìm sách về toán"
# Quan sát logs!
```

---

**Tác giả:** AI Assistant  
**Ngày tạo:** 2024  
**File liên quan:**
- `backend/app/services/library/koha_client.py` (API calls)
- `backend/app/services/library/koha_tools.py` (AI wrappers)
- `backend/app/services/prompt/koha_context.py` (Context builders)
- `backend/test_koha_debug_logging.py` (Test script)

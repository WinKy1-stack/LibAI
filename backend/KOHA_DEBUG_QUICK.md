# 🔍 Debug Koha API - Hướng Dẫn Nhanh

## ✅ ĐÃ THÊM GÌ?

Tôi đã thêm **debug logging** vào tất cả điểm quan trọng để bạn biết AI có thực sự gọi API Koha không.

## 🎯 CÁC LOG QUAN TRỌNG

Khi AI chat gọi Koha API, bạn sẽ thấy:

### 1. 🔵 KOHA API CALL
```
🔵 KOHA API CALL
   Method: GET
   URL: http://45.118.146.109:8082/api/v1/biblios
   Params: {'_per_page': 5, 'q': '{"title":{"-like":"%toán%"}}'}
```
→ **Đang gọi API thật đến server Koha**

### 2. ✅ KOHA API RESPONSE
```
✅ KOHA API RESPONSE - Status: 200
   Records returned: 5
```
→ **Nhận được dữ liệu từ Koha**

### 3. 🤖 AI REQUEST
```
🤖 AI SEARCH REQUEST: query='toán', limit=5
```
→ **AI đang yêu cầu tìm kiếm**

### 4. ✅ AI SUCCESS
```
✅ AI SEARCH SUCCESS: Found 5 books from Koha API
```
→ **AI nhận dữ liệu thành công**

## 🧪 TEST NGAY (KHÔNG CẦN FLASK)

```bash
cd C:\Workspace\TTTN\LibAI\backend
python test_koha_debug_logging.py
```

**Kết quả:** Bạn sẽ thấy CHÍNH XÁC logs như khi AI chat gọi API.

## 🚀 XEM LOG KHI CHAT

### 1. Chạy Flask server
```bash
cd C:\Workspace\TTTN\LibAI\backend
python run.py
```

### 2. Mở chat và hỏi
- "Tìm sách về toán"
- "Cho tôi biết về sách ID 2"
- "Sách của Nguyễn Đình Trí"

### 3. Quan sát terminal Flask
Bạn sẽ thấy ngay:
```
🤖 AI SEARCH REQUEST: query='toán', limit=10
🔵 KOHA API CALL
   URL: http://45.118.146.109:8082/api/v1/biblios
✅ KOHA API RESPONSE - Status: 200
   Records returned: 5
✅ AI SEARCH SUCCESS: Found 5 books from Koha API
```

## ✅ CÁCH KIỂM TRA

### ❌ Nếu AI KHÔNG gọi Koha:
- Không thấy log `🔵 KOHA API CALL`
- Không thấy URL `http://45.118.146.109:8082`

### ✅ Nếu AI ĐANG gọi Koha:
- Thấy `🔵 KOHA API CALL` với URL Koha
- Thấy `✅ KOHA API RESPONSE` với số lượng records
- Thấy `✅ AI SEARCH SUCCESS: Found X books from Koha API`

## 📋 FILES ĐÃ THAY ĐỔI

1. **koha_client.py** - Thêm `_log_api_call()` và `_log_api_response()`
2. **koha_tools.py** - Thêm logs cho `search_books_ai()` và `get_book_detail_ai()`
3. **koha_context.py** - Thêm logs cho context builders
4. **test_koha_debug_logging.py** - Script test demo logs
5. **KOHA_DEBUG_GUIDE.md** - Hướng dẫn chi tiết

## 📊 VÍ DỤ LOG THỰC TẾ

```
INFO:app.services.prompt.koha_context:🔍 BUILD CONTEXT FOR BOOKS: query='toán', limit=5
INFO:app.services.library.koha_tools:🤖 AI SEARCH REQUEST: query='toán', limit=5
INFO:app.services.library.koha_client:🔵 KOHA API CALL
INFO:app.services.library.koha_client:   Method: GET
INFO:app.services.library.koha_client:   URL: http://45.118.146.109:8082/api/v1/biblios
INFO:app.services.library.koha_client:   Params: {'_per_page': 5, 'q': '{"title": {"-like": "%toán%"}}'}
INFO:app.services.library.koha_client:✅ KOHA API RESPONSE - Status: 200
INFO:app.services.library.koha_client:   Records returned: 5
INFO:app.services.library.koha_tools:✅ AI SEARCH SUCCESS: Found 5 books from Koha API
```

**Đây là bằng chứng 100% AI đang gọi API Koha thật!**

## 💡 LƯU Ý

- Logs xuất hiện **MỖI KHI** AI cần data từ Koha
- **Không có logs** = AI không gọi Koha
- **Có logs đầy đủ** = AI 100% gọi Koha

## 📞 THAM KHẢO THÊM

Xem file `KOHA_DEBUG_GUIDE.md` cho hướng dẫn chi tiết hơn.

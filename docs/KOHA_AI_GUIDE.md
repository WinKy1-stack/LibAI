# Koha ILS Integration

> Hướng dẫn tích hợp Koha ILS với AI Chat

---

## Tổng Quan

LibAI tích hợp **Koha ILS** với các tính năng:

- ✅ Tìm kiếm 6 trường tự động (title, author, publisher, year, copyright, ISBN)
- ✅ Nhận diện ý định không cần từ khóa rõ ràng
- ✅ FAQ tự động từ MongoDB
- ✅ Async chat (non-blocking)
- ✅ Tiếng Việt hoàn hảo

---

## Cấu Hình

```bash
# .env
KOHA_API_BASE_URL=http://45.118.146.109:8082
KOHA_API_USERNAME=admin
KOHA_API_PASSWORD=Idt882013!
```

---

## 13 AI Tools

### 📚 Sách (koha_tools.py)
1. `search_books_ai(query)` - Tìm sách 6 trường
2. `get_book_detail_ai(biblio_id)` - Chi tiết sách
3. `get_item_availability_ai(biblio_id)` - Tình trạng

### 👤 Bạn Đọc (koha_tools.py)
4. `get_patron_info_ai(patron_id)` - Thông tin
5. `get_patron_checkouts_ai(patron_id)` - Đang mượn
6. `get_patron_holds_ai(patron_id)` - Đặt trước

### ❓ FAQ (faq_tools.py - Riêng biệt)
7. `get_faqs_for_ai(limit)` - Lấy FAQ mới nhất
8. `search_faqs_by_keyword(keyword)` - Tìm FAQ theo keyword
9. `get_faq_by_category(category)` - Lấy FAQ theo category

---

## Smart Search

Tìm theo thứ tự, dừng khi thấy:

| Trường | Tỷ lệ | Thời gian |
|--------|-------|-----------|
| Title | 60% | 0.3s |
| Author | 25% | 0.5s |
| Publisher | 5% | Error |
| Year | 5% | 1.1s |
| Copyright | 3% | 1.1s |
| ISBN | 2% | Error |

---

## Tự Động Nhận Diện

AI tự động tìm khi:
1. Từ khóa: "tìm sách", "gợi ý"
2. Từ chung: "sách", "cuốn" (không phải câu hỏi)
3. Tên sách: 3-15 từ, không có "?"

---

## FAQ Integration

```python
# Tự động inject khi phát hiện
faq_keywords = ['làm sao', 'hướng dẫn', 'quy định', 'how to', 'faq']

if has_faq_keyword:
    faq_context = build_faq_context(limit=5)
```

---

## Async Chat

```python
# Trước: Sync (block)
def send_message():
    ai_response = prompt_service.generate_response(...)

# Sau: Async (non-block) với timeout & error handling
async def send_message():
    try:
        ai_response = await asyncio.wait_for(
            asyncio.to_thread(
                prompt_service.generate_response, ...
            ),
            timeout=30.0  # 30s timeout
        )
    except asyncio.TimeoutError:
        raise ApiError("AI đang xử lý quá lâu", 503)
    except Exception as e:
        raise ApiError("Lỗi xử lý tin nhắn", 500)
```

**Lợi ích:**
- ✅ Server không bị block, xử lý song song
- ✅ Timeout protection (30s)
- ✅ Error handling đầy đủ

---

## Quy Tắc AI

1. ✅ Có quyền truy cập Koha
2. ❌ Không dùng `print()`
3. ✅ Gọi function → Trả lời 1 lần

---

## Test Cases

```bash
# Test 1: Tìm sách
{"message": "toán"}
✅ Tự động tìm 0.3s

# Test 2: FAQ
{"message": "Làm sao mượn sách?"}
✅ Inject FAQ, trả lời từ DB

# Test 3: Mượn/trả
{"message": "Xem sách đang mượn"}
✅ Gọi get_patron_checkouts_ai()
```

---

## Checklist

- [x] 13 Tools
- [x] Smart Search 6 trường
- [x] FAQ auto-inject
- [x] Async endpoints
- [x] UTF-8 encoding

---

**Production Ready** | *v3.0 - 2025-01-12*

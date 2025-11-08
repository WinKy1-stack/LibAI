# Hướng Dẫn Backend

Tài liệu này cung cấp một cái nhìn tổng quan về kiến trúc backend, các API và các tính năng chính.

## 🚀 Khởi Động Nhanh

1.  **Tạo Môi Trường Ảo:**
    ```bash
    # Di chuyển vào thư mục backend
    cd backend

    # Tạo và kích hoạt môi trường ảo
    python -m venv venv311
    # Windows: .\venv311\Scripts\Activate.ps1
    # Linux/macOS: source venv311/bin/activate
    ```

2.  **Cài Đặt Các Gói Phụ Thuộc:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Cấu Hình Biến Môi Trường:**
    ```bash
    # Sao chép tệp .env.example
    cp .env.example .env
    ```

4.  **Chạy Máy Chủ:**
    ```bash
    python run.py
    ```

    ## 🔌 Tích Hợp Koha ILS

    Hệ thống hỗ trợ lấy dữ liệu trực tiếp từ Koha thông qua REST API để phục vụ AI (trả lời câu hỏi, đề xuất sách) và giao diện frontend.

    ### Biến môi trường cấu hình

    Thêm các khóa sau vào `.env` (KHÔNG commit tài khoản thật):

    ```bash
    # Koha base URL (ví dụ staff client / OPAC)
    KOHA_BASE_URL=http://45.118.146.109:8082

    # Chế độ xác thực: api_key | basic
    KOHA_AUTH_MODE=api_key

    # Nếu dùng API key
    KOHA_API_KEY=your-koha-api-key

    # Nếu dùng basic auth (ít an toàn hơn - chỉ dùng nội bộ)
    KOHA_USERNAME=admin
    KOHA_PASSWORD=your-password
    ```

    Chỉ cấu hình một trong hai cơ chế (ưu tiên API key). Không để lộ mật khẩu/thông tin thật trong repo.

    ### Endpoints

    | Method | Endpoint | Mô tả |
    |--------|----------|-------|
    | GET | `/api/library/koha/search?query=python&limit=10` | Tìm kiếm biểu ghi (biblios) theo từ khóa Koha query syntax |
    | GET | `/api/library/koha/biblio/<id>` | Lấy chi tiết một biểu ghi |

    ### Ví dụ gọi thử với curl (tùy chọn)

    ```bash
    curl "http://localhost:5000/api/library/koha/search?query=title:AI" \
        -H "X-Koha-Auth: $KOHA_API_KEY"
    ```

    ### Sử dụng trong AI Prompt Service

    Bạn có thể inject lớp `KohaClient` từ `app.services.library.koha_client` để lấy dữ liệu mô tả sách rồi đưa vào ngữ cảnh cho model Gemini.

    ```python
    from app.services.library.koha_client import get_koha_client

    client = get_koha_client()
    results = client.search_biblios('data science', limit=5)
    context_snippets = [r.get('title') for r in results['results']]
    ```

    ### Ghi chú bảo mật

    - Luôn dùng API key thay vì Basic Auth nếu Koha hỗ trợ.
    - Hạn chế đánh log đầy đủ nội dung trả về nếu chứa dữ liệu nhạy cảm.
    - Có thể thêm tầng cache MongoDB cho kết quả Koha để giảm tải và tăng tốc.

    ---

## 🗄️ Cơ Sở Dữ Liệu

Backend sử dụng MongoDB và có thể được cấu hình để sử dụng một phiên bản đám mây (khuyến nghị) hoặc một phiên bản cục bộ. Cấu hình được quản lý trong tệp `backend/.env`.

## 💬 API Trò Chuyện

API trò chuyện, được cung cấp bởi Gemini, cho phép các tương tác ngôn ngữ tự nhiên.

### Điểm Cuối

- `POST /api/chat/message`: Gửi một tin nhắn đến chatbot.
- `POST /api/chat/recommend`: Nhận các đề xuất sách.
- `GET /api/chat/health`: Kiểm tra tình trạng của dịch vụ trò chuyện.

### Lịch Sử Trò Chuyện

Lịch sử trò chuyện được tự động lưu vào MongoDB.

- `GET /api/chat/history/<conversation_id>`: Lấy lịch sử của một cuộc trò chuyện.
- `GET /api/chat/conversations`: Lấy danh sách tất cả các cuộc trò chuyện của người dùng.
- `GET /api/chat/stats`: Lấy số liệu thống kê về các cuộc trò chuyện.

## 🧪 Kiểm Thử

Để chạy bộ kiểm thử cho backend, hãy sử dụng lệnh sau:

```bash
pytest
```

---
Để biết thêm chi tiết về các điểm cuối API, hãy tham khảo [Tham Khảo API](./api-reference.md).

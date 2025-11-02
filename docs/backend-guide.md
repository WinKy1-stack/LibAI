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

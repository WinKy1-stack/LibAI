# Xử lý sự cố

Hướng dẫn này cung cấp các giải pháp cho các sự cố thường gặp mà bạn có thể gặp phải trong quá trình cài đặt và chạy ứng dụng.

### Lỗi Frontend

#### ❌ Lỗi: `Cannot find module 'xyz'`
- **Nguyên nhân:** Thiếu các gói phụ thuộc Node.js.
- **Giải pháp:** Chạy `npm install` ở thư mục gốc của dự án.

#### ❌ Lỗi: `Port 5173 already in use`
- **Nguyên nhân:** Cổng 5173 đã được một tiến trình khác sử dụng.
- **Giải pháp:** Chạy `npx kill-port 5173` để giải phóng cổng, hoặc Vite sẽ tự động chuyển sang một cổng khác như 5174.

#### ❌ Lỗi: Chính sách CORS
- **Nguyên nhân:** Backend chưa chạy hoặc CORS chưa được cấu hình đúng cách.
- **Giải pháp:**
    1. Đảm bảo backend đang chạy tại `http://localhost:5000`.
    2. Kiểm tra tệp `backend/app/config.py` để đảm bảo CORS đã được cấu hình.
    3. Xóa bộ nhớ cache của trình duyệt và làm mới trang.

### Lỗi Backend

#### ❌ Lỗi: `Module not found 'flask'`
- **Nguyên nhân:** Môi trường ảo Python chưa được kích hoạt.
- **Giải pháp:**
    ```bash
    cd backend

    # Windows:
    .\venv311\Scripts\Activate.ps1

    # Linux/Mac:
    source venv311/bin/activate
    ```
    Bạn sẽ thấy `(venv311)` ở đầu dòng lệnh của mình.

#### ❌ Lỗi: Phiên bản Python không khớp
- **Nguyên nhân:** Bạn đang sử dụng một phiên bản Python khác 3.11.
- **Giải pháp:** Đảm bảo bạn đã cài đặt Python 3.11.9 và tạo lại môi trường ảo của mình bằng `python3.11 -m venv venv311`.

#### ❌ Lỗi: Kết nối MongoDB không thành công
- **Nguyên nhân:** Không thể kết nối đến máy chủ MongoDB.
- **Giải pháp:**
    1.  **Đối với MongoDB đám mây:** Kiểm tra kết nối internet của bạn và xác minh rằng `USE_CLOUD_MONGODB=true` trong tệp `.env` của bạn.
    2.  **Đối với MongoDB cục bộ:** Đảm bảo dịch vụ MongoDB đang chạy.

### Lỗi Đăng nhập

#### ❌ Lỗi: Đăng nhập không thành công - Mật khẩu không đúng
- **Nguyên nhân:** Nhập sai mật khẩu.
- **Giải pháp:**
    -   Đảm bảo mật khẩu là `Password123` (chữ 'P' viết hoa).
    -   Thử sao chép và dán mật khẩu.

#### ❌ Lỗi: Đăng xuất không hoạt động
- **Nguyên nhân:** Token xác thực không bị xóa khỏi bộ nhớ cục bộ.
- **Giải pháp:**
    1.  Mở các công cụ dành cho nhà phát triển của trình duyệt (F12).
    2.  Đi tới **Ứng dụng > Bộ nhớ cục bộ**.
    3.  Xóa các khóa `access_token`, `refresh_token` và `user` theo cách thủ công và làm mới trang.

# Xử lý sự cố

Hướng dẫn này cung cấp các giải pháp cho các sự cố thường gặp mà bạn có thể gặp phải.

### Kết nối MongoDB không thành công

**Giải pháp**:
- Đảm bảo dịch vụ MongoDB đang chạy:
    ```bash
    mongosh --eval "db.adminCommand('ping')"
    ```
- Khởi động dịch vụ MongoDB nếu nó không chạy:
    ```powershell
    # Đối với Windows
    net start MongoDB
    ```
    ```bash
    # Đối với Linux/macOS
    sudo systemctl start mongod
    ```

### Phiên bản Python không chính xác

**Giải pháp**:
- Kích hoạt môi trường ảo chính xác:
    ```powershell
    # Đối với Windows
    cd backend
    .\venv311\Scripts\Activate.ps1
    ```
    ```bash
    # Đối với Linux/macOS
    cd backend
    source venv311/bin/activate
    ```
- Xác minh phiên bản Python:
    ```bash
    python --version
    # Kết quả mong đợi: Python 3.11.9
    ```

### Frontend không kết nối được với Backend

**Giải pháp**:
- Xác minh rằng backend đang chạy tại `http://localhost:5000`.
- Kiểm tra cài đặt CORS trong `backend/app/config.py`.
- Xóa bộ nhớ cache của trình duyệt của bạn.

### Đăng nhập không thành công

**Giải pháp**:
- Nếu sử dụng cơ sở dữ liệu đám mây, hãy đảm bảo bạn đang sử dụng thông tin đăng nhập tài khoản thử nghiệm chính xác (`Mật khẩu: Password123`).
- Nếu sử dụng cơ sở dữ liệu cục bộ, hãy xác minh rằng cơ sở dữ liệu đã được tạo dữ liệu mẫu:
    ```bash
    mongosh
    > use library_chatbox
    > db.users.find()
    ```

### Đăng xuất không hoạt động

**Giải pháp**:
- Mở các công cụ dành cho nhà phát triển của trình duyệt của bạn (F12) và đi tới **Ứng dụng > Bộ nhớ cục bộ**.
- Xác minh rằng `access_token`, `refresh_token` và `user` đã bị xóa sau khi đăng xuất.
- Nếu chúng vẫn còn, hãy xóa chúng theo cách thủ công và làm mới trang.

### Cổng đã được sử dụng

**Backend (Cổng 5000)**:
```bash
# Đối với Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Đối với Linux/macOS
lsof -ti:5000 | xargs kill -9
```

**Frontend (Cổng 5173)**:
```bash
npx kill-port 5173
```

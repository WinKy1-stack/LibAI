# Tham chiếu API

Tài liệu này cung cấp tài liệu tham khảo cho tất cả các điểm cuối API có sẵn trong backend.

### URL cơ sở
`http://localhost:5000`

### Kiểm tra tình trạng
- `GET /health`: Trả về trạng thái máy chủ.
- `GET /api/health`: Trả về trạng thái API.

### Xác thực (`/api/auth`)

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| ------ | ----------- | ------------------------ | ------------- |
| POST | `/login` | Đăng nhập người dùng. | Không |
| POST | `/register` | Đăng ký người dùng mới. | Không |
| POST | `/logout` | Đăng xuất người dùng hiện tại. | Có |
| POST | `/refresh` | Làm mới mã thông báo truy cập. | Có (Mã thông báo làm mới) |
| GET | `/me` | Lấy thông tin người dùng hiện tại. | Có |

**Ví dụ yêu cầu đăng nhập:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "sv001@ntt.edu.vn",
  "password": "Password123"
}
```

**Ví dụ phản hồi đăng nhập:**

```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "sv001",
    "email": "sv001@ntt.edu.vn",
    "role": "reader",
    "full_name": "Nguyễn Văn A"
  }
}
```

### Thư viện (`/api/library`)

| Phương thức | Điểm cuối | Mô tả | Xác thực | Vai trò |
| ------ | --------------------- | ------------------------- | ---- | ----------- |
| GET | `/marc-records` | Lấy tất cả các bản ghi MARC. | Có | Tất cả |
| GET | `/marc-records/:id` | Lấy một bản ghi MARC duy nhất. | Có | Tất cả |
| GET | `/marc-records/search?q=...` | Tìm kiếm các bản ghi MARC. | Có | Tất cả |
| POST | `/marc-records` | Tạo một bản ghi MARC mới. | Có | Thủ thư+ |
| PUT | `/marc-records/:id` | Cập nhật một bản ghi MARC. | Có | Thủ thư+ |
| DELETE | `/marc-records/:id` | Xóa một bản ghi MARC. | Có | Quản trị viên |
| GET | `/items` | Lấy tất cả các mục. | Có | Tất cả |
| POST | `/items` | Tạo một mục mới. | Có | Thủ thư+ |
| GET | `/loans` | Lấy tất cả các khoản mượn. | Có | Thủ thư+ |
| POST | `/loans/checkout` | Mượn một cuốn sách. | Có | Thủ thư+ |
| POST | `/loans/return` | Trả một cuốn sách. | Có | Thủ thư+ |

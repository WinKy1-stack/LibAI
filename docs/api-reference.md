# Tham chiếu API

Tài liệu này cung cấp tài liệu tham khảo cho tất cả các điểm cuối API có sẵn trong backend.

### URL cơ sở
`http://localhost:5000`

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
| POST | `/marc-records` | Tạo một bản ghi MARC mới. | Có | Thủ thư+ |
| PUT | `/marc-records/:id` | Cập nhật một bản ghi MARC. | Có | Thủ thư+ |
| DELETE | `/marc-records/:id` | Xóa một bản ghi MARC. | Có | Quản trị viên |

### Trò chuyện (`/api/chat`)

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| ------ | ----------- | ------------------------ | ------------- |
| POST | `/message` | Gửi tin nhắn đến chatbot. | Có |
| POST | `/recommend` | Nhận đề xuất sách. | Có |
| GET | `/history/:id` | Lấy lịch sử trò chuyện. | Có |
| GET | `/conversations`| Lấy danh sách cuộc trò chuyện.| Có |
| GET | `/stats` | Lấy thống kê trò chuyện. | Có |
| GET | `/health` | Kiểm tra tình trạng dịch vụ. | Không |

**Ví dụ yêu cầu tin nhắn trò chuyện:**

```bash
POST /api/chat/message
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "message": "Tìm sách về Python cho người mới bắt đầu"
}
```

**Ví dụ phản hồi tin nhắn trò chuyện:**

```json
{
  "success": true,
  "data": {
    "message": "Tôi đề xuất cuốn 'Python Crash Course' của Eric Matthes.",
    "conversation_id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
  },
  "metadata": {
    "latency_ms": 789
  }
}
```

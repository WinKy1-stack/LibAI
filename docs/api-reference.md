# Tham chiếu API (Bản cập nhật)

Tài liệu này cung cấp tài liệu tham khảo cho tất cả các điểm cuối API có sẵn trong backend.

### URL cơ sở
`http://localhost:5000`

### Xác thực (`/api/auth`)

Các điểm cuối để xử lý việc đăng ký, đăng nhập và quản lý phiên của người dùng.

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| --- | --- | --- | --- |
| POST | `/register` | Đăng ký một tài khoản người dùng mới. | Không |
| POST | `/login` | Đăng nhập để nhận token truy cập và làm mới. | Không |
| POST | `/refresh` | Sử dụng token làm mới để nhận token truy cập mới. | Có (Yêu cầu Refresh Token) |
| GET | `/me` | Lấy thông tin của người dùng hiện tại đã xác thực. | Có |
| POST | `/change-password` | Thay đổi mật khẩu của người dùng hiện tại. | Có |
| POST | `/logout` | Đăng xuất người dùng (thông báo cho client xóa token). | Có |

---

#### POST `/api/auth/register`

Đăng ký tài khoản mới.

**Yêu cầu Body:**

```json
{
  "username": "sv001",
  "email": "sv001@ntt.edu.vn",
  "password": "Password@123",
  "fullName": "Nguyễn Văn A"
}
```

**Phản hồi thành công (201):**

```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "60d5ec49e7a4b2a3f4e8b9e4",
    "email": "sv001@ntt.edu.vn",
    "name": "Nguyễn Văn A",
    "role": "reader"
  }
}
```

---

#### POST `/api/auth/login`

Đăng nhập bằng `username` (có thể là student_id) hoặc `email`.

**Yêu cầu Body:**

```json
{
  "username": "sv001@ntt.edu.vn",
  "password": "Password@123"
}
```

**Phản hồi thành công (200):**

```json
{
  "message": "Đăng nhập thành công",
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": "60d5ec49e7a4b2a3f4e8b9e4",
    "email": "sv001@ntt.edu.vn",
    "name": "Nguyễn Văn A",
    "role": "reader",
    "student_id": "sv001",
    "major": ""
  }
}
```

---

#### POST `/api/auth/refresh`

Làm mới access token. Cần gửi kèm `Refresh Token` trong header `Authorization`.

**Phản hồi thành công (200):**

```json
{
  "access_token": "..."
}
```

---

#### GET `/api/auth/me`

Lấy thông tin chi tiết của người dùng đang đăng nhập.

**Phản hồi thành công (200):**

```json
{
  "user": {
    "id": "60d5ec49e7a4b2a3f4e8b9e4",
    "email": "sv001@ntt.edu.vn",
    "name": "Nguyễn Văn A",
    "role": "reader",
    "student_id": "sv001",
    "major": "",
    "status": "active"
  }
}
```

---

#### POST `/api/auth/change-password`

Thay đổi mật khẩu.

**Yêu cầu Body:**

```json
{
  "old_password": "Password@123",
  "new_password": "NewPassword@123"
}
```

**Phản hồi thành công (200):**

```json
{
  "message": "Đổi mật khẩu thành công"
}
```

---

#### POST `/api/auth/logout`

Thông báo cho client để xóa token.

**Phản hồi thành công (200):**

```json
{
  "message": "Đăng xuất thành công"
}
```

### Người dùng (`/api/users`)

Các điểm cuối để quản lý tài khoản người dùng. Yêu cầu quyền admin.

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| --- | --- | --- | --- |
| GET | `/users` | Lấy danh sách tất cả người dùng. | Có (Admin) |
| GET | `/users/<string:user_id>` | Lấy thông tin chi tiết của một người dùng. | Có (Admin) |
| POST | `/users` | Tạo một người dùng mới. | Có (Admin) |
| PUT | `/users/<string:user_id>` | Cập nhật thông tin của một người dùng. | Có (Admin) |
| DELETE | `/users/<string:user_id>` | Xóa một người dùng. | Có (Admin) |

---

#### GET `/api/users`

Lấy danh sách tất cả người dùng.

**Phản hồi thành công (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "60d5ec49e7a4b2a3f4e8b9e4",
      "email": "sv001@ntt.edu.vn",
      "name": "Nguyễn Văn A",
      "role": "reader",
      ...
    }
  ]
}
```

---

#### GET `/api/users/<string:user_id>`

Lấy thông tin chi tiết của một người dùng cụ thể.

**Phản hồi thành công (200):**

```json
{
  "success": true,
  "data": {
    "id": "60d5ec49e7a4b2a3f4e8b9e4",
    "email": "sv001@ntt.edu.vn",
    "name": "Nguyễn Văn A",
    ...
  }
}
```

---

#### POST `/api/users`

Tạo một người dùng mới.

**Yêu cầu Body:**

```json
{
  "email": "sv002@ntt.edu.vn",
  "name": "Trần Thị B",
  "password": "Password@456",
  "role": "librarian",
  "student_id": "sv002"
}
```

**Phản hồi thành công (201):**

```json
{
  "success": true,
  "message": "Tạo user thành công",
  "data": { ... }
}
```

---

#### PUT `/api/users/<string:user_id>`

Cập nhật thông tin của một người dùng.

**Yêu cầu Body:**

```json
{
  "name": "Trần Thị C",
  "major": "Công nghệ thông tin"
}
```

**Phản hồi thành công (200):**

```json
{
  "success": true,
  "message": "Cập nhật user thành công",
  "data": { ... }
}
```

---

#### DELETE `/api/users/<string:user_id>`

Xóa một người dùng.

**Phản hồi thành công (200):**

```json
{
  "success": true,
  "message": "Xóa user thành công"
}
```

### Chat (`/api/chat`)

Các điểm cuối liên quan đến AI chat, lịch sử và gợi ý.

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| --- | --- | --- | --- |
| POST | `/message` | Gửi tin nhắn đến AI (lưu lịch sử). | Có |
| POST | `/message/guest` | Gửi tin nhắn đến AI (không lưu lịch sử). | Không |
| GET | `/history/<string:conv_id>` | Lấy lịch sử tin nhắn của một cuộc trò chuyện. | Có |
| GET | `/conversations` | Lấy danh sách cuộc trò chuyện của người dùng. | Có |
| POST | `/conversation/end` | Kết thúc một cuộc trò chuyện. | Có |
| GET | `/stats` | Lấy thống kê trò chuyện của người dùng. | Có |
| POST | `/recommend` | Nhận gợi ý sách dựa trên sở thích. | Có |
| POST | `/search` | Tìm kiếm sách thông minh bằng AI. | Có |

---

#### POST `/api/chat/message`

Gửi tin nhắn và nhận phản hồi từ AI. Lịch sử sẽ được lưu lại.

**Yêu cầu Body:**

```json
{
  "message": "Xin chào, bạn có thể giúp gì cho tôi?",
  "conversation_id": "60d5f..." // (Tùy chọn)
}
```

**Phản hồi thành công (200):**

```json
{
  "success": true,
  "data": {
    "message": "Chào bạn, tôi là trợ lý ảo của thư viện...",
    "conversation_id": "60d5f..."
  },
  ...
}
```

---

#### POST `/api/chat/message/guest`

Gửi tin nhắn như một khách (không đăng nhập). Lịch sử không được lưu.

**Yêu cầu Body:**

```json
{
  "message": "Thư viện có những loại sách nào?"
}
```

---

#### GET `/api/chat/history/<string:conversation_id>`

Lấy lịch sử tin nhắn của một cuộc trò chuyện.

**Tham số Query:**
- `limit`: Số lượng tin nhắn tối đa (mặc định: 100).

---

#### GET `/api/chat/conversations`

Lấy danh sách các cuộc trò chuyện của người dùng hiện tại.

**Tham số Query:**
- `limit`: Số lượng cuộc trò chuyện (mặc định: 20).
- `skip`: Bỏ qua bao nhiêu cuộc trò chuyện (mặc định: 0).

### Thư viện (`/api/library`)

Các điểm cuối để quản lý tài nguyên thư viện, mượn trả và thống kê.

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| --- | --- | --- | --- |
| GET | `/configs` | Lấy tất cả cấu hình quản trị. | Có (Admin) |
| GET | `/configs/<string:key>` | Lấy một cấu hình cụ thể. | Có (Admin) |
| POST | `/configs` | Cập nhật hoặc tạo mới một cấu hình. | Có (Admin) |
| GET | `/documents` | Lấy danh sách các tài liệu (hướng dẫn, quy định). | Công khai |
| GET | `/items` | Lấy danh sách các bản sao vật lý của sách. | Công khai |
| PUT | `/items/<string:item_id>` | Cập nhật thông tin một bản sao sách. | Có (Librarian) |
| GET | `/loans` | Lấy danh sách các lượt mượn sách. | Có |
| POST | `/loans` | Tạo một lượt mượn sách mới. | Có (Librarian) |
| POST | `/loans/<string:loan_id>/return` | Đánh dấu một lượt mượn đã được trả. | Có (Librarian) |
| POST | `/loans/<string:loan_id>/renew` | Gia hạn một lượt mượn. | Có |
| GET | `/marc` | Lấy danh sách các biên mục MARC. | Công khai |
| GET | `/marc/<string:record_id>` | Lấy chi tiết một biên mục MARC. | Công khai |
| POST | `/marc` | Tạo một biên mục MARC mới. | Có (Librarian) |
| GET | `/stats/overview` | Lấy thống kê tổng quan của thư viện. | Có (Librarian) |
| GET | `/faq` | Lấy danh sách các câu hỏi thường gặp (FAQ). | Công khai |
| POST | `/faq` | Tạo một câu hỏi thường gặp mới. | Có (Librarian) |
| GET | `/conversations` | Lấy danh sách các cuộc trò chuyện của người dùng. | Có |
| GET | `/conversations/<string:conv_id>/messages` | Lấy tin nhắn trong một cuộc trò chuyện. | Có |

### Tìm kiếm Z39.50 (`/api/z3950`)

Tìm kiếm sách từ các thư viện quốc tế sử dụng giao thức Z39.50.

| Phương thức | Điểm cuối | Mô tả | Yêu cầu xác thực |
| --- | --- | --- | --- |
| GET | `/search/all` | Tìm kiếm trên tất cả các nguồn Z39.50. | Không |
| GET | `/search/<string:source>` | Tìm kiếm trên một nguồn Z39.50 cụ thể. | Không |
| GET | `/sources` | Lấy danh sách các nguồn Z39.50 có sẵn. | Không |
| GET | `/health` | Kiểm tra trạng thái của dịch vụ Z39.50. | Không |
| POST | `/cache/clear` | Xóa bộ nhớ cache của Z39.50. | Có (Librarian) |
| GET | `/cache/stats` | Lấy thống kê bộ nhớ cache của Z39.50. | Có (Librarian) |

---

#### GET `/api/z3950/search/all`

Tìm kiếm trên tất cả các nguồn Z39.50 được kích hoạt.

**Tham số Query:**
- `q` (bắt buộc): Truy vấn tìm kiếm.
- `type`: Loại truy vấn (`isbn`, `title`, `author`, `subject`, `keyword`). Mặc định: `keyword`.
- `limit`: Số lượng kết quả tối đa cho mỗi nguồn. Mặc định: 5.
- `cache`: Sử dụng bộ nhớ cache (`true`/`false`). Mặc định: `true`.
- `save`: Lưu các bản ghi mới vào cơ sở dữ liệu (`true`/`false`). Mặc định: `false`.

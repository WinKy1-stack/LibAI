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
| GET | `/items` | Lấy tất cả các mục. | Có | Tất cả |
| POST | `/items` | Tạo một mục mới. | Có | Thủ thư+ |
| GET | `/loans` | Lấy tất cả các khoản mượn. | Có | Thủ thư+ |
| POST | `/loans/checkout` | Mượn một cuốn sách. | Có | Thủ thư+ |
| POST | `/loans/return` | Trả một cuốn sách. | Có | Thủ thư+ |

### Tìm kiếm Z39.50 (`/api/z3950`)

Tìm kiếm sách từ các thư viện quốc tế sử dụng giao thức Z39.50.

📖 **[Xem tài liệu chi tiết](./z3950-api.md)**

| Phương thức | Điểm cuối | Mô tả | Xác thực | Vai trò |
| ------ | --------------------- | ------------------------- | ---- | ----------- |
| GET | `/search/all` | Tìm kiếm tất cả nguồn (LOC, UW, OCLC). | Không | Công khai |
| GET | `/search/{source}` | Tìm kiếm một nguồn cụ thể. | Không | Công khai |
| GET | `/sources` | Lấy danh sách nguồn khả dụng. | Không | Công khai |
| GET | `/health` | Kiểm tra trạng thái service. | Không | Công khai |
| POST | `/cache/clear` | Xóa cache Z39.50. | Có | Thủ thư+ |
| GET | `/cache/stats` | Xem thống kê cache. | Có | Thủ thư+ |

**Ví dụ tìm kiếm:**

```bash
# Tìm tất cả nguồn theo tiêu đề
GET /api/z3950/search/all?q=machine%20learning&type=title&limit=5

# Tìm theo ISBN
GET /api/z3950/search/loc?q=978-0262035613&type=isbn

# Tìm và lưu vào database
GET /api/z3950/search/all?q=python&type=keyword&save=true
```

**Query Parameters:**
- `q` (bắt buộc): Từ khóa tìm kiếm
- `type`: Loại tìm kiếm - `isbn`, `title`, `author`, `subject`, `keyword` (mặc định: `keyword`)
- `limit`: Số kết quả tối đa (1-100, mặc định: 5)
- `cache`: Sử dụng cache (`true`/`false`, mặc định: `true`)
- `save`: Lưu kết quả mới vào DB (`true`/`false`, mặc định: `false`)

**Nguồn hỗ trợ:**
- `loc` - Library of Congress (Thư viện Quốc hội Mỹ)
- `uw` - UW-Madison (Đại học Wisconsin-Madison)
- `oclc` - OCLC WorldCat (Yêu cầu xác thực, mặc định tắt)

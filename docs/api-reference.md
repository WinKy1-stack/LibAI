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
**Ví dụ truy vấn dữ liệu:**
1.Cài ứng dụng Yaz: https://www.indexdata.com/resources/software/yaz/
  Phiên bản 3.31.0
  Sau khi cài xong, kiểm tra trong Command Prompt:yaz-client
  Kết quả trả về: Z>(Cài đặt thành công)
  Nếu không vào PATH thêm file.bin
2. Kiểm thử với Yaz: Mở Terminal:yaz-client z3950.loc.gov:7090/voyager
  -find @attr 1=4 "python"
  -show 1
3.Chạy với dự án trong Visua Code
   #Di chuyển vào thư mục backend
    cd backend
    # Tạo và kích hoạt môi trường ảo
    python -m venv venv311
    # Windows: .\venv311\Scripts\Activate.ps1
    # Linux/macOS: source venv311/bin/activate

- Chạy ứng dụng: python run.py
- Thử nghiệm truy vấn với những trường:
- Tác giả: http://127.0.0.1:5000/search?keyword=Stephen%20Hawking&field=author
- Tên sách: http://127.0.0.1:5000/search?keyword=Deep%20Learning&field=title
- Chủ đề: http://127.0.0.1:5000/search?keyword=Artificial%20Intelligence&field=subject
- IISBN: http://127.0.0.1:5000/search?keyword=9780262035613&field=isbn
### Tìm kiếm 

| Phương thức | Điểm cuối                             | Mô tả                                                            | Yêu cầu xác thực |
| ----------- | ------------------------------------- | ---------------------------------------------------------------- | ---------------- |
| **GET**     | `/search?keyword=...&field=any`       | Tìm kiếm tổng hợp toàn văn (tiêu đề, tác giả, chủ đề, mô tả...). | Không            |
| **GET**     | `/search?keyword=...&field=title`     | Tìm theo **nhan đề** (245$a).                                    | Không            |
| **GET**     | `/search?keyword=...&field=author`    | Tìm theo **tác giả** (100$a hoặc 700$a).                         | Không            |
| **GET**     | `/search?keyword=...&field=subject`   | Tìm theo **chủ đề** (650$a).                                     | Không            |
| **GET**     | `/search?keyword=...&field=isbn`      | Tìm theo **ISBN** (020$a).                                       | Không            |
| **GET**     | `/search?keyword=...&field=publisher` | Tìm theo **nhà xuất bản** (260$b).                               | Không            |
| **GET**     | `/search?keyword=...&field=date`      | Tìm theo **năm xuất bản** (260$c).                               | Không            |
### DS Các trường(`field`)

| Mã MARC | Tên trường                         | Tiểu trường | Ý nghĩa                             |   `field` |  Ví dụ                                |
| ------- | ---------------------------------- | ----------- | ----------------------------------- | ----------| --------------------------------------- |
| **245** | Title Statement                    | `$a`        | Nhan đề chính của tài liệu          | `title`   | `?keyword=Deep+Learning&field=title`    |
| **245** | Title Statement                    | `$c`        | Trách nhiệm (tác giả trong nhan đề) | `any`     | `?keyword=Goodfellow&field=any`         |
| **100** | Main Entry — Personal Name         | `$a`        | Tác giả chính                       | `author`  | `?keyword=Stephen+Hawking&field=author` |
| **700** | Added Entry — Personal Name        | `$a`        | Tác giả phụ                         | `author`  | `?keyword=Yoshua+Bengio&field=author`   |
| **260** | Publication, Distribution, etc.    | `$b`        | Nhà xuất bản                        | `publisher`| `?keyword=Pearson&field=publisher`     |
| **260** | Publication, Distribution, etc.    | `$c`        | Năm xuất bản                        | `date`     | `?keyword=2023&field=date`             |
| **650** | Subject Added Entry — Topical Term | `$a`        | Chủ đề / lĩnh vực                   | `subject`  | `?keyword=Artificial+Intelligence&field=subject` |
| **520** | Summary, etc.                      | `$a`        | Tóm tắt hoặc mô tả nội dung         | `any`      | `?keyword=neural+network&field=any`    |
| **504** | Bibliography, etc. Note            | `$a`        | Ghi chú tài liệu tham khảo          | `any`      | `?keyword=reference&field=any`         |
| **020** | ISBN                               | `$a`        | Mã số sách chuẩn quốc tế            | `isbn`     | `?keyword=9780262035613&field=isbn`    |

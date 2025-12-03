# Koha ILS Integration Guide

## Tổng quan

LibAI đã được tích hợp hoàn chỉnh với **Koha Integrated Library System (ILS)** - hệ thống quản lý thư viện mã nguồn mở phổ biến nhất thế giới.

## Tính năng

### 🔐 Authentication
- ✅ **API Key Authentication** - Bảo mật cao cho production
- ✅ **Basic Authentication** - Dễ dàng setup cho development
- ✅ **Connection Pooling** - Tối ưu hiệu suất
- ✅ **Retry Strategy** - Tự động retry khi connection fail

### 📚 Book Operations
- ✅ **Search Books** - Tìm kiếm sách trong catalog
- ✅ **Get Book Details** - Thông tin chi tiết về sách
- ✅ **Check Availability** - Kiểm tra tình trạng sẵn có
- ✅ **Multi-field Search** - Tìm theo title, author, ISBN

### 👤 Patron Operations
- ✅ **Get Patron Info** - Thông tin bạn đọc
- ✅ **View Checkouts** - Sách đang mượn
- ✅ **View Holds** - Sách đã đặt trước
- ✅ **Create Checkout** - Mượn sách (librarian only)
- ✅ **Create Hold** - Đặt trước sách

### 🏢 Library Operations
- ✅ **List Libraries** - Danh sách chi nhánh
- ✅ **Library Details** - Thông tin chi nhánh
- ✅ **Circulation Stats** - Thống kê mượn/trả (librarian only)

### 🤖 AI Integration
- ✅ **8 AI Tools** - Chatbot có thể gọi Koha API
- ✅ **Natural Language** - Hỏi bằng tiếng Việt tự nhiên
- ✅ **Smart Context** - AI hiểu ngữ cảnh câu hỏi

---

## Cấu hình

### 1. Environment Variables

Thêm vào file `.env`:

```bash
# Koha Base URL
KOHA_BASE_URL=http://103.124.95.249:8001

# Authentication Mode: api_key hoặc basic
KOHA_AUTH_MODE=basic

# API Key (nếu dùng api_key mode)
KOHA_API_KEY=your_api_key_here

# Basic Auth Credentials (nếu dùng basic mode)
KOHA_USERNAME=admin
KOHA_PASSWORD=Idt@12345
```

### 2. Chọn Authentication Mode

#### Option A: Basic Authentication (Recommended for Development)
```bash
KOHA_AUTH_MODE=basic
KOHA_USERNAME=admin
KOHA_PASSWORD=Idt@12345
```

**Ưu điểm:**
- Dễ setup
- Không cần tạo API key

**Nhược điểm:**
- Kém bảo mật hơn
- Gửi credentials mỗi request

#### Option B: API Key (Recommended for Production)
```bash
KOHA_AUTH_MODE=api_key
KOHA_API_KEY=your_generated_api_key
```

**Ưu điểm:**
- Bảo mật cao hơn
- Có thể revoke key
- Không expose password

**Nhược điểm:**
- Cần setup API key trong Koha admin

**Cách tạo API Key trong Koha:**
1. Login Koha với admin account
2. Vào **More > Manage API keys**
3. Click **Generate new client ID/secret**
4. Copy Client ID và Secret
5. Combine: `KOHA_API_KEY=ClientID:Secret`

---

## API Endpoints

### Connection Test
```bash
GET /api/koha/test
```

**Response:**
```json
{
  "status": "success",
  "message": "Kết nối Koha thành công",
  "base_url": "http://103.124.95.249:8001",
  "auth_mode": "basic"
}
```

---

### Book Search
```bash
GET /api/koha/books/search?q=python&limit=10&field=title
```

**Parameters:**
- `q` (required) - Từ khóa tìm kiếm
- `limit` (optional) - Số kết quả (default: 20, max: 100)
- `page` (optional) - Trang (default: 1)
- `field` (optional) - Trường tìm kiếm (title, author, isbn)

**Response:**
```json
{
  "status": "success",
  "results": [...],
  "total": 15,
  "query": "python",
  "page": 1,
  "limit": 10
}
```

---

### Book Details
```bash
GET /api/koha/books/123
```

**Response:**
```json
{
  "status": "success",
  "book": {
    "biblio_id": 123,
    "title": "Python Programming",
    "author": "John Doe",
    "isbn": "978-1234567890",
    ...
  }
}
```

---

### Check Availability
```bash
GET /api/koha/books/123/availability
```

**Response:**
```json
{
  "status": "success",
  "biblio_id": 123,
  "total_items": 5,
  "available_items": 3,
  "items": [...]
}
```

---

### Patron Info
```bash
GET /api/koha/patrons/456
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": "success",
  "patron": {
    "patron_id": 456,
    "cardnumber": "LIB123456",
    "surname": "Nguyễn",
    "firstname": "Văn A",
    ...
  }
}
```

---

### Patron Checkouts
```bash
GET /api/koha/patrons/456/checkouts
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": "success",
  "patron_id": 456,
  "total_checkouts": 3,
  "checkouts": [
    {
      "title": "Python Programming",
      "due_date": "2024-12-31T00:00:00",
      "renewals": 0
    },
    ...
  ]
}
```

---

### Patron Holds
```bash
GET /api/koha/patrons/456/holds
Authorization: Bearer <jwt_token>
```

---

### Create Checkout (Librarian Only)
```bash
POST /api/koha/checkouts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patron_id": 456,
  "item_id": 789
}
```

---

### Create Hold
```bash
POST /api/koha/holds
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patron_id": 456,
  "biblio_id": 123,
  "pickup_library_id": "MAIN"
}
```

---

### List Libraries
```bash
GET /api/koha/libraries
```

---

### Circulation Stats (Librarian Only)
```bash
GET /api/koha/statistics/circulation?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <jwt_token>
```

---

## AI Tools

### 1. search_koha_books
Tìm kiếm sách trong Koha catalog

**Sử dụng:**
```
User: "Tìm sách về Python trong thư viện"
AI: [Calls search_koha_books("python")]
```

---

### 2. get_koha_book_detail
Lấy thông tin chi tiết về sách

**Sử dụng:**
```
User: "Cho tôi biết thêm về cuốn sách số 123"
AI: [Calls get_koha_book_detail(123)]
```

---

### 3. check_koha_book_availability
Kiểm tra tình trạng sách

**Sử dụng:**
```
User: "Sách này còn không?"
AI: [Calls check_koha_book_availability(123)]
```

---

### 4. get_koha_patron_info
Thông tin bạn đọc

**Sử dụng:**
```
User: "Xem thông tin tài khoản của tôi"
AI: [Calls get_koha_patron_info(current_patron_id)]
```

---

### 5. get_koha_patron_checkouts
Sách đang mượn

**Sử dụng:**
```
User: "Tôi đang mượn sách gì?"
AI: [Calls get_koha_patron_checkouts(current_patron_id)]
```

---

### 6. get_koha_patron_holds
Sách đã đặt trước

**Sử dụng:**
```
User: "Xem sách tôi đã đặt"
AI: [Calls get_koha_patron_holds(current_patron_id)]
```

---

### 7. get_koha_libraries
Danh sách thư viện

**Sử dụng:**
```
User: "Có những thư viện nào?"
AI: [Calls get_koha_libraries()]
```

---

### 8. test_koha_connection
Test kết nối Koha

**Sử dụng:**
```
User: "Kiểm tra xem Koha có hoạt động không?"
AI: [Calls test_koha_connection()]
```

---

## Testing

### Quick Test Script

Chạy test script:
```bash
cd backend
python scripts/test_koha.py
```

### Manual Testing

#### 1. Test Connection
```bash
curl http://localhost:5000/api/koha/test
```

#### 2. Search Books
```bash
curl "http://localhost:5000/api/koha/books/search?q=python&limit=5"
```

#### 3. Get Book Details
```bash
curl http://localhost:5000/api/koha/books/123
```

---

## Architecture

### Service Layer
```
KohaService (koha_service.py)
├── Authentication Management
├── Connection Pooling
├── HTTP Request Methods (GET, POST, PUT, DELETE)
└── Error Handling
```

### Client Layer
```
KohaClient (koha_client.py)
├── Book Operations
├── Patron Operations
├── Circulation Operations
└── Library Operations
```

### AI Tools Layer
```
koha_tools.py
├── SearchKohaBooksTool
├── GetKohaBookDetailTool
├── CheckKohaBookAvailabilityTool
├── GetKohaPatronInfoTool
├── GetKohaPatronCheckoutsTool
├── GetKohaPatronHoldsTool
├── GetKohaLibrariesTool
└── TestKohaConnectionTool
```

### API Routes Layer
```
koha_routes.py
├── Connection & Testing
├── Book Endpoints
├── Patron Endpoints
├── Circulation Endpoints
├── Library Endpoints
└── Statistics Endpoints
```

---

## Error Handling

### Connection Errors
```python
KohaConnectionError - Không thể kết nối đến Koha
KohaAuthenticationError - Xác thực thất bại
KohaAPIError - Lỗi từ Koha API
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Security

### JWT Authentication
- Patron endpoints require valid JWT token
- Librarian-only endpoints require librarian role

### Credential Protection
- Never commit `.env` file
- Use environment variables for sensitive data
- API keys can be rotated without code changes

---

## Performance

### Connection Pooling
- Max 10 concurrent connections
- Max 20 connections in pool
- Automatic retry on failures

### Caching
- Consider implementing Redis cache for frequent queries
- Cache book details (TTL: 1 hour)
- Cache library list (TTL: 24 hours)

---

## Troubleshooting

### Connection Failed
```
Error: Không thể kết nối đến Koha
```
**Solution:**
1. Check KOHA_BASE_URL is correct
2. Check Koha server is running
3. Check network connectivity
4. Verify firewall rules

### Authentication Failed
```
Error: Authentication failed - check credentials
```
**Solution:**
1. Verify KOHA_USERNAME and KOHA_PASSWORD
2. Check if API key is valid
3. Ensure user has necessary permissions in Koha

### Import Error
```
ModuleNotFoundError: No module named 'app.services.koha'
```
**Solution:**
1. Restart Flask server
2. Check if `__init__.py` exists in koha service folder
3. Verify imports in `app/__init__.py`

---

## Best Practices

### 1. Use API Key in Production
API key authentication is more secure than basic auth.

### 2. Implement Caching
Cache frequently accessed data to reduce API calls.

### 3. Handle Errors Gracefully
Always check `status` field in responses.

### 4. Rate Limiting
Consider implementing rate limiting for public endpoints.

### 5. Logging
Monitor Koha integration logs for issues.

---

## Future Enhancements

### Planned Features
- [ ] Renew checkout functionality
- [ ] Cancel hold functionality
- [ ] Advanced search filters
- [ ] Book recommendations based on history
- [ ] Email notifications for due dates
- [ ] Fine/payment tracking
- [ ] Collection statistics dashboard

---

## Support

### Resources
- **Koha Documentation**: https://koha-community.org/documentation/
- **Koha REST API**: https://api.koha-community.org/
- **LibAI Documentation**: `/docs/`

### Contact
For issues or questions about Koha integration:
- Create issue in GitHub repository
- Email: support@libai.com

---

**Version:** 1.0.0  
**Last Updated:** December 3, 2025  
**Status:** ✅ Production Ready

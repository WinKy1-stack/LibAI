# Backend Flask API

Đây là backend API sử dụng Flask framework.

## Cấu trúc thư mục

```
backend/
├── app/                    # Thư mục chính chứa code ứng dụng
│   ├── __init__.py        # Khởi tạo Flask app
│   ├── config.py          # Cấu hình ứng dụng
│   ├── models/            # Database models
│   ├── routes/            # API routes/endpoints
│   ├── services/          # Business logic
│   └── utils/             # Các hàm tiện ích
├── migrations/            # Database migrations
├── tests/                 # Unit tests
├── .env.example          # File mẫu biến môi trường
├── requirements.txt      # Python dependencies
└── run.py               # File chạy ứng dụng
```

## Cài đặt

1. Tạo môi trường ảo Python:
```bash
python -m venv venv
```

2. Kích hoạt môi trường ảo:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

4. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

5. Chạy migrations:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. Chạy ứng dụng:
```bash
python run.py
```

API sẽ chạy tại `http://localhost:5000`

## API Endpoints

- `GET /api/health` - Kiểm tra trạng thái server
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `GET /api/users/<id>` - Lấy thông tin user theo ID
- `PUT /api/users/<id>` - Cập nhật user
- `DELETE /api/users/<id>` - Xóa user

## Testing

Chạy tests:
```bash
pytest
```

# 🔧 LibAI Backend - Flask API Server# LibAI Backend API



> Flask Backend với MongoDB integration (Local + Cloud Atlas)Backend API cho hệ thống quản lý thư viện LibAI với Flask + JWT Authentication.



## 📋 Yêu cầu## 📦 Requirements (requirements.txt)



- **Python**: 3.11.9 hoặc 3.11+ (khuyến nghị 3.11.9)### Core Dependencies

- **pip**: Python package manager```

- **MongoDB**: Local MongoDB hoặc Cloud Atlas (có sẵn)Flask==3.0.0                    # Web framework

Flask-SQLAlchemy==3.1.1        # ORM

---Flask-Migrate==4.0.5           # Database migrations

Flask-CORS==4.0.0              # CORS support

## ⚡ Quick StartFlask-JWT-Extended==4.6.0      # JWT authentication

bcrypt==4.1.2                  # Password hashing

### 1. Tạo Virtual EnvironmentPyJWT==2.8.0                   # JWT tokens

python-dotenv==1.0.0           # Environment variables

#### Windows (PowerShell)marshmallow==3.20.1            # Serialization

```

```powershell

# Tạo venv với Python 3.11## 🚀 Quick Installation

python -m venv venv311

### Auto Install (Recommended)

# Kích hoạt venv

.\venv311\Scripts\Activate.ps1**Windows:**

```powershell

# Verify version.\install.ps1

python --version```

# Expected: Python 3.11.9

```**Linux/Mac:**

```bash

#### Linux/macOSchmod +x install.sh && ./install.sh

```

```bash

# Tạo venv### Manual Install

python3.11 -m venv venv311

```bash

# Kích hoạt venv# 1. Create virtual environment

source venv311/bin/activatepython -m venv venv



# Verify version# 2. Activate

python --version.\venv\Scripts\Activate.ps1    # Windows

# Expected: Python 3.11.9source venv/bin/activate        # Linux/Mac

```

# 3. Install packages

### 2. Cài đặt Dependenciespip install -r requirements.txt



```bash# 4. Verify

# Cài tất cả packages từ requirements.txtpip list

pip install -r requirements.txt```



# Verify cài đặt## ⚙️ Setup Database

pip list

``````bash

# Copy environment file

### 3. Cấu hình Environment Variablescopy .env.example .env



```bash# Initialize database

# Tạo .env từ templateflask db init

# Windows:flask db migrate -m "Initial migration"

Copy-Item .env.example .envflask db upgrade



# Linux/macOS:# Create test users

cp .env.example .envpython scripts/create_users.py

``````



Chỉnh sửa file `.env`:**Default Users:**

- Admin: `admin` / `Admin123`

```env- Librarian: `librarian` / `Librarian123`

# Dùng Cloud MongoDB (khuyến nghị - không cần cài MongoDB)- User: `user` / `User1234`

USE_CLOUD_MONGODB=true

## 🏃 Run Server

# Hoặc dùng Local MongoDB

USE_CLOUD_MONGODB=false```bash

```python run.py

```

### 4. Seed Database (Optional - chỉ cho Local)

Server: http://localhost:5000

⚠️ **Chỉ cần nếu dùng `USE_CLOUD_MONGODB=false`**

## 📚 API Endpoints

```bash

# Seed local database### Authentication (`/api/auth`)

python scripts/seed_library_data.py- `POST /register` - Register user

```- `POST /login` - Login

- `POST /refresh` - Refresh token

### 5. Chạy Server- `GET /me` - Current user

- `POST /change-password` - Change password

```bash- `POST /logout` - Logout

# Chạy Flask development server

python run.py### Example Usage

```

**Register:**

Server chạy tại: **http://localhost:5000**```bash

curl -X POST http://localhost:5000/api/auth/register \

---  -H "Content-Type: application/json" \

  -d '{"username":"test","email":"test@mail.com","password":"Test1234","full_name":"Test"}'

## 📦 Dependencies```



### Core (Production)**Login:**

```bash

```curl -X POST http://localhost:5000/api/auth/login \

Flask==3.1.2                  # Web framework  -H "Content-Type: application/json" \

Flask-CORS==6.0.1             # Cross-Origin Resource Sharing  -d '{"username":"admin","password":"Admin123"}'

Flask-JWT-Extended==4.7.1     # JWT authentication```

Flask-PyMongo==3.0.1          # MongoDB integration

pymongo==4.15.3               # MongoDB driver## 🔐 Role-Based Authorization

bcrypt==5.0.0                 # Password hashing

python-dotenv==1.1.1          # Environment variables### Roles:

```- `admin` - Full access

- `librarian` - Manage books/users

### Optional (Development)- `user` - Borrow books



```bash### Usage:

# Testing```python

pip install pytest pytest-flask pytest-covfrom flask_jwt_extended import jwt_required

from app.utils.decorators import admin_required, librarian_required

# Code Quality

pip install flake8 black mypy@jwt_required()

@admin_required()

# Production Serverdef admin_only():

pip install gunicorn gevent    return {'message': 'Admin only'}

```

@jwt_required()

---@librarian_required()

def librarian_access():

## 🗄️ Database    return {'message': 'Librarian or Admin'}

```

### MongoDB Cloud Atlas (Khuyến nghị)

## Cấu trúc thư mục

**Ưu điểm**:

- ✅ Không cần cài MongoDB local```

- ✅ Clone project và chạy ngaybackend/

- ✅ Data được sync giữa team├── app/                    # Thư mục chính chứa code ứng dụng

- ✅ Đã có 4 test users sẵn│   ├── __init__.py        # Khởi tạo Flask app

│   ├── config.py          # Cấu hình ứng dụng

**Connection String** (đã config sẵn):│   ├── models/            # Database models

```│   ├── routes/            # API routes/endpoints

mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox│   ├── services/          # Business logic

```│   └── utils/             # Các hàm tiện ích

├── migrations/            # Database migrations

### MongoDB Local├── tests/                 # Unit tests

├── .env.example          # File mẫu biến môi trường

**Cài đặt**:├── requirements.txt      # Python dependencies

- **Windows**: [Download MongoDB Community](https://www.mongodb.com/try/download/community)└── run.py               # File chạy ứng dụng

- **Linux**: `sudo apt install mongodb-community````

- **macOS**: `brew install mongodb-community`

## Cài đặt

**Khởi động**:

```bash1. Tạo môi trường ảo Python:

# Windows```bash

net start MongoDBpython -m venv venv

```

# Linux/macOS

sudo systemctl start mongod2. Kích hoạt môi trường ảo:

```- Windows:

```bash

**Seed database**:venv\Scripts\activate

```bash```

python scripts/seed_library_data.py- Linux/Mac:

``````bash

source venv/bin/activate

---```



## 📊 API Endpoints3. Cài đặt dependencies:

```bash

### Health Checkpip install -r requirements.txt

```

```bash

GET http://localhost:5000/health4. Tạo file `.env` từ `.env.example`:

GET http://localhost:5000/api/health```bash

```cp .env.example .env

```

### Authentication

5. Chạy migrations:

```bash```bash

POST   /api/auth/login          # Đăng nhậpflask db init

POST   /api/auth/register       # Đăng kýflask db migrate -m "Initial migration"

POST   /api/auth/logout         # Đăng xuấtflask db upgrade

POST   /api/auth/refresh        # Refresh token```

GET    /api/auth/me             # User info

```6. Chạy ứng dụng:

```bash

### Librarypython run.py

```

```bash

GET    /api/library/marc-records           # Danh sách sáchAPI sẽ chạy tại `http://localhost:5000`

GET    /api/library/marc-records/:id       # Chi tiết sách

GET    /api/library/marc-records/search?q=...  # Tìm kiếm## API Endpoints

POST   /api/library/marc-records           # Tạo mới (Librarian+)

PUT    /api/library/marc-records/:id       # Cập nhật (Librarian+)- `GET /api/health` - Kiểm tra trạng thái server

DELETE /api/library/marc-records/:id       # Xóa (Admin)- `GET /api/users` - Lấy danh sách users

```- `POST /api/users` - Tạo user mới

- `GET /api/users/<id>` - Lấy thông tin user theo ID

---- `PUT /api/users/<id>` - Cập nhật user

- `DELETE /api/users/<id>` - Xóa user

## 🔐 Test Accounts

## Testing

| Email | Password | Role |

|-------|----------|------|Chạy tests:

| `sv001@ntt.edu.vn` | `Password123` | reader |```bash

| `sv002@ntt.edu.vn` | `Password123` | reader |pytest

| `librarian@ntt.edu.vn` | `Password123` | librarian |```

| `admin@ntt.edu.vn` | `Password123` | admin |

---

## 🛠️ Scripts

```bash
# Seed local database
python scripts/seed_library_data.py

# Seed cloud database
python scripts/seed_to_cloud.py

# Create MongoDB indexes
python scripts/init_mongodb_indexes.py

# Create test users
python scripts/create_users.py
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Configuration
│   ├── models/              # Data models
│   │   ├── mongodb_schemas.py
│   │   └── user.py
│   ├── routes/              # API routes
│   │   ├── auth.py          # Authentication
│   │   ├── api.py
│   │   └── library_routes.py
│   ├── services/            # Business logic
│   │   └── user_service.py
│   └── utils/               # Utilities
│       ├── mongo_helper.py
│       ├── validators.py
│       └── decorators.py
├── scripts/                 # Utility scripts
├── venv311/                 # Virtual environment (gitignored)
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── requirements.txt         # Python dependencies
└── run.py                   # Entry point
```

---

## 🐛 Troubleshooting

### Virtual environment không hoạt động

```bash
# Xóa và tạo lại
rm -rf venv311
python -m venv venv311

# Kích hoạt lại và cài dependencies
.\venv311\Scripts\Activate.ps1  # Windows
source venv311/bin/activate      # Linux/macOS
pip install -r requirements.txt
```

### MongoDB connection failed

```bash
# Check MongoDB đang chạy
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
```

### Import errors

```bash
# Đảm bảo venv đã activate
# Windows:
.\venv311\Scripts\Activate.ps1

# Linux/macOS:
source venv311/bin/activate

# Set FLASK_APP
# Windows:
$env:FLASK_APP="run.py"

# Linux/macOS:
export FLASK_APP=run.py
```

### Port 5000 đã được sử dụng

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

---

## 🧪 Testing

```bash
# Cài testing dependencies
pip install pytest pytest-flask pytest-cov

# Chạy tests
pytest

# Chạy với coverage
pytest --cov=app

# Chạy test cụ thể
pytest tests/test_api.py::test_login
```

---

## 🚀 Production Deployment

### 1. Cài production server

```bash
pip install gunicorn gevent
```

### 2. Chạy với Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### 3. Environment Variables

Đảm bảo set trong production:

```env
FLASK_ENV=production
DEBUG=False
SECRET_KEY=<secure-random-key>
JWT_SECRET_KEY=<secure-random-key>
USE_CLOUD_MONGODB=true
```

Generate secure keys:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 📝 License

MIT License

---

**Happy Coding! 🚀**

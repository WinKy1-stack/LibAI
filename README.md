# 📚 LibAI - Library Management System

> Hệ thống quản lý thư viện hiện đại Full-stack với React Frontend và Flask Backend, tích hợp MongoDB Cloud Atlas

## 🎯 Tổng quan dự án

LibAI là hệ thống quản lý thư viện hiện đại full-stack, cung cấp:

- **Frontend (React + TypeScript)**:
  - Giao diện người dùng thân thiện với dark theme
  - Admin Dashboard với quản lý sách, người dùng, và thống kê
  - User Interface để tìm kiếm và mượn sách
  - Responsive Design hoạt động mượt mà trên mọi thiết bị
  - Authentication với JWT (Login/Logout)

- **Backend (Flask)**:
  - RESTful API với Flask
  - MongoDB integration (Local + Cloud Atlas)
  - JWT Authentication & Authorization
  - Role-based Access Control (Reader, Librarian, Admin)
  - MARC21 catalog support

## 🎨 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing
- **Ant Design** - UI component library
- **Heroicons** - Icon library
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client

### Backend
- **Flask 3.1.2** - Python web framework
- **PyMongo 4.15.3** - MongoDB driver
- **Flask-JWT-Extended 4.7.1** - JWT authentication
- **Flask-CORS 6.0.1** - Cross-Origin Resource Sharing
- **bcrypt 5.0.0** - Password hashing
- **python-dotenv 1.1.1** - Environment variables

### Database
- **MongoDB 6.0+** - NoSQL database
  - **Cloud**: MongoDB Atlas (Shared across team)
  - **Local**: MongoDB Community Server (Development)

---

## 🚀 Quick Start

### 📋 Yêu cầu hệ thống

**Frontend:**
- **Node.js**: >= 18.0.0 (khuyến nghị LTS version)
- **npm**: >= 9.0.0

**Backend:**
- **Python**: 3.11.9 hoặc 3.11+ (khuyến nghị 3.11.9)
- **pip**: Python package manager

**Chung:**
- **Git**: >= 2.0.0

---

## ⚡ Hướng dẫn cài đặt

### 1️⃣ Clone Repository

```bash
git clone https://github.com/LockMan04/LibAI.git
cd LibAI
```

### 2️⃣ Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Frontend chạy tại: http://localhost:5173
```

**Scripts có sẵn:**
```bash
npm run dev      # Chạy dev server với hot reload
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Kiểm tra lỗi code
```

### 3️⃣ Cài đặt Backend

#### Windows (PowerShell)

```powershell
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment với Python 3.11
python -m venv venv311

# Kích hoạt virtual environment
.\venv311\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt

# Verify Python version
python --version
# Expected output: Python 3.11.9
```

#### Linux/macOS

```bash
cd backend

# Tạo virtual environment
python3.11 -m venv venv311

# Kích hoạt virtual environment
source venv311/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Verify Python version
python --version
# Expected output: Python 3.11.9
```

### 4️⃣ Cấu hình MongoDB

#### ⚡ Option A: MongoDB Cloud Atlas (Khuyến nghị cho Git Sharing)

**Ưu điểm**: Người khác clone về không cần cài MongoDB, chạy ngay được!

1. Tạo file `.env` trong thư mục `backend/`:

```bash
# Windows PowerShell
cd backend
Copy-Item .env.example .env

# Linux/macOS
cd backend
cp .env.example .env
```

2. Mở file `backend/.env` và cấu hình:

```env
# MongoDB Configuration
USE_CLOUD_MONGODB=true

# Cloud MongoDB (đã cấu hình sẵn)
MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0

# Local MongoDB
MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox

# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

✅ **Database cloud đã có 4 test users sẵn** (xem phần [Tài Khoản Test](#-tài-khoản-test))

#### 🏠 Option B: MongoDB Localhost (Development)

1. **Cài đặt MongoDB Community Server**:
   - **Windows**: [Download MongoDB](https://www.mongodb.com/try/download/community) → Install as Service
   - **Linux**: `sudo apt install mongodb-community`
   - **macOS**: `brew install mongodb-community`

2. **Khởi động MongoDB**:

   **Windows**:
   ```powershell
   net start MongoDB
   # Hoặc: mongod --dbpath C:\data\db
   ```

   **Linux/macOS**:
   ```bash
   sudo systemctl start mongod
   # Hoặc: brew services start mongodb-community
   ```

3. **Cấu hình** trong `backend/.env`:
   ```env
   USE_CLOUD_MONGODB=false
   ```

4. **Seed Database** (xem bước tiếp theo)

### 5️⃣ Seed Database (Chỉ cho Localhost)

⚠️ **Chỉ cần chạy nếu dùng MongoDB Localhost**. Cloud MongoDB đã có data sẵn.

```bash
cd backend

# Activate venv (nếu chưa activate)
.\venv311\Scripts\Activate.ps1  # Windows
# source venv311/bin/activate    # Linux/macOS

# Chạy seed script
python scripts/seed_library_data.py
```

**Output mong đợi**:
```
✅ Created 4 users
✅ Created 5 MARC records
✅ Created 10 items
✅ Created 6 loans
✅ Seeding completed successfully!
```

### 6️⃣ Chạy ứng dụng

#### Terminal 1 - Backend

```bash
cd backend
.\venv311\Scripts\Activate.ps1  # Windows
# source venv311/bin/activate    # Linux/macOS

python run.py
```

**Backend chạy tại**: http://localhost:5000

#### Terminal 2 - Frontend

```bash
npm run dev
```

**Frontend chạy tại**: http://localhost:5173

---

## 🔑 Tài khoản Test

Sau khi seed database (hoặc dùng Cloud MongoDB), dùng các tài khoản sau để đăng nhập:

| Email | Password | Role | Mô tả |
|-------|----------|------|-------|
| `sv001@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |
| `sv002@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |
| `librarian@ntt.edu.vn` | `Password123` | **librarian** | Thủ thư |
| `admin@ntt.edu.vn` | `Password123` | **admin** | Quản trị viên |

### Phân quyền

- **Reader**: Xem sách, mượn sách, xem profile
- **Librarian**: Toàn quyền Reader + Quản lý mượn/trả + Xem reports
- **Admin**: Toàn quyền + Quản lý users + Cấu hình hệ thống

### Đăng xuất

- **User Layout**: Nhấn nút "Đăng xuất" với icon ở header
- **Admin Layout**: Click avatar → "Đăng xuất"

---

## 📁 Cấu trúc Project

```
LibAI/
├── backend/                      # Flask Backend
│   ├── app/
│   │   ├── __init__.py          # App factory
│   │   ├── config.py            # Configuration (MongoDB switch)
│   │   ├── models/              # Data models
│   │   │   ├── mongodb_schemas.py  # MongoDB schemas
│   │   │   └── user.py          # User model
│   │   ├── routes/              # API routes
│   │   │   ├── auth.py          # Authentication (login/register/logout)
│   │   │   ├── api.py           # General API endpoints
│   │   │   └── library_routes.py  # Library APIs
│   │   ├── services/            # Business logic
│   │   │   └── user_service.py  # User service
│   │   └── utils/               # Helpers
│   │       ├── mongo_helper.py  # MongoDB utilities
│   │       ├── validators.py    # Input validation
│   │       └── decorators.py    # Custom decorators
│   ├── scripts/
│   │   ├── seed_library_data.py     # Seed local database
│   │   ├── seed_to_cloud.py         # Seed cloud database
│   │   ├── init_mongodb_indexes.py  # Create indexes
│   │   └── create_users.py          # Create test users
│   ├── venv311/                 # Python 3.11.9 venv (gitignored)
│   ├── .env                     # Environment variables (gitignored)
│   ├── .env.example             # Environment template
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Entry point
│
├── src/                         # React Frontend
│   ├── components/
│   │   ├── admin/               # Admin components
│   │   │   ├── layout/
│   │   │   │   └── TopBar.tsx   # TopBar với logout button
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   ├── bookManagement/  # Book management
│   │   │   └── userManagement/  # User management
│   │   └── user/                # User components
│   │       ├── UserLayout.tsx   # User layout với logout
│   │       └── auth/            # Login/Register
│   │           ├── LoginPage.tsx      # Login với 2 cột
│   │           └── RegisterPage.tsx   # Register với 2 cột
│   ├── pages/
│   │   ├── admin/               # Admin pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── BooksManagementPage.tsx
│   │   │   └── UserManagementPage.tsx
│   │   └── user/                # User pages
│   │       └── UserHomePage.tsx
│   ├── services/
│   │   ├── authService.ts       # Auth API client
│   │   └── userService.ts       # User API client
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts              # Auth types
│   │   └── index.ts             # Common types
│   ├── utils/
│   │   └── mongodb.ts           # MongoDB utilities
│   ├── config/
│   │   └── theme.ts             # Theme configuration
│   ├── App.tsx                  # Main routing (default to /login)
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── public/                      # Static assets
├── package.json                 # Node dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind config
└── README.md                    # This file
```

---

## 🗄️ Database Structure

### MongoDB Collections

#### Core Collections
- **users**: User accounts (email, password_hash, role, full_name)
- **marc_records**: Book catalog (MARC21 format)
- **items**: Physical book copies (barcode, location, status, marc_record_id)
- **loans**: Borrowing records (user_id, item_id, checkout_date, return_date, status)

#### Chatbot Collections (Future)
- **conversations**: Chat sessions
- **messages**: Chat messages with citations
- **faq**: Frequently asked questions

#### System Collections
- **admin_configs**: System settings

---

## 📊 API Endpoints

### Base URL
```
http://localhost:5000
```

### Health Check
```
GET /health                    → Server status
GET /api/health                → API status
```

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Đăng nhập | ❌ |
| POST | `/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/logout` | Đăng xuất (clear session) | ✅ |
| POST | `/refresh` | Refresh access token | ✅ Refresh token |
| GET | `/me` | Lấy thông tin user hiện tại | ✅ |

**Request Example - Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "sv001@ntt.edu.vn",
  "password": "Password123"
}
```

**Response Example:**
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

### Library (`/api/library`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/marc-records` | Danh sách MARC records | ✅ | All |
| GET | `/marc-records/:id` | Chi tiết MARC record | ✅ | All |
| GET | `/marc-records/search?q=...` | Tìm kiếm sách (text search) | ✅ | All |
| POST | `/marc-records` | Tạo MARC record mới | ✅ | Librarian+ |
| PUT | `/marc-records/:id` | Cập nhật MARC record | ✅ | Librarian+ |
| DELETE | `/marc-records/:id` | Xóa MARC record | ✅ | Admin |
| GET | `/items` | Danh sách items | ✅ | All |
| POST | `/items` | Tạo item mới | ✅ | Librarian+ |
| GET | `/loans` | Danh sách loans | ✅ | Librarian+ |
| POST | `/loans/checkout` | Mượn sách | ✅ | Librarian+ |
| POST | `/loans/return` | Trả sách | ✅ | Librarian+ |

---

## 🔐 Security

### Password Requirements
- Minimum 8 characters
- Must include: uppercase, lowercase, digit
- Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)`

### JWT Tokens
- **Access token**: 1 hour expiry
- **Refresh token**: 30 days expiry
- Stored in `localStorage`
- Cleared on logout

### Role-Based Access Control (RBAC)
- 3 roles: `reader`, `librarian`, `admin`
- Protected routes on frontend
- API endpoint authorization with decorators

---

## 🐛 Troubleshooting

### MongoDB connection failed

**Giải pháp**:
```bash
# Check MongoDB đang chạy
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB nếu chưa chạy
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
```

### Python version không đúng

**Giải pháp**:
```bash
# Activate venv311
cd backend
.\venv311\Scripts\Activate.ps1  # Windows
source venv311/bin/activate      # Linux/macOS

# Verify
python --version  # Should be 3.11.9
```

### Frontend không kết nối được Backend

**Giải pháp**:
- Check Backend đang chạy: http://localhost:5000
- Check CORS settings trong `backend/app/config.py`
- Clear browser cache

### Login failed

**Giải pháp**:
- **Cloud MongoDB**: Dùng test accounts ở trên (Password: `Password123`)
- **Localhost MongoDB**: Verify database đã seed:
  ```bash
  mongosh
  > use library_chatbox
  > db.users.find()
  ```
- Check password: `Password123`

### Logout không work

**Giải pháp**:
- Mở DevTools (F12) → Application → Local Storage
- Verify `access_token`, `refresh_token`, `user` đã được xóa sau logout
- Nếu vẫn còn, clear manual và refresh page

### Port đã được sử dụng

**Backend (Port 5000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 5173)**:
```bash
npx kill-port 5173
```

---

## 🌐 MongoDB Configuration Toggle

### Switch giữa Local và Cloud

**File**: `backend/.env`

```env
# Dùng Cloud MongoDB (khuyến nghị cho git sharing)
USE_CLOUD_MONGODB=true

# Dùng Localhost MongoDB (development)
USE_CLOUD_MONGODB=false
```

### Connection Strings

```env
# Local
MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox

# Cloud Atlas
MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0
```

---

## 📝 License

MIT License

---

## 👥 Contributors

- **LockMan04** - Initial work & MongoDB Cloud setup
- **nptb137** - MongoDB Atlas configuration

---

## 🆘 Support

Nếu gặp vấn đề:
1. Check [Troubleshooting](#-troubleshooting) section
2. Verify tất cả dependencies đã cài đúng
3. Check MongoDB connection (Cloud hoặc Local)
4. Verify Python version = 3.11.9
5. Test logout functionality (clear tokens)

---

**Happy Coding! 📚✨**



## 🎯 Tính Năng ChínhHệ thống quản lý thư viện hiện đại với AI chatbot hỗ trợ tra cứu sách, tích hợp MARC21, Z39.50, OAI-PMH, và SIP2.> Hệ thống quản lý thư viện hiện đại Full-stack với React Frontend và Flask Backend



### 👥 Quản Lý Người Dùng

- **Đăng ký/Đăng nhập** với JWT authentication

- **Đăng xuất** an toàn (clear tokens)## 🎯 Tính Năng Chính## 🎯 Tổng quan dự án

- **3 vai trò**: Reader (Sinh viên), Librarian (Thủ thư), Admin (Quản trị viên)

- **Profile management**: Cập nhật thông tin cá nhân



### 📖 Quản Lý Sách### 👥 Quản Lý Người DùngLibAI là hệ thống quản lý thư viện hiện đại full-stack, cung cấp:

- **MARC21 catalog**: Mô tả thư mục chuẩn quốc tế

- **Quản lý item**: Sách vật lý với barcode, location, status- **Đăng ký/Đăng nhập** với JWT authentication- **Frontend (React + TypeScript)**:

- **Mượn/Trả sách**: Tích hợp SIP2 protocol

- **Tìm kiếm full-text**: MongoDB text search trên title, author, subject- **3 vai trò**: Reader (Sinh viên), Librarian (Thủ thư), Admin (Quản trị viên)  - Giao diện người dùng thân thiện để tìm kiếm và mượn sách



### 🤖 AI Chatbot- **Profile management**: Cập nhật thông tin cá nhân  - Admin Dashboard với quản lý sách, người dùng, và thống kê

- **Tra cứu sách** thông minh với natural language

- **FAQ hỏi đáp** về quy định thư viện  - Responsive Design hoạt động mượt mà trên mobile, tablet và desktop

- **Citations**: Trích dẫn từ MARC records và documents

- **Conversation history**: Lịch sử chat được lưu trữ### 📖 Quản Lý Sách  - Dark/Light Mode



### 📊 Dashboard & Reports- **MARC21 catalog**: Mô tả thư mục chuẩn quốc tế- **Backend (Flask)**:

- **Admin Dashboard**: Thống kê users, books, loans

- **Reports**: Báo cáo sách quá hạn, top borrowed books- **Quản lý item**: Sách vật lý với barcode, location, status  - RESTful API với Flask

- **Metrics**: LLM cost, latency tracking

- **Mượn/Trả sách**: Tích hợp SIP2 protocol  - SQLAlchemy ORM cho database

### 🔗 Tích Hợp Ngoài

- **Z39.50**: Tra cứu thư viện từ xa- **Tìm kiếm full-text**: MongoDB text search trên title, author, subject  - JWT Authentication

- **OAI-PMH**: Thu thập metadata

- **SIP2**: Checkout/checkin tự động  - Database migrations với Flask-Migrate



---### 🤖 AI Chatbot



## 🚀 Quick Start- **Tra cứu sách** thông minh với natural language## 🚀 Quick Start



### 📋 Yêu Cầu Hệ Thống- **FAQ hỏi đáp** về quy định thư viện



- **Python 3.11.9** (hoặc 3.11+)- **Citations**: Trích dẫn từ MARC records và documents### 📋 Yêu cầu

- **Node.js 18+** và npm

- **MongoDB** (Localhost HOẶC Cloud Atlas - xem bên dưới)- **Conversation history**: Lịch sử chat được lưu trữ

- **Git**

**Frontend:**

### 1️⃣ Clone Repository

### 📊 Dashboard & Reports- **Node.js**: >= 18.0.0 (khuyến nghị LTS)

```bash

git clone https://github.com/LockMan04/LibAI.git- **Admin Dashboard**: Thống kê users, books, loans- **npm**: >= 9.0.0

cd LibAI

```- **Reports**: Báo cáo sách quá hạn, top borrowed books



### 2️⃣ Cài Đặt Backend- **Metrics**: LLM cost, latency tracking**Backend:**



#### Windows (PowerShell)- **Python**: >= 3.8.0



```powershell### 🔗 Tích Hợp Ngoài- **pip**: Python package manager

# Tạo virtual environment với Python 3.11

cd backend- **Z39.50**: Tra cứu thư viện từ xa

py -3.11 -m venv venv311

- **OAI-PMH**: Thu thập metadata**Chung:**

# Activate venv

.\venv311\Scripts\Activate.ps1- **SIP2**: Checkout/checkin tự động- **Git**: >= 2.0.0



# Cài dependencies

pip install Flask Flask-PyMongo Flask-JWT-Extended Flask-CORS python-dotenv pymongo bcrypt werkzeug

---### ⚡ Cài đặt

# Verify Python version

python --version

# Should output: Python 3.11.9

```## 🚀 Quick Start#### 1️⃣ Frontend Setup



#### Linux/macOS



```bash### 📋 Yêu Cầu Hệ Thống```bash

cd backend

# Clone repository

# Tạo virtual environment

python3.11 -m venv venv311- **Python 3.11.9** (hoặc 3.11+)git clone https://github.com/LockMan04/LibAI.git



# Activate venv- **Node.js 18+** và npmcd lib-ai

source venv311/bin/activate

- **MongoDB 6.0+** đang chạy trên `localhost:27017`

# Cài dependencies

pip install Flask Flask-PyMongo Flask-JWT-Extended Flask-CORS python-dotenv pymongo bcrypt werkzeug- **Git**# Cài đặt dependencies

```

npm install

### 3️⃣ Cài Đặt Frontend

### 1️⃣ Clone Repository

```bash

# Quay về thư mục gốc# Chạy development server

cd ..

```bashnpm run dev

# Cài packages

npm installgit clone https://github.com/LockMan04/LibAI.git

```

cd LibAI# Frontend chạy tại: http://localhost:5173

### 4️⃣ Cấu Hình MongoDB

``````

Bạn có 2 lựa chọn:



#### ⚡ Option A: MongoDB Cloud Atlas (Khuyến nghị cho Git Sharing)

### 2️⃣ Cài Đặt Backend#### 2️⃣ Backend Setup

**Ưu điểm**: Người khác clone về không cần cài MongoDB, chạy ngay được!



**Cấu hình** trong `backend/.env`:

```env#### Windows (PowerShell)```bash

USE_CLOUD_MONGODB=true

```# Di chuyển vào thư mục backend



✅ **Connection string đã được config sẵn**:```powershellcd backend

```

mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox# Tạo virtual environment với Python 3.11

```

cd backend# Tạo virtual environment

⚠️ **Lưu ý**: Database cloud đã có 4 test users sẵn (xem phần [Tài Khoản Test](#-tài-khoản-test))

py -3.11 -m venv venv311python -m venv venv

#### 🏠 Option B: MongoDB Localhost (Default)



**Cấu hình** trong `backend/.env`:

```env# Activate venv# Kích hoạt virtual environment

USE_CLOUD_MONGODB=false

```.\venv311\Scripts\Activate.ps1# Windows:



**Khởi động MongoDB**:venv\Scripts\activate



**Windows**:# Cài dependencies# Linux/Mac:

```powershell

net start MongoDBpip install Flask Flask-PyMongo Flask-JWT-Extended Flask-CORS python-dotenv pymongo bcrypt werkzeugsource venv/bin/activate

# Hoặc: mongod --dbpath C:\data\db

```



**Linux/macOS**:# Verify Python version# Cài đặt dependencies

```bash

sudo systemctl start mongodpython --versionpip install -r requirements.txt

# Hoặc: brew services start mongodb-community

```# Should output: Python 3.11.9



**Sau đó chạy seed script** (xem bước tiếp theo)```# Tạo file .env từ .env.example



### 5️⃣ Seed Database (Chỉ cho Localhost)cp .env.example .env



⚠️ **Chỉ cần chạy nếu dùng MongoDB Localhost**. Cloud MongoDB đã có data sẵn.#### Linux/macOS



```bash# Chạy migrations

cd backend

```bashflask db init

# Activate venv (nếu chưa activate)

.\venv311\Scripts\Activate.ps1  # Windowscd backendflask db migrate -m "Initial migration"

# source venv311/bin/activate    # Linux/macOS

flask db upgrade

# Chạy seed script

python scripts/seed_library_data.py# Tạo virtual environment

```

python3.11 -m venv venv311# Chạy backend server

**Output mong đợi**:

```python run.py

✅ Created 4 users

✅ Created 5 MARC records# Activate venv

✅ Created 10 items

✅ Created 6 loanssource venv311/bin/activate# Backend API chạy tại: http://localhost:5000

✅ Seeding completed successfully!

``````



### 6️⃣ Chạy Ứng Dụng# Cài dependencies



#### Terminal 1 - Backendpip install Flask Flask-PyMongo Flask-JWT-Extended Flask-CORS python-dotenv pymongo bcrypt werkzeug### 🛠️ Scripts hữu ích

```bash

cd backend```

.\venv311\Scripts\Activate.ps1  # Windows

# source venv311/bin/activate    # Linux/macOS**Frontend:**



python run.py### 3️⃣ Cài Đặt Frontend```bash

```

npm run dev      # Chạy dev server với hot reload

**Backend chạy tại**: http://localhost:5000

```bashnpm run build    # Build production

#### Terminal 2 - Frontend

```bash# Quay về thư mục gốcnpm run preview  # Preview production build

npm run dev

```cd ..npm run lint     # Kiểm tra lỗi code



**Frontend chạy tại**: http://localhost:5173 (hoặc 5174)```



---# Cài packages



## 🔑 Tài Khoản Testnpm install**Backend:**



Sau khi seed database (hoặc dùng Cloud MongoDB), dùng các tài khoản sau để đăng nhập:``````bash



| Email | Password | Role | Mô tả |python run.py              # Chạy Flask server

|-------|----------|------|-------|

| `sv001@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |### 4️⃣ Khởi Động MongoDBflask db migrate           # Tạo migration mới

| `sv002@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |

| `librarian@ntt.edu.vn` | `Password123` | **librarian** | Thủ thư |flask db upgrade           # Apply migrations

| `admin@ntt.edu.vn` | `Password123` | **admin** | Quản trị viên |

#### Windowsflask db downgrade         # Rollback migrations

### Phân Quyền

```powershellpytest                     # Chạy tests

- **Reader**: Xem sách, mượn sách, chat với AI

- **Librarian**: Toàn quyền reader + Quản lý mượn/trả + Xem reports# Nếu đã cài MongoDB service```

- **Admin**: Toàn quyền + Quản lý users + Cấu hình hệ thống

net start MongoDB

### 🚪 Đăng Xuất

### 🚀 Chạy Full-Stack Development

- **User Layout**: Nhấn nút "Đăng xuất" ở header

- **Admin Layout**: Click avatar → "Đăng xuất"# Hoặc chạy manual



---mongod --dbpath C:\data\dbĐể phát triển full-stack, bạn cần chạy cả frontend và backend cùng lúc:



## 📁 Cấu Trúc Project```



```**Terminal 1 - Backend:**

LibAI/

├── backend/                      # Flask Backend#### Linux/macOS```bash

│   ├── app/

│   │   ├── __init__.py          # App factory```bashcd backend

│   │   ├── config.py            # Configuration (MongoDB switch)

│   │   ├── models/              # Data models# Start MongoDB servicevenv\Scripts\activate  # Windows

│   │   │   └── mongodb_schemas.py  # MongoDB schemas

│   │   ├── routes/              # API routessudo systemctl start mongodpython run.py

│   │   │   ├── auth.py          # Authentication (login/register/logout)

│   │   │   └── library_routes.py  # Library APIs# Backend: http://localhost:5000

│   │   ├── services/            # Business logic

│   │   └── utils/               # Helpers# Hoặc```

│   │       ├── mongo_helper.py  # MongoDB utilities

│   │       └── validators.py    # Input validationbrew services start mongodb-community

│   ├── scripts/

│   │   ├── seed_library_data.py  # Seed sample data```**Terminal 2 - Frontend:**

│   │   └── init_mongodb_indexes.py  # Create indexes

│   ├── venv311/                 # Python 3.11.9 venv```bash

│   ├── .env                     # Environment variables (USE_CLOUD_MONGODB)

│   └── run.py                   # Entry point### 5️⃣ Seed Database (Lần đầu tiên)npm run dev

│

├── src/                         # React Frontend# Frontend: http://localhost:5173

│   ├── components/

│   │   ├── admin/               # Admin components```bash```

│   │   │   └── layout/

│   │   │       └── TopBar.tsx   # TopBar với logout buttoncd backend

│   │   └── user/                # User components

│   │       ├── UserLayout.tsx   # User layout với logout**Kiểm tra kết nối:**

│   │       └── auth/            # Login/Register

│   │           ├── LoginPage.tsx# Activate venv (nếu chưa activate)1. Mở browser và truy cập `http://localhost:5173` (Frontend)

│   │           └── RegisterPage.tsx

│   ├── pages/.\venv311\Scripts\Activate.ps1  # Windows2. Kiểm tra backend health: `http://localhost:5000/health`

│   │   ├── admin/               # Admin pages

│   │   └── user/                # User pages# source venv311/bin/activate    # Linux/macOS3. Test API endpoint: `http://localhost:5000/api/users`

│   ├── services/

│   │   └── authService.ts       # API client (login/logout)

│   ├── types/                   # TypeScript types

│   └── App.tsx                  # Main routing# Chạy seed script**Tip:** Sử dụng `tmux`, `screen`, hoặc VS Code integrated terminal để quản lý nhiều terminal cùng lúc.

│

├── package.json                 # Frontend dependenciespython scripts/seed_library_data.py

├── vite.config.ts               # Vite config

└── README.md                    # This file```## 🏗️ Cấu trúc dự án

```



---

**Output mong đợi**:```

## 🗄️ Database Structure

```lib-ai/

### MongoDB Collections (15 collections)

✅ Created 4 users├── src/                         # Frontend Source Code

#### Core Collections

- **users**: User accounts (email, password_hash, role)✅ Created 5 MARC records│   ├── pages/                   # Pages (route components)

- **marc_records**: Book catalog (MARC21 format)

- **items**: Physical book copies (barcode, location, status)✅ Created 10 items│   │   └── admin/               # Admin pages

- **loans**: Borrowing records (checkout, return, overdue)

✅ Created 6 loans│   │       └── DashboardPage.tsx

#### Chatbot Collections

- **conversations**: Chat sessions✅ Seeding completed successfully!│   │

- **messages**: Chat messages with citations

- **faq**: Frequently asked questions```│   ├── components/              # Reusable components

- **documents**: Knowledge base documents

│   │   ├── admin/               # Admin components

#### System Collections

- **admin_configs**: System settings### 6️⃣ Chạy Ứng Dụng│   │   │   ├── layout/          # Layout components

- **metrics**: Analytics (LLM cost, latency)

- **recommend_events**: Recommendation tracking│   │   │   ├── dashboard/       # Dashboard components



#### Integration Collections#### Terminal 1 - Backend│   │   │   └── color.css        # Color configuration

- **z3950_cache**: Z39.50 query cache

- **oai_records**: OAI-PMH harvested records```bash│   │   └── user/                # User-facing components

- **sip2_events**: SIP2 transaction logs

- **auth_sessions**: JWT session tracking (TTL)cd backend│   │



---.\venv311\Scripts\Activate.ps1  # Windows│   ├── services/                # API services



## 🧪 Testing# source venv311/bin/activate    # Linux/macOS│   ├── utils/                   # Utility functions



### Test Backend APIs│   ├── types/                   # TypeScript types



```powershellpython run.py│   ├── config/                  # Configuration files

# Login test (PowerShell)

$body = @{username='sv001@ntt.edu.vn'; password='Password123'} | ConvertTo-Json```│   │   └── theme.ts             # Theme configuration

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType 'application/json'

│   │

# Get MARC records

Invoke-WebRequest -Uri http://localhost:5000/api/library/marc-records**Backend chạy tại**: http://localhost:5000│   ├── App.tsx                  # Main app with routing



# Search books│   ├── main.tsx                 # Entry point

Invoke-WebRequest -Uri "http://localhost:5000/api/library/marc-records/search?q=machine+learning"

```#### Terminal 2 - Frontend│   └── index.css                # Global styles



### Test Frontend```bash│



1. Mở http://localhost:5173/loginnpm run dev├── backend/                     # Backend Source Code

2. Đăng nhập với `sv001@ntt.edu.vn` / `Password123`

3. Redirect đến `/user/home````│   ├── app/                     # Flask application

4. Test logout button ở header

5. Verify redirect về `/login` và localStorage đã clear│   │   ├── models/              # Database models



---**Frontend chạy tại**: http://localhost:5173 (hoặc 5174)│   │   │   ├── __init__.py



## 📊 API Endpoints│   │   │   └── user.py          # User model



### Authentication (`/api/auth`)---│   │   │



| Method | Endpoint | Description | Auth Required |│   │   ├── routes/              # API routes/endpoints

|--------|----------|-------------|---------------|

| POST | `/register` | Đăng ký tài khoản mới | ❌ |## 🔑 Tài Khoản Test│   │   │   ├── __init__.py

| POST | `/login` | Đăng nhập | ❌ |

| POST | `/logout` | Đăng xuất (clear session) | ✅ |│   │   │   └── api.py           # API endpoints

| POST | `/refresh` | Refresh access token | ✅ Refresh token |

| GET | `/me` | Lấy thông tin user hiện tại | ✅ |Sau khi seed database, dùng các tài khoản sau để đăng nhập:│   │   │

| POST | `/change-password` | Đổi mật khẩu | ✅ |

│   │   ├── services/            # Business logic

### Library (`/api/library`)

| Email | Password | Role | Mô tả |│   │   │   ├── __init__.py

| Method | Endpoint | Description | Auth | Role |

|--------|----------|-------------|------|------||-------|----------|------|-------|│   │   │   └── user_service.py  # User service

| GET | `/marc-records` | Danh sách MARC records | ✅ | All |

| GET | `/marc-records/:id` | Chi tiết MARC record | ✅ | All || `sv001@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |│   │   │

| GET | `/marc-records/search` | Tìm kiếm sách (text search) | ✅ | All |

| POST | `/marc-records` | Tạo MARC record mới | ✅ | Librarian+ || `sv002@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |│   │   ├── utils/               # Utility functions

| PUT | `/marc-records/:id` | Cập nhật MARC record | ✅ | Librarian+ |

| DELETE | `/marc-records/:id` | Xóa MARC record | ✅ | Admin || `librarian@ntt.edu.vn` | `Password123` | **librarian** | Thủ thư |│   │   │   ├── __init__.py

| GET | `/items` | Danh sách items | ✅ | All |

| POST | `/items` | Tạo item mới | ✅ | Librarian+ || `admin@ntt.edu.vn` | `Password123` | **admin** | Quản trị viên |│   │   │   └── validators.py    # Data validators

| PUT | `/items/:id` | Cập nhật item | ✅ | Librarian+ |

| GET | `/loans` | Danh sách loans | ✅ | Librarian+ |│   │   │

| POST | `/loans/checkout` | Mượn sách | ✅ | Librarian+ |

| POST | `/loans/return` | Trả sách | ✅ | Librarian+ |### Phân Quyền│   │   ├── __init__.py          # App factory

| POST | `/loans/renew` | Gia hạn | ✅ | All |

│   │   └── config.py            # Configuration

---

- **Reader**: Xem sách, mượn sách, chat với AI│   │

## 🐛 Troubleshooting

- **Librarian**: Toàn quyền reader + Quản lý mượn/trả + Xem reports│   ├── migrations/              # Database migrations

### Issue: MongoDB connection failed (Localhost)

- **Admin**: Toàn quyền + Quản lý users + Cấu hình hệ thống│   ├── tests/                   # Unit tests

**Giải pháp**:

```bash│   │   ├── __init__.py

# Check MongoDB đang chạy

mongosh --eval "db.adminCommand('ping')"---│   │   └── test_api.py          # API tests



# Start MongoDB nếu chưa chạy│   │

net start MongoDB  # Windows

sudo systemctl start mongod  # Linux## 📁 Cấu Trúc Project│   ├── venv/                    # Virtual environment (gitignored)

```

│   ├── .env                     # Environment variables (gitignored)

### Issue: MongoDB Cloud connection timeout

```│   ├── .env.example             # Environment template

**Giải pháp**:

- Check internet connectionLibAI/│   ├── .gitignore               # Python gitignore

- Verify `.env` có `USE_CLOUD_MONGODB=true`

- Kiểm tra firewall/antivirus chặn port 27017├── backend/                      # Flask Backend│   ├── requirements.txt         # Python dependencies



### Issue: Python version không đúng│   ├── app/│   ├── run.py                   # Application entry point



**Giải pháp**:│   │   ├── __init__.py          # App factory│   └── README.md                # Backend documentation

```bash

# Activate venv311│   │   ├── config.py            # Configuration│

cd backend

.\venv311\Scripts\Activate.ps1  # Windows│   │   ├── models/              # Data models├── public/                      # Static assets

source venv311/bin/activate      # Linux/macOS

│   │   │   └── mongodb_schemas.py  # MongoDB schemas├── package.json                 # Node dependencies

# Verify

python --version  # Should be 3.11.9│   │   ├── routes/              # API routes├── tsconfig.json                # TypeScript config

```

│   │   │   ├── auth.py          # Authentication (MongoDB)├── vite.config.ts               # Vite config

### Issue: Frontend không kết nối được Backend

│   │   │   └── library_routes.py  # Library APIs└── README.md                    # This file

**Giải pháp**:

- Check Backend đang chạy: http://localhost:5000│   │   ├── services/            # Business logic```

- Check CORS settings trong `backend/app/config.py`

- Clear browser cache│   │   └── utils/               # Helpers



### Issue: Login failed│   │       ├── mongo_helper.py  # MongoDB utilities## 🎨 Tech Stack



**Giải pháp**:│   │       └── validators.py    # Input validation

- **Cloud MongoDB**: Dùng test accounts ở trên (Password: `Password123`)

- **Localhost MongoDB**: Verify database đã seed: │   ├── scripts/### Frontend

  ```bash

  mongosh│   │   ├── seed_library_data.py  # Seed sample data

  > use library_chatbox

  > db.users.find()│   │   └── init_mongodb_indexes.py  # Create indexes**Core:**

  ```

- Check password: `Password123`│   ├── venv311/                 # Python 3.11.9 venv- **React 19** - UI framework



### Issue: Logout không work│   └── run.py                   # Entry point- **TypeScript** - Type safety



**Giải pháp**:│- **Vite** - Build tool & dev server

- Mở DevTools (F12) → Application → Local Storage

- Verify `access_token`, `refresh_token`, `user` đã được xóa sau logout├── src/                         # React Frontend- **React Router DOM** - Client-side routing

- Nếu vẫn còn, clear manual và refresh page

│   ├── components/

---

│   │   ├── admin/               # Admin components**UI Libraries:**

## 📚 Technology Stack

│   │   └── user/                # User components- **Ant Design** - Admin dashboard components

### Backend

- **Flask 3.1.2** - Web framework│   │       └── auth/            # Login/Register  - `antd` - Core components

- **MongoDB 6.0+** - NoSQL database (Cloud Atlas hoặc Localhost)

- **PyMongo 4.15.3** - MongoDB driver│   │           ├── LoginPage.tsx  - `@ant-design/icons` - Icon library

- **Flask-JWT-Extended 4.7.1** - JWT authentication

- **bcrypt 5.0.0** - Password hashing│   │           ├── RegisterPage.tsx- **Tailwind CSS** - Utility-first CSS framework



### Frontend│   │           └── ProtectedRoute.tsx- **Heroicons** - Icon library cho user interface

- **React 18** - UI framework

- **TypeScript** - Type safety│   ├── pages/

- **Vite 7** - Build tool

- **React Router 6** - Routing│   │   ├── admin/               # Admin pages**Code Quality:**

- **Ant Design** - UI components

- **Axios** - HTTP client│   │   └── user/                # User pages- **ESLint** - Linting

- **Heroicons** - Icon library

│   ├── services/- **TypeScript ESLint** - TypeScript-specific linting

### Database

- **MongoDB** - Primary database│   │   └── authService.ts       # API client

  - **Cloud**: MongoDB Atlas (mongodb+srv://)

  - **Local**: MongoDB Community Server│   ├── types/                   # TypeScript types### Backend

  - 15 collections

  - ~50 indexes (text search, unique, TTL)│   └── App.tsx                  # Main routing

  - MARC21 schema support

│**Framework:**

---

├── package.json                 # Frontend dependencies- **Flask 3.0** - Lightweight Python web framework

## 🔐 Security

├── vite.config.ts               # Vite config- **Flask-SQLAlchemy** - ORM cho database

### Password Requirements

- Minimum 8 characters└── README.md                    # This file- **Flask-Migrate** - Database migrations

- Must include: uppercase, lowercase, digit

```- **Flask-CORS** - Cross-Origin Resource Sharing

### JWT Tokens

- Access token: 1 hour expiry

- Refresh token: 30 days expiry

- Stored in localStorage---**Authentication & Security:**

- Cleared on logout

- **PyJWT** - JSON Web Tokens

### Role-Based Access Control (RBAC)

- 3 roles: reader, librarian, admin## 🗄️ Database Structure- **bcrypt** - Password hashing

- Protected routes on frontend

- API endpoint authorization



---### MongoDB Collections (15 collections)**Database:**



## 🌐 MongoDB Configuration- **SQLite** - Development database (có thể chuyển sang PostgreSQL/MySQL cho production)



### Switch giữa Local và Cloud#### Core Collections- **SQLAlchemy ORM** - Object-Relational Mapping



**File**: `backend/.env`- **users**: User accounts (email, password_hash, role)



```env- **marc_records**: Book catalog (MARC21 format)**Validation & Serialization:**

# Dùng Cloud MongoDB (khuyến nghị cho git sharing)

USE_CLOUD_MONGODB=true- **items**: Physical book copies (barcode, location, status)- **Marshmallow** - Object serialization/deserialization



# Dùng Localhost MongoDB (development)- **loans**: Borrowing records (checkout, return, overdue)

USE_CLOUD_MONGODB=false

```**Testing:**



### Connection Strings#### Chatbot Collections- **pytest** - Testing framework



```env- **conversations**: Chat sessions

# Local

MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox- **messages**: Chat messages with citations**Environment:**



# Cloud Atlas- **faq**: Frequently asked questions- **python-dotenv** - Environment variables management

MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0

```- **documents**: Knowledge base documents



---## 📍 Routing & API Endpoints



## 📝 License#### System Collections



MIT License- **admin_configs**: System settings### Frontend Routes



---- **metrics**: Analytics (LLM cost, latency)



## 👥 Contributors- **recommend_events**: Recommendation tracking```tsx



- **LockMan04** - Initial work & MongoDB Cloud setup/              → User Interface (UserLayoutTailwind)

- **nptb137** - MongoDB Atlas configuration

#### Integration Collections/admin         → Admin Dashboard (DashboardPage)

---

- **z3950_cache**: Z39.50 query cache```

## 🆘 Support

- **oai_records**: OAI-PMH harvested records

Nếu gặp vấn đề:

1. Check [Troubleshooting](#-troubleshooting) section- **sip2_events**: SIP2 transaction logs### Backend API Endpoints

2. Verify tất cả dependencies đã cài đúng

3. Check MongoDB connection (Cloud hoặc Local)- **auth_sessions**: JWT session tracking (TTL)

4. Verify Python version = 3.11.9

5. Test logout functionality (clear tokens)**Base URL:** `http://localhost:5000`



------



**Happy Coding! 📚✨****Health Check:**


## 🧪 Testing```

GET /health                    → Kiểm tra trạng thái server

### Test Backend APIsGET /api/health                → Kiểm tra trạng thái API

```

```bash

# Login test (PowerShell)**User Management:**

$body = @{username='sv001@ntt.edu.vn'; password='Password123'} | ConvertTo-Json```

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType 'application/json'GET    /api/users              → Lấy danh sách users

GET    /api/users/<id>         → Lấy thông tin user theo ID

# Get MARC recordsPOST   /api/users              → Tạo user mới

Invoke-WebRequest -Uri http://localhost:5000/api/library/marc-recordsPUT    /api/users/<id>         → Cập nhật thông tin user

DELETE /api/users/<id>         → Xóa user

# Search books```

Invoke-WebRequest -Uri "http://localhost:5000/api/library/marc-records/search?q=machine+learning"

```**Request/Response Examples:**



### Test FrontendTạo user mới:

```bash

1. Mở http://localhost:5173/loginPOST /api/users

2. Đăng nhập với `sv001@ntt.edu.vn` / `Password123`Content-Type: application/json

3. Redirect đến `/user/home`

4. Test các chức năng: search, borrow, chat{

  "username": "john_doe",

---  "email": "john@example.com",

  "password": "securepass123",

## 📊 API Endpoints  "full_name": "John Doe"

}

### Authentication (`/api/auth`)```



| Method | Endpoint | Description | Auth Required |Response:

|--------|----------|-------------|---------------|```json

| POST | `/register` | Đăng ký tài khoản mới | ❌ |{

| POST | `/login` | Đăng nhập | ❌ |  "success": true,

| POST | `/refresh` | Refresh access token | ✅ Refresh token |  "message": "Tạo user thành công",

| GET | `/me` | Lấy thông tin user hiện tại | ✅ |  "data": {

| POST | `/change-password` | Đổi mật khẩu | ✅ |    "id": 1,

| POST | `/logout` | Đăng xuất | ✅ |    "username": "john_doe",

    "email": "john@example.com",

### Library (`/api/library`)    "full_name": "John Doe",

    "is_active": true,

| Method | Endpoint | Description | Auth | Role |    "created_at": "2025-10-25T00:00:00",

|--------|----------|-------------|------|------|    "updated_at": "2025-10-25T00:00:00"

| GET | `/marc-records` | Danh sách MARC records | ✅ | All |  }

| GET | `/marc-records/:id` | Chi tiết MARC record | ✅ | All |}

| GET | `/marc-records/search` | Tìm kiếm sách (text search) | ✅ | All |```

| POST | `/marc-records` | Tạo MARC record mới | ✅ | Librarian+ |

| PUT | `/marc-records/:id` | Cập nhật MARC record | ✅ | Librarian+ |## ✨ Backend Features

| DELETE | `/marc-records/:id` | Xóa MARC record | ✅ | Admin |

| GET | `/items` | Danh sách items | ✅ | All |### Đã triển khai:

| POST | `/items` | Tạo item mới | ✅ | Librarian+ |- ✅ RESTful API với Flask

| PUT | `/items/:id` | Cập nhật item | ✅ | Librarian+ |- ✅ SQLAlchemy ORM

| GET | `/loans` | Danh sách loans | ✅ | Librarian+ |- ✅ Database migrations (Flask-Migrate)

| POST | `/loans/checkout` | Mượn sách | ✅ | Librarian+ |- ✅ Password hashing với bcrypt

| POST | `/loans/return` | Trả sách | ✅ | Librarian+ |- ✅ Data validation

| POST | `/loans/renew` | Gia hạn | ✅ | All |- ✅ CORS support

- ✅ Application Factory Pattern

---- ✅ Blueprint structure

- ✅ Service layer architecture

## 🐛 Troubleshooting- ✅ Unit tests với pytest



### Issue: MongoDB connection failed### Cấu hình môi trường:

Backend hỗ trợ 3 môi trường:

**Giải pháp**:- **Development** - Debug mode, SQLite database

```bash- **Production** - Optimized, có thể dùng PostgreSQL/MySQL

# Check MongoDB đang chạy- **Testing** - Isolated test database

mongosh --eval "db.adminCommand('ping')"

### Bảo mật:

# Start MongoDB nếu chưa chạy- Password được hash bằng bcrypt trước khi lưu database

net start MongoDB  # Windows- Chuẩn bị sẵn JWT authentication (cần tích hợp)

sudo systemctl start mongod  # Linux- Input validation cho tất cả endpoints

```- Environment variables cho sensitive data



### Issue: Python version không đúng### Testing:

```bash

**Giải pháp**:# Chạy tất cả tests

```bashpytest

# Activate venv311

cd backend# Chạy với coverage report

.\venv311\Scripts\Activate.ps1  # Windowspytest --cov=app

source venv311/bin/activate      # Linux/macOS

# Chạy test cụ thể

# Verifypytest tests/test_api.py::test_create_user

python --version  # Should be 3.11.9```

```

## 🎨 Customization

### Issue: Frontend không kết nối được Backend

### Thay đổi màu sắc Admin Dashboard

**Giải pháp**:

- Check Backend đang chạy: http://localhost:5000Edit `src/components/admin/color.css`:

- Check CORS settings trong `backend/app/config.py`

- Clear browser cache```css

:root {

### Issue: Login failed  --primary: #ff4757;           /* Màu chủ đạo */

  --success: #52c41a;           /* Màu success */

**Giải pháp**:  --warning: #faad14;           /* Màu warning */

- Verify database đã seed: `mongosh` → `use library_chatbox` → `db.users.find()`  --error: #ff4d4f;             /* Màu error */

- Check password: `Password123`  --radius: 12;                 /* Border radius (px) */

- Check MongoDB connection  --stat-icon-bg: #ffe5e8;      /* Background icon stat cards */

}

---```



## 📚 Technology Stack### Dark Mode



### BackendToggle dark/light mode qua switch ở TopBar. Theme tự động thay đổi theo data-theme attribute.

- **Flask 3.1.2** - Web framework

- **MongoDB 6.0+** - NoSQL database## 🔗 Tích hợp Frontend & Backend

- **PyMongo 4.15.3** - MongoDB driver

- **Flask-JWT-Extended 4.7.1** - JWT authentication### Cấu hình API URL trong Frontend

- **bcrypt 5.0.0** - Password hashing

Tạo file `src/config/api.ts`:

### Frontend

- **React 18** - UI framework```typescript

- **TypeScript** - Type safetyconst API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

- **Vite 7** - Build tool

- **React Router 6** - Routingexport const API_ENDPOINTS = {

- **Ant Design** - UI components  baseURL: API_BASE_URL,

- **Axios** - HTTP client  users: {

    list: `${API_BASE_URL}/api/users`,

### Database    detail: (id: number) => `${API_BASE_URL}/api/users/${id}`,

- **MongoDB** - Primary database    create: `${API_BASE_URL}/api/users`,

  - 15 collections    update: (id: number) => `${API_BASE_URL}/api/users/${id}`,

  - ~50 indexes (text search, unique, TTL)    delete: (id: number) => `${API_BASE_URL}/api/users/${id}`,

  - MARC21 schema support  },

  health: `${API_BASE_URL}/api/health`,

---};

```

## 🔐 Security

### Tạo API Service trong Frontend

### Password Requirements

- Minimum 8 charactersTạo file `src/services/userService.ts`:

- Must include: uppercase, lowercase, digit

```typescript

### JWT Tokensimport { API_ENDPOINTS } from '@/config/api';

- Access token: 1 hour expiry

- Refresh token: 30 days expiryinterface CreateUserData {

- Stored in localStorage  username: string;

  email: string;

### Role-Based Access Control (RBAC)  password: string;

- 3 roles: reader, librarian, admin  full_name?: string;

- Protected routes on frontend}

- API endpoint authorization

export const userService = {

---  async getAllUsers() {

    const response = await fetch(API_ENDPOINTS.users.list);

## 📝 License    return response.json();

  },

MIT License

  async getUserById(id: number) {

---    const response = await fetch(API_ENDPOINTS.users.detail(id));

    return response.json();

## 👥 Contributors  },



- **LockMan04** - Initial work  async createUser(data: CreateUserData) {

    const response = await fetch(API_ENDPOINTS.users.create, {

---      method: 'POST',

      headers: {

## 🆘 Support        'Content-Type': 'application/json',

      },

Nếu gặp vấn đề:      body: JSON.stringify(data),

1. Check [Troubleshooting](#-troubleshooting) section    });

2. Verify tất cả dependencies đã cài đúng    return response.json();

3. Check MongoDB đang chạy  },

4. Verify Python version = 3.11.9

  async updateUser(id: number, data: Partial<CreateUserData>) {

---    const response = await fetch(API_ENDPOINTS.users.update(id), {

      method: 'PUT',

**Happy Coding! 📚✨**      headers: {

        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteUser(id: number) {
    const response = await fetch(API_ENDPOINTS.users.delete(id), {
      method: 'DELETE',
    });
    return response.json();
  },
};
```

### Sử dụng trong Component

```typescript
import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await userService.getAllUsers();
        if (result.success) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Render users...
}
```

### Environment Variables

Tạo file `.env` ở thư mục gốc:

```env
VITE_API_BASE_URL=http://localhost:5000
```

**Lưu ý:**
- File `.env` được gitignore để bảo mật
- Đối với production, cần cấu hình URL khác
- CORS đã được cấu hình sẵn trong backend

## 🔄 Workflow làm việc nhóm

### 1. Trước khi bắt đầu feature mới

```bash
# Checkout main và pull code mới nhất
git checkout main
git pull origin main

# Tạo branch mới từ main
git checkout -b feature/ten-feature
```

### 2. Trong quá trình làm việc

```bash
# Commit thường xuyên với message rõ ràng
git add .
git commit -m "feat(admin): thêm bảng thống kê người dùng"

# Push branch lên remote
git push origin feature/ten-feature
```

### 3. Quy ước commit message

Format: `<type>(<scope>): <description>`

**Types:**
- `feat`: Thêm tính năng mới
- `fix`: Sửa bug
- `docs`: Cập nhật documentation
- `style`: Format code, không thay đổi logic
- `refactor`: Refactor code
- `perf`: Cải thiện performance
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

**Examples:**
```bash
feat(admin): thêm StatCard component
fix(user): sửa lỗi hiển thị danh sách sách
docs(readme): cập nhật hướng dẫn cài đặt
style(admin): format code theo ESLint
refactor(layout): tách AdminLayout thành components riêng
```

### 4. Branching Strategy

```
main                    → Production-ready code
  ├── feature/...       → Tính năng mới
  ├── fix/...           → Bug fixes
  └── refactor/...      → Code refactoring
```

**Naming convention:**
- `feature/admin-dashboard` - Tính năng dashboard admin
- `feature/user-book-search` - Tính năng tìm kiếm sách
- `fix/sidebar-mobile` - Sửa lỗi sidebar trên mobile
- `refactor/components-structure` - Tái cấu trúc components

## ✅ Pull Request Checklist

Trước khi tạo PR, đảm bảo:

### Code Quality
- [ ] `npm run build` - Build thành công không lỗi
- [ ] `npm run lint` - Không có linting errors (warnings được chấp nhận)
- [ ] Code được format đúng chuẩn
- [ ] Không có `console.log` debug còn sót lại
- [ ] TypeScript types đầy đủ, không dùng `any`

### Testing
- [ ] Test thủ công tất cả các thay đổi
- [ ] Test trên responsive (mobile, tablet, desktop)
- [ ] Test cả dark mode và light mode (nếu có)
- [ ] Không phá vỡ tính năng cũ

### Security
- [ ] Không commit secrets (API keys, passwords, tokens)
- [ ] Không commit file `.env`
- [ ] Sensitive data được handle đúng cách

### Documentation
- [ ] Cập nhật README nếu thêm tính năng mới
- [ ] Comment code phức tạp
- [ ] Component mới có PropTypes/Interface rõ ràng

### PR Description Template

```markdown
## 🎯 Mục đích
Mô tả ngắn gọn về mục đích của PR này

## 📝 Thay đổi chính
- Thêm component X
- Sửa bug Y
- Refactor Z

## 🖼️ Screenshots (nếu có thay đổi UI)
[Attach screenshots hoặc GIFs]

## 🧪 Cách test
1. Mở page /admin
2. Click vào button X
3. Verify kết quả Y

## 📋 Checklist
- [x] Build thành công
- [x] Lint pass
- [x] Đã test responsive
- [x] Đã test dark mode

## 🔗 Related Issues
Closes #123
```

## 💻 Development Guidelines

### Code Style

**TypeScript**
```tsx
// ✅ Good - Explicit types
interface UserProps {
  name: string;
  age: number;
}

// ❌ Bad - Using any
const user: any = {};
```

**Component Structure**
```tsx
// ✅ Good - Component với props interface
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    // JSX here
  );
}
```

**Import Order**
```tsx
// 1. React và external libraries
import { useState } from 'react';
import { Card, Button } from 'antd';

// 2. Internal components
import StatCard from './StatCard';

// 3. Types
import type { UserRecord } from '@/types';

// 4. Styles
import './styles.css';
```

### File Organization

```
📁 component-name/
  ├── ComponentName.tsx      # Main component
  ├── ComponentName.css      # Styles (nếu cần)
  ├── types.ts              # Types riêng
  └── index.ts              # Export barrel
```

### Naming Conventions

- **Components**: PascalCase - `StatCard.tsx`, `AdminLayout.tsx`
- **Files**: kebab-case hoặc PascalCase - `user-service.ts` hoặc `UserService.ts`
- **Variables/Functions**: camelCase - `getUserData`, `isLoading`
- **Constants**: UPPER_SNAKE_CASE - `API_BASE_URL`
- **Types/Interfaces**: PascalCase - `UserRecord`, `StatCardProps`

## 🔧 VS Code Setup (Khuyến nghị)

### Extensions cần thiết:
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **ES7+ React/Redux/React-Native snippets** - React snippets

### Settings khuyến nghị (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## 🐛 Troubleshooting

### Frontend Issues

**Port đã được sử dụng:**
```bash
# Thay đổi port trong vite.config.ts hoặc kill process
npx kill-port 5173
```

**Node modules lỗi:**
```bash
# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Clear TypeScript cache
npm run build -- --force
```

### Backend Issues

**Port 5000 đã được sử dụng:**
```bash
# Windows - Tìm và kill process
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Virtual environment không hoạt động:**
```bash
# Xóa và tạo lại venv
rm -rf venv
python -m venv venv

# Kích hoạt lại
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài lại dependencies
pip install -r requirements.txt
```

**Database migration lỗi:**
```bash
# Xóa migrations và database
rm -rf migrations/
rm -f app.db

# Tạo lại từ đầu
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

**Import errors trong Python:**
```bash
# Đảm bảo FLASK_APP được set
# Windows:
set FLASK_APP=run.py
# Linux/Mac:
export FLASK_APP=run.py

# Hoặc thêm vào .env
echo "FLASK_APP=run.py" >> .env
```

**CORS errors khi gọi API:**
```python
# Kiểm tra trong app/__init__.py đã có:
CORS(app)

# Hoặc cấu hình cụ thể hơn:
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
```

### Common Issues

**API không kết nối được:**
1. Kiểm tra backend đang chạy: `http://localhost:5000/health`
2. Kiểm tra frontend đang chạy: `http://localhost:5173`
3. Kiểm tra CORS settings
4. Kiểm tra firewall/antivirus

**Lỗi authentication:**
1. Kiểm tra JWT_SECRET_KEY trong `.env`
2. Kiểm tra token còn hạn sử dụng
3. Kiểm tra header `Authorization: Bearer <token>`
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

## 🎯 Tính Năng Chính

Hệ thống quản lý thư viện hiện đại với AI Chatbox hỗ trợ tra cứu sách, tích hợp MARC21, Z39.50, OAI-PMH, và SIP2.

### 👥 Quản Lý Người Dùng

- **Đăng ký/Đăng nhập** với JWT authentication
- **Đăng xuất** an toàn (clear tokens)
- **3 vai trò**: Reader (Sinh viên), Librarian (Thủ thư), Admin (Quản trị viên)
- **Profile management**: Cập nhật thông tin cá nhân

### 📖 Quản Lý Sách

- **MARC21 catalog**: Mô tả thư mục chuẩn quốc tế
- **Quản lý item**: Sách vật lý với barcode, location, status
- **Mượn/Trả sách**: Tích hợp SIP2 protocol
- **Tìm kiếm full-text**: MongoDB text search trên title, author, subject

### 🤖 AI Chatbox

- **Tra cứu sách** thông minh với natural language
- **FAQ hỏi đáp** về quy định thư viện
- **Citations**: Trích dẫn từ MARC records và documents
- **Conversation history**: Lịch sử chat được lưu trữ

### 📊 Dashboard & Reports

- **Admin Dashboard**: Thống kê users, books, loans
- **Reports**: Báo cáo sách quá hạn, top borrowed books
- **Metrics**: LLM cost, latency tracking

### 🔗 Tích Hợp Ngoài

- **Z39.50**: Tra cứu thư viện từ xa
- **OAI-PMH**: Thu thập metadata
- **SIP2**: Checkout/checkin tự động

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
# Clone repository
git clone https://github.com/LockMan04/LibAI.git
cd LibAI

# Checkout branch với authentication đầy đủ
git checkout feature/auth-implementation
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

# Activate virtual environment
.\venv311\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt
```

#### macOS/Linux (Bash)

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment
python3.11 -m venv venv311

# Activate virtual environment
source venv311/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### 4️⃣ Cấu hình MongoDB

#### Option 1: Sử dụng MongoDB Cloud Atlas (Khuyến nghị)

File `backend/.env` đã được cấu hình sẵn để sử dụng MongoDB Cloud Atlas:

```env
# Sử dụng Cloud MongoDB (mặc định)
USE_CLOUD_MONGODB=true

# MongoDB Cloud URI (đã cấu hình sẵn)
MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0

MONGO_DBNAME=library_chatbox
```

**✅ Ưu điểm:**
- Không cần cài đặt MongoDB local
- Đã có sẵn dữ liệu seed
- Shared database cho cả team
- Tự động backup và scaling

#### Option 2: Sử dụng MongoDB Localhost (Development)

Nếu muốn sử dụng MongoDB local:

1. Cài đặt MongoDB Community Server
2. Sửa file `backend/.env`:

```env
# Chuyển sang Localhost
USE_CLOUD_MONGODB=false

# MongoDB Local URI
MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox

MONGO_DBNAME=library_chatbox
```

3. Seed dữ liệu local:

```bash
cd backend
python scripts/seed_mongodb.py
```

### 5️⃣ Seed Database (Nếu cần)

Nếu sử dụng Cloud MongoDB và muốn seed lại dữ liệu:

```bash
cd backend
python scripts/seed_full_cloud.py
```

**Tài khoản test sau khi seed (Password: `Password123`):**
- `admin@ntt.edu.vn` - Admin
- `librarian@ntt.edu.vn` - Librarian
- `sv001@ntt.edu.vn` - Reader
- `sv002@ntt.edu.vn` - Reader (có sách đang mượn)

### 6️⃣ Chạy Ứng Dụng

#### Terminal 1 - Backend

```bash
cd backend
python run.py

# Backend chạy tại: http://localhost:5000
```

#### Terminal 2 - Frontend

```bash
npm run dev

# Frontend chạy tại: http://localhost:5173
```

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

```
POST   /api/auth/register      → Đăng ký tài khoản mới
POST   /api/auth/login         → Đăng nhập
POST   /api/auth/refresh       → Refresh access token
GET    /api/auth/me            → Lấy thông tin user hiện tại [Protected]
POST   /api/auth/change-password → Đổi mật khẩu [Protected]
POST   /api/auth/logout        → Đăng xuất [Protected]
```

### Users (`/api/users`)

```
GET    /api/users              → Danh sách users [Admin only]
GET    /api/users/:id          → Chi tiết user [Protected]
PUT    /api/users/:id          → Cập nhật user [Protected]
DELETE /api/users/:id          → Xóa user [Admin only]
```

### MARC Records (`/api/library/marc`)

```
GET    /api/library/marc       → Danh sách MARC records
GET    /api/library/marc/:id   → Chi tiết MARC record
POST   /api/library/marc       → Tạo MARC record [Librarian/Admin]
PUT    /api/library/marc/:id   → Cập nhật MARC record [Librarian/Admin]
DELETE /api/library/marc/:id   → Xóa MARC record [Admin only]
```

### Items (`/api/library/items`)

```
GET    /api/library/items      → Danh sách items
GET    /api/library/items/:id  → Chi tiết item
POST   /api/library/items      → Tạo item [Librarian/Admin]
PUT    /api/library/items/:id  → Cập nhật item [Librarian/Admin]
```

### Loans (`/api/library/loans`)

```
GET    /api/library/loans      → Danh sách loans
GET    /api/library/loans/:id  → Chi tiết loan
POST   /api/library/loans      → Tạo loan (mượn sách) [Protected]
PUT    /api/library/loans/:id  → Cập nhật loan (trả sách) [Librarian/Admin]
```

---

## 🗄️ Database Structure

### Collections Overview

#### Core Collections

- **users**: User accounts (email, password_hash, role, full_name)
- **marc_records**: Book catalog (MARC21 format)
- **items**: Physical book copies (barcode, location, status, marc_record_id)
- **loans**: Borrowing records (user_id, item_id, checkout_date, return_date, status)

#### Chatbox Collections

- **conversations**: Chat sessions
- **messages**: Chat messages with citations
- **faq**: Frequently asked questions
- **documents**: Knowledge base documents

#### System Collections

- **admin_configs**: System settings
- **metrics**: Analytics (LLM cost, latency)
- **recommend_events**: Recommendation tracking

#### Integration Collections

- **z3950_cache**: Z39.50 query cache
- **oai_records**: OAI-PMH harvested records
- **sip2_events**: SIP2 transaction logs
- **auth_sessions**: JWT refresh tokens (with TTL)

---

## 📁 Project Structure

```
LibAI/
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── admin/           # Admin components
│   │   │   └── user/            # User-facing components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   └── user/            # User pages
│   │   ├── services/            # API services
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Main App component
│   │   └── main.tsx             # Entry point
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
│
├── backend/                     # Flask Backend
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── models/              # Data models
│   │   │   ├── mongodb_schemas.py  # MongoDB schemas
│   │   │   └── user.py          # User model (legacy)
│   │   ├── routes/              # API routes
│   │   │   ├── auth.py          # Authentication routes
│   │   │   ├── api.py           # User routes
│   │   │   ├── library_routes.py # Library routes
│   │   │   └── mongodb_routes.py # MongoDB test routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utility functions
│   │       ├── mongo_helper.py  # MongoDB helper
│   │       ├── validators.py    # Input validators
│   │       └── decorators.py    # Route decorators
│   ├── scripts/                 # Utility scripts
│   │   ├── seed_full_cloud.py   # Seed all 15 collections
│   │   ├── seed_to_cloud.py     # Seed basic data
│   │   └── init_mongodb_indexes.py  # Create indexes
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Entry point
│
├── README.md                    # This file
├── SETUP_GUIDE.md              # Detailed setup guide
└── .gitignore                  # Git ignore rules
```

---

## 🔧 Configuration

### Environment Variables

File `backend/.env` chứa các biến môi trường:

```env
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development

# Security Keys
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-here-change-in-production

# MongoDB Configuration
USE_CLOUD_MONGODB=true
MONGO_URI_CLOUD=mongodb+srv://...
MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox
MONGO_DBNAME=library_chatbox

# JWT Token Expiration (in seconds)
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server Port
PORT=5000
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
npm test
```

---

## 🛠️ Troubleshooting

### Backend không chạy được

1. Kiểm tra Python version: `python --version` (cần 3.11+)
2. Kiểm tra virtual environment đã activate chưa
3. Kiểm tra MongoDB connection trong `.env`
4. Xem logs trong terminal để biết lỗi cụ thể

### Frontend không hiển thị

1. Kiểm tra Node.js version: `node --version` (cần 18+)
2. Kiểm tra backend đang chạy: `http://localhost:5000/health`
3. Xóa `node_modules` và cài lại: `rm -rf node_modules && npm install`
4. Clear browser cache và reload

### Lỗi CORS

- Kiểm tra `CORS_ORIGINS` trong `backend/.env`
- Đảm bảo frontend đang chạy đúng port `5173`

### Lỗi MongoDB Connection

- Nếu dùng Cloud: Kiểm tra internet connection
- Nếu dùng Local: Kiểm tra MongoDB service đang chạy
- Xem logs để biết lỗi cụ thể

---

## 👥 Team

- **Developer**: LockMan04
- **Repository**: [https://github.com/LockMan04/LibAI](https://github.com/LockMan04/LibAI)

---

## 📝 License

This project is developed for educational purposes.

---

**Happy Coding! 📚✨**

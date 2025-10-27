# 🚀 Hướng Dẫn Setup LibAI từ GitHub

> Hướng dẫn chi tiết cho người mới clone project về và chạy lần đầu

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo máy bạn đã cài đặt:

### ✅ Bắt buộc:
- **Git**: >= 2.0.0
- **Node.js**: >= 18.0.0 (LTS version)
- **npm**: >= 9.0.0
- **Python**: 3.11.9 hoặc 3.11+ (khuyến nghị 3.11.9)
- **pip**: Python package manager

### 🔍 Kiểm tra version:

```bash
git --version
node --version
npm --version
python --version
pip --version
```

---

## 📥 Bước 1: Clone Repository

```bash
# Clone project từ GitHub
git clone https://github.com/LockMan04/LibAI.git
cd LibAI

# Checkout branch authentication (feature mới nhất)
git checkout feature/auth-implementation

# Kiểm tra branch hiện tại
git branch
# Output: * feature/auth-implementation
```

---

## ⚙️ Bước 2: Cài Đặt Frontend

### 2.1. Install Dependencies

```bash
# Đảm bảo đang ở thư mục gốc của project
cd LibAI

# Cài đặt tất cả packages từ package.json
npm install
```

**Thời gian:** Khoảng 2-3 phút (tùy tốc độ internet)

**Các package sẽ được cài:**
- React 19
- TypeScript
- Vite
- React Router DOM
- Heroicons
- Tailwind CSS
- Axios
- và nhiều dependencies khác...

### 2.2. Kiểm tra cài đặt thành công

```bash
# Kiểm tra node_modules đã được tạo
ls node_modules  # Linux/Mac
dir node_modules  # Windows

# Thử chạy dev server
npm run dev
```

**Output mong đợi:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Chú ý:** Frontend sẽ chưa hoạt động hoàn toàn vì backend chưa chạy. Nhấn `Ctrl+C` để dừng và tiếp tục setup backend.

---

## 🐍 Bước 3: Cài Đặt Backend

### 3.1. Tạo Virtual Environment

#### Windows (PowerShell):

```powershell
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment với Python 3.11
python -m venv venv311

# Kích hoạt venv
.\venv311\Scripts\Activate.ps1

# Verify Python version trong venv
python --version
# Expected: Python 3.11.9 (hoặc 3.11.x)
```

**Lưu ý Windows:** Nếu gặp lỗi PowerShell execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Linux/macOS:

```bash
cd backend

# Tạo virtual environment
python3.11 -m venv venv311

# Kích hoạt venv
source venv311/bin/activate

# Verify Python version
python --version
# Expected: Python 3.11.9
```

### 3.2. Install Python Dependencies

```bash
# Đảm bảo venv đã được activate (sẽ thấy (venv311) ở đầu dòng lệnh)
# Nếu chưa, chạy lại lệnh activate ở trên

# Cài đặt tất cả packages từ requirements.txt
pip install -r requirements.txt
```

**Thời gian:** Khoảng 3-5 phút

**Các package quan trọng sẽ được cài:**
- Flask 3.1.2
- Flask-CORS 6.0.1
- Flask-JWT-Extended 4.7.1
- Flask-PyMongo 3.0.1
- Flask-SQLAlchemy 3.1.1
- Flask-Migrate 4.0.7
- PyMongo 4.15.3
- bcrypt 5.0.0
- và nhiều dependencies khác...

### 3.3. Tạo file cấu hình Environment

```bash
# Tạo file .env từ template
# Windows PowerShell:
Copy-Item .env.example .env

# Linux/Mac:
cp .env.example .env
```

### 3.4. Cấu hình MongoDB

Mở file `backend/.env` bằng editor và **KHÔNG CẦN THAY ĐỔI GÌ**:

```env
# MongoDB Configuration
USE_CLOUD_MONGODB=true

# Cloud MongoDB (đã cấu hình sẵn - KHÔNG THAY ĐỔI)
MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0

# Local MongoDB (không dùng)
MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox

# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

**✅ Ưu điểm dùng Cloud MongoDB:**
- Không cần cài đặt MongoDB trên máy local
- Database đã có sẵn data test (users, books, etc.)
- Clone về là chạy được ngay

**Lưu ý:** Nếu muốn dùng localhost MongoDB, đổi `USE_CLOUD_MONGODB=false` và làm theo hướng dẫn cài MongoDB trong [README.md](README.md#-option-b-mongodb-localhost-development)

---

## ▶️ Bước 4: Chạy Ứng Dụng

Bạn cần mở **2 terminal** để chạy cả frontend và backend cùng lúc.

### Terminal 1 - Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Kích hoạt venv (nếu chưa activate)
# Windows:
.\venv311\Scripts\Activate.ps1
# Linux/Mac:
source venv311/bin/activate

# Chạy Flask server
python run.py
```

**Output thành công:**
```
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Connected to MongoDB Cloud Atlas
Press CTRL+C to quit
```

**Backend đang chạy tại:** http://localhost:5000

### Terminal 2 - Frontend

```bash
# Mở terminal mới, di chuyển về thư mục gốc
cd LibAI

# Chạy Vite dev server
npm run dev
```

**Output thành công:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Frontend đang chạy tại:** http://localhost:5173 hoặc http://localhost:5174

---

## 🎉 Bước 5: Kiểm Tra & Đăng Nhập

### 5.1. Mở trình duyệt

Truy cập: http://localhost:5173

### 5.2. Đăng nhập với tài khoản test

Database cloud đã có sẵn 4 tài khoản test:

| Email | Password | Role | Mô tả |
|-------|----------|------|-------|
| `sv001@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |
| `sv002@ntt.edu.vn` | `Password123` | **reader** | Sinh viên |
| `librarian@ntt.edu.vn` | `Password123` | **librarian** | Thủ thư |
| `admin@ntt.edu.vn` | `Password123` | **admin** | Quản trị viên |

### 5.3. Test các chức năng

**Với tài khoản Reader (sv001@ntt.edu.vn):**
1. ✅ Đăng nhập thành công → Redirect về `/user/home`
2. ✅ Xem trang chủ UserHomePage
3. ✅ Thử tìm kiếm/chat (cần đăng nhập)
4. ✅ Đăng xuất (nút logout ở header)

**Với tài khoản Admin (admin@ntt.edu.vn):**
1. ✅ Đăng nhập thành công → Redirect về `/admin/dashboard`
2. ✅ Xem Dashboard với thống kê
3. ✅ Quản lý users, books, reports
4. ✅ Đăng xuất (click avatar → Đăng xuất)

---

## 🐛 Troubleshooting - Xử Lý Lỗi Thường Gặp

### ❌ Lỗi: Cannot find module 'xyz'

**Nguyên nhân:** Thiếu dependencies

**Giải pháp:**
```bash
# Frontend:
npm install

# Backend:
cd backend
pip install -r requirements.txt
```

### ❌ Lỗi: Port 5173 already in use

**Nguyên nhân:** Port đã được sử dụng bởi process khác

**Giải pháp:**
```bash
# Kill process đang dùng port 5173
npx kill-port 5173

# Hoặc Vite sẽ tự động dùng port 5174
```

### ❌ Lỗi: MongoDB connection failed

**Nguyên nhân:** Không kết nối được MongoDB Cloud

**Giải pháp:**
1. Kiểm tra internet connection
2. Verify file `backend/.env` có `USE_CLOUD_MONGODB=true`
3. Kiểm tra firewall/antivirus có chặn port 27017 không

### ❌ Lỗi: Python version mismatch

**Nguyên nhân:** Đang dùng Python version khác 3.11

**Giải pháp:**
```bash
# Kiểm tra Python version
python --version

# Nếu sai, cài Python 3.11.9 và tạo lại venv
python3.11 -m venv venv311
```

### ❌ Lỗi: Login failed - Incorrect password

**Nguyên nhân:** Nhập sai password

**Giải pháp:**
- Đảm bảo password là: `Password123` (có chữ P và P viết hoa)
- Thử copy-paste password từ bảng trên

### ❌ Lỗi: CORS policy

**Nguyên nhân:** Backend chưa chạy hoặc CORS chưa cấu hình

**Giải pháp:**
1. Đảm bảo backend đang chạy tại http://localhost:5000
2. Check file `backend/app/config.py` có cấu hình CORS
3. Clear browser cache và refresh

### ❌ Lỗi: Module not found 'flask'

**Nguyên nhân:** Virtual environment chưa activate

**Giải pháp:**
```bash
cd backend

# Windows:
.\venv311\Scripts\Activate.ps1

# Linux/Mac:
source venv311/bin/activate

# Verify: Dòng lệnh sẽ có (venv311) ở đầu
```

---

## 📝 Checklist - Tổng Kết

Sau khi hoàn thành setup, bạn nên có:

- [ ] ✅ Git clone project thành công
- [ ] ✅ Checkout branch `feature/auth-implementation`
- [ ] ✅ `npm install` frontend thành công
- [ ] ✅ Virtual environment `venv311` đã được tạo
- [ ] ✅ `pip install -r requirements.txt` thành công
- [ ] ✅ File `backend/.env` đã được tạo từ `.env.example`
- [ ] ✅ Backend chạy tại http://localhost:5000
- [ ] ✅ Frontend chạy tại http://localhost:5173
- [ ] ✅ Đăng nhập thành công với tài khoản test
- [ ] ✅ Logout thành công (tokens cleared)

---

## 🎯 Next Steps - Bước Tiếp Theo

Sau khi setup thành công, bạn có thể:

1. **Đọc README.md** để hiểu rõ hơn về project structure
2. **Xem API Documentation** trong README.md
3. **Tìm hiểu code** trong thư mục `src/` (frontend) và `backend/app/` (backend)
4. **Tạo branch mới** để phát triển feature:
   ```bash
   git checkout -b feature/ten-feature-moi
   ```

---

## 💡 Tips & Tricks

### Chạy nhanh bằng scripts

**Windows - Tạo file `start.bat`:**
```batch
@echo off
start cmd /k "cd backend && .\venv311\Scripts\Activate.ps1 && python run.py"
start cmd /k "npm run dev"
```

**Linux/Mac - Tạo file `start.sh`:**
```bash
#!/bin/bash
cd backend && source venv311/bin/activate && python run.py &
npm run dev
```

### Sử dụng VS Code

1. Cài extension **Python** và **ESLint**
2. Mở 2 integrated terminals (Ctrl + ` để mở terminal)
3. Terminal 1: Backend
4. Terminal 2: Frontend

### Debug mode

- **Backend**: File `run.py` đã có `debug=True`
- **Frontend**: Vite có hot reload sẵn

---

## 🆘 Cần Hỗ Trợ?

Nếu gặp vấn đề không có trong Troubleshooting:

1. Check [README.md](README.md#-troubleshooting) phần Troubleshooting chi tiết hơn
2. Kiểm tra logs trong terminal để tìm error message
3. Google error message cụ thể
4. Hỏi team member hoặc mở issue trên GitHub

---

**Chúc bạn setup thành công! 🎉**

**Happy Coding! 📚✨**

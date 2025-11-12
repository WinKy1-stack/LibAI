# Hướng Dẫn Cài Đặt LibAI

## Yêu Cầu Hệ Thống

- Git 2.0+
- Node.js 18.0+ (LTS)
- Python 3.11+
- YAZ Toolkit (tùy chọn - cho Z39.50)

Kiểm tra:
```
git --version
node --version
python --version
```

## Cài Đặt YAZ (Tùy Chọn)

### Windows
```
# Tải installer tại: https://ftp.indexdata.com/pub/yaz/windows/
# Chạy file .exe và chọn "Add YAZ to PATH"
yaz-client --version
```

### Linux/macOS
```
sudo apt-get install yaz  # Ubuntu/Debian
brew install yaz          # macOS
```

## Các Bước Cài Đặt

### 1. Clone Repository
```
git clone https://github.com/LockMan04/LibAI.git
cd LibAI
```

### 2. Cài Frontend
```
npm install
npm run dev
```
Frontend chạy tại: http://localhost:5173

### 3. Cài Backend
```
cd backend

# Tạo môi trường ảo
python -m venv venv311

# Kích hoạt
.\venv311\Scripts\Activate.ps1  # Windows
source venv311/bin/activate     # Linux/macOS

# Cài đặt packages
pip install -r requirements.txt

# Tạo file cấu hình
cp .env.example .env
```

### 4. Cấu Hình MongoDB

Chỉnh file `backend/.env`:

**MongoDB Cloud (Khuyến nghị):**
```
USE_CLOUD_MONGODB=true
MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0
```

**MongoDB Local:**
```
USE_CLOUD_MONGODB=false
```

Nếu dùng local, chạy seed data:
```
python scripts/seed_library_data.py
```

### 5. Chạy Ứng Dụng

**Terminal 1 - Backend:**
```
cd backend
source venv311/bin/activate  # hoặc .\venv311\Scripts\Activate.ps1
python run.py
```
API: http://localhost:5000

**Terminal 2 - Frontend:**
```
npm run dev
```
App: http://localhost:5173

## Xử Lý Lỗi

### PowerShell không cho chạy script
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### YAZ không tìm thấy
Thêm YAZ vào PATH:
1. Win + R → `sysdm.cpl`
2. Advanced → Environment Variables
3. Path → Edit → New → `C:\Program Files\Index Data\YAZ\bin`

### Kiểm tra kết nối Z39.50
```
yaz-client z3950.loc.gov:7090/voyager
```

## Lưu Ý

- YAZ chỉ cần nếu dùng tính năng Z39.50
- Dùng MongoDB Cloud để không phải cài DB local
- Giữ 2 terminal chạy song song (frontend + backend)
# 🚀 Hướng Dẫn Cài Đặt LibAI

> Hướng dẫn chi tiết để cài đặt và chạy dự án LibAI trên máy cục bộ của bạn, từ việc sao chép kho mã nguồn đến khi khởi chạy ứng dụng.

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau trên hệ thống của mình:

### ✅ Bắt Buộc:
- **Git**: Phiên bản 2.0.0 trở lên
- **Node.js**: Phiên bản 18.0.0 trở lên (khuyến nghị phiên bản LTS)
- **npm**: Phiên bản 9.0.0 trở lên
- **Python**: Phiên bản 3.11.9 (khuyến nghị) hoặc 3.11+
- **pip**: Trình quản lý gói Python

### 🔍 Kiểm Tra Phiên Bản:

Để kiểm tra xem bạn đã cài đặt đúng các phiên bản chưa, hãy chạy các lệnh sau trong terminal của bạn:

```bash
git --version
node --version
npm --version
python --version
pip --version
```

---

## 📥 Bước 1: Sao chép (Clone) Kho Mã Nguồn

Đầu tiên, sao chép kho mã nguồn của dự án về máy cục bộ của bạn và di chuyển vào thư mục dự án:

```bash
# Sao chép dự án từ GitHub
git clone https://github.com/LockMan04/LibAI.git
cd LibAI

# Chuyển sang nhánh phát triển mới nhất (tùy chọn)
# git checkout feature/auth-implementation
```

---

## ⚙️ Bước 2: Cài Đặt Frontend

Tiếp theo, cài đặt các gói phụ thuộc cho frontend và khởi động máy chủ phát triển.

### 2.1. Cài Đặt Các Gói Phụ Thuộc

```bash
# Đảm bảo bạn đang ở thư mục gốc của dự án
# Cài đặt tất cả các gói từ package.json
npm install
```

Quá trình này có thể mất vài phút tùy thuộc vào tốc độ mạng của bạn.

### 2.2. Khởi Động Máy Chủ Phát Triển

```bash
# Khởi động máy chủ phát triển Vite
npm run dev
```

Sau khi chạy lệnh, bạn sẽ thấy kết quả tương tự như sau:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

Frontend của bạn hiện đang chạy tại `http://localhost:5173`. Bạn có thể để nó chạy và mở một terminal mới cho các bước tiếp theo.

---

## 🐍 Bước 3: Cài Đặt Backend

Bây giờ, hãy cài đặt backend, bao gồm việc tạo một môi trường ảo và cài đặt các gói Python cần thiết.

### 3.1. Tạo Môi Trường Ảo

#### Windows (PowerShell):

```powershell
# Di chuyển vào thư mục backend
cd backend

# Tạo một môi trường ảo
python -m venv venv311

# Kích hoạt môi trường ảo
.\venv311\Scripts\Activate.ps1
```

> **Lưu ý trên Windows:** Nếu bạn gặp lỗi về chính sách thực thi của PowerShell, hãy chạy lệnh sau:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

#### Linux/macOS:

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo một môi trường ảo
python3.11 -m venv venv311

# Kích hoạt môi trường ảo
source venv311/bin/activate
```

### 3.2. Cài Đặt Các Gói Phụ Thuộc Python

```bash
# Đảm bảo môi trường ảo đã được kích hoạt
# Cài đặt tất cả các gói từ requirements.txt
pip install -r requirements.txt
```

### 3.3. Cấu Hình Biến Môi Trường

```bash
# Trong thư mục backend, sao chép tệp .env.example
# Đối với Windows PowerShell:
Copy-Item .env.example .env

# Đối với Linux/Mac:
cp .env.example .env
```

---

## ☁️ Bước 4: Cấu Hình Cơ Sở Dữ Liệu

Bạn có thể chọn giữa việc sử dụng MongoDB Atlas trên đám mây (khuyến nghị) hoặc một máy chủ MongoDB cục bộ.

### Lựa Chọn A: MongoDB Cloud Atlas (Khuyến Nghị)

Đây là tùy chọn dễ nhất vì không cần cài đặt cơ sở dữ liệu cục bộ và đã có sẵn dữ liệu mẫu.

Trong tệp `backend/.env` của bạn, đảm bảo các cài đặt sau được định cấu hình:

```env
# Cấu hình MongoDB
USE_CLOUD_MONGODB=true

# URI MongoDB Cloud (đã được cấu hình sẵn, không cần thay đổi)
MONGO_URI_CLOUD=mongodb+srv://nptb137:thaibao10112004@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0
```

### Lựa Chọn B: MongoDB Cục Bộ

Nếu bạn muốn chạy một máy chủ MongoDB cục bộ:

1.  **Cài Đặt MongoDB Community Server**:
    -   **Windows**: [Tải về tại đây](https://www.mongodb.com/try/download/community)
    -   **Linux**: `sudo apt install mongodb-community`
    -   **macOS**: `brew install mongodb-community`

2.  **Khởi Động Dịch Vụ MongoDB**.

3.  **Cập nhật tệp `.env`** để sử dụng cơ sở dữ liệu cục bộ:
    ```env
    USE_CLOUD_MONGODB=false
    ```

4.  **Tạo Dữ Liệu Mẫu** (Chỉ dành cho cơ sở dữ liệu cục bộ):
    ```bash
    # Đảm bảo môi trường ảo của bạn đã được kích hoạt
    python scripts/seed_library_data.py
    ```

---

## ▶️ Bước 5: Chạy Ứng Dụng

Sau khi đã cấu hình cả frontend và backend, bạn đã sẵn sàng để chạy ứng dụng.

**Terminal 1: Khởi Động Backend**

```bash
cd backend

# Kích hoạt môi trường ảo nếu chưa được kích hoạt
# .\venv311\Scripts\Activate.ps1  (Windows)
# source venv311/bin/activate    (Linux/macOS)

python run.py
```

API backend sẽ có sẵn tại `http://localhost:5000`.

**Terminal 2: Khởi Động Frontend**

```bash
# Từ thư mục gốc của dự án
npm run dev
```

Frontend sẽ có thể truy cập được tại `http://localhost:5173`.

Bây giờ bạn có thể mở `http://localhost:5173` trong trình duyệt của mình để sử dụng ứng dụng.

# Hướng dẫn Cài đặt

Hướng dẫn này cung cấp các bước chi tiết để cài đặt và chạy dự án LibAI trên máy cục bộ.

## Yêu cầu tiên quyết

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau trên hệ thống của mình:

**Frontend:**
- **Node.js**: >= 18.0.0 (khuyến nghị phiên bản LTS)
- **npm**: >= 9.0.0

**Backend:**
- **Python**: 3.11.9 hoặc 3.11+ (khuyến nghị 3.11.9)
- **pip**: Trình quản lý gói Python

**Chung:**
- **Git**: >= 2.0.0

---

## Bước 1: Sao chép (Clone) Kho mã nguồn

Đầu tiên, sao chép kho mã nguồn của dự án về máy cục bộ của bạn:

```bash
git clone https://github.com/LockMan04/LibAI.git
cd LibAI
```

---

## Bước 2: Cài đặt Frontend

Đi đến thư mục gốc của dự án và chạy các lệnh sau để cài đặt các gói phụ thuộc và khởi động máy chủ phát triển:

```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi động máy chủ phát triển
npm run dev
```

Frontend sẽ có thể truy cập được tại `http://localhost:5173`.

### Các Scripts có sẵn

- `npm run dev`: Khởi động máy chủ phát triển với tính năng tải lại nóng (hot-reloading).
- `npm run build`: Xây dựng ứng dụng cho môi trường sản phẩm (production).
- `npm run preview`: Xem trước bản dựng sản phẩm.
- `npm run lint`: Kiểm tra lỗi trong mã nguồn.

---

## Bước 3: Cài đặt Backend

Việc cài đặt backend bao gồm tạo một môi trường ảo Python và cài đặt các gói cần thiết.

### Windows (PowerShell)

```powershell
# Đi đến thư mục backend
cd backend

# Tạo một môi trường ảo
python -m venv venv311

# Kích hoạt môi trường ảo
.\venv311\Scripts\Activate.ps1

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Kiểm tra phiên bản Python
python --version
# Kết quả mong đợi: Python 3.11.9
```

### Linux/macOS

```bash
# Đi đến thư mục backend
cd backend

# Tạo một môi trường ảo
python3.11 -m venv venv311

# Kích hoạt môi trường ảo
source venv311/bin/activate

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Kiểm tra phiên bản Python
python --version
# Kết quả mong đợi: Python 3.11.9
```

---

## Bước 4: Cấu hình MongoDB

Bạn có thể chọn giữa việc sử dụng một phiên bản MongoDB Atlas được lưu trữ trên đám mây hoặc một máy chủ MongoDB cục bộ.

### Lựa chọn A: MongoDB Cloud Atlas (Khuyến nghị)

Sử dụng cơ sở dữ liệu đám mây được khuyến nghị cho việc hợp tác nhóm vì không cần cài đặt cục bộ.

1.  **Tạo một tệp `.env`** trong thư mục `backend/`:

    ```bash
    # Đối với Windows PowerShell
    cd backend
    Copy-Item .env.example .env

    # Đối với Linux/macOS
    cd backend
    cp .env.example .env
    ```

2.  **Cấu hình tệp `.env`** để sử dụng cơ sở dữ liệu đám mây:

    ```env
    # Cấu hình MongoDB
    USE_CLOUD_MONGODB=true

    # URI MongoDB Cloud (thay thế bằng của bạn)
    MONGO_URI_CLOUD=mongodb+srv://<username>:<password>@cluster0.e5wsuwa.mongodb.net/library_chatbox?retryWrites=true&w=majority&appName=Cluster0

    # MongoDB Cục bộ
    MONGO_URI_LOCAL=mongodb://localhost:27017/library_chatbox

    # Cấu hình Flask
    FLASK_APP=run.py
    FLASK_ENV=development
    SECRET_KEY=your-secret-key-here
    JWT_SECRET_KEY=your-jwt-secret-key-here
    ```

### Lựa chọn B: MongoDB Localhost

1.  **Cài đặt MongoDB Community Server**:
    -   **Windows**: [Tải về tại đây](https://www.mongodb.com/try/download/community) và cài đặt dưới dạng dịch vụ.
    -   **Linux**: `sudo apt install mongodb-community`
    -   **macOS**: `brew install mongodb-community`

2.  **Khởi động dịch vụ MongoDB**:

    ```powershell
    # Đối với Windows
    net start MongoDB
    ```

    ```bash
    # Đối với Linux/macOS
    sudo systemctl start mongod
    ```

3.  **Cập nhật tệp `.env`** để sử dụng cơ sở dữ liệu cục bộ:

    ```env
    USE_CLOUD_MONGODB=false
    ```

---

## Bước 5: Tạo dữ liệu mẫu (Chỉ dành cho Localhost)

Nếu bạn đang sử dụng một phiên bản MongoDB cục bộ, bạn cần tạo dữ liệu ban đầu cho nó.

```bash
cd backend

# Kích hoạt môi trường ảo nếu chưa được kích hoạt
# .\venv311\Scripts\Activate.ps1  (Windows)
# source venv311/bin/activate    (Linux/macOS)

# Chạy script tạo dữ liệu mẫu
python scripts/seed_library_data.py
```

Bạn sẽ thấy một kết quả xác nhận việc tạo người dùng, bản ghi MARC, các mục và các khoản mượn.

---

## Bước 6: Chạy Ứng dụng

Sau khi đã cấu hình cả frontend và backend, bạn có thể chạy ứng dụng.

**Terminal 1: Khởi động Backend**

```bash
cd backend

# Kích hoạt môi trường ảo
# .\venv311\Scripts\Activate.ps1  (Windows)
# source venv311/bin/activate    (Linux/macOS)

python run.py
```

API backend sẽ có sẵn tại `http://localhost:5000`.

**Terminal 2: Khởi động Frontend**

```bash
# Từ thư mục gốc của dự án
npm run dev
```

Frontend sẽ có thể truy cập được tại `http://localhost:5173`.

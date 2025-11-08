# Hướng Dẫn Chạy Ứng Dụng

## Chuẩn Bị

**Yêu cầu**: 
- Docker (version 20.10+)
- Docker Compose (version 2.0+)

**Kiểm tra cài đặt**:
```bash
docker --version
docker-compose --version
```

## Các Bước Chạy

### 1. Chạy Ứng Dụng

```bash
# Build và start tất cả services
docker-compose up -d

# Nếu build lần đầu, có thể mất vài phút
# Xem logs để theo dõi tiến trình
docker-compose logs -f
```

**Lưu ý**: 
- Lần đầu build có thể mất 5-10 phút để download images và build
- Đảm bảo ports 80 (frontend) và 5000 (backend) chưa bị sử dụng

### 2. Kiểm Tra

Mở trình duyệt truy cập:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/health

### 3. Dừng Ứng Dụng

```bash
# Dừng services
docker-compose down

# Dừng và xóa dữ liệu
docker-compose down -v
```

## Các Lệnh Hữu Ích

### Xem Logs

```bash
# Logs tất cả services
docker-compose logs -f

# Logs backend
docker-compose logs -f backend

# Logs 100 dòng cuối
docker-compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart tất cả
docker-compose restart

# Restart backend
docker-compose restart backend
```

### Truy Cập Container

```bash
# Vào backend shell
docker-compose exec backend bash

# Vào MongoDB shell
docker-compose exec mongo mongosh library_chatbox

# Vào Redis CLI
docker-compose exec redis redis-cli
```

### Kiểm Tra Trạng Thái

```bash
# Xem status containers
docker-compose ps

# Xem resource usage
docker stats

# Health check
curl http://localhost:5000/health
```

## Backup & Restore

### Backup MongoDB

```bash
# Tạo backup
docker-compose exec mongo mongodump \
  --out /data/backup/$(date +%Y%m%d) \
  --db library_chatbox

# Copy ra host
docker cp lib-ai-mongo:/data/backup ./backups/
```

### Restore MongoDB

```bash
# Restore từ backup
docker-compose exec mongo mongorestore /data/backup/20240101/library_chatbox
```

## Xử Lý Lỗi Thường Gặp

### Port đã được sử dụng

```bash
# Kiểm tra port 80
sudo lsof -i :80

# Kiểm tra port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### Container không start

```bash
# Xem logs lỗi
docker-compose logs <service-name>

# Rebuild (xóa cache)
docker-compose build --no-cache <service-name>
docker-compose up -d

# Ví dụ: Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Frontend build lỗi

```bash
# Kiểm tra logs frontend
docker-compose logs frontend

# Rebuild frontend
docker-compose build --no-cache frontend

# Nếu vẫn lỗi, thử xóa node_modules trong container
docker-compose run --rm frontend sh -c "rm -rf node_modules && npm ci"
```

### Kết nối MongoDB/Redis lỗi

```bash
# Test MongoDB
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Test Redis
docker-compose exec redis redis-cli PING

# Kiểm tra network
docker-compose exec backend ping mongo
docker-compose exec backend ping redis
```

### Dọn dọn Docker

```bash
# Xóa images/containers không dùng
docker system prune -a

# Xóa volumes không dùng
docker volume prune
```

## Cập Nhật Ứng Dụng

```bash
# Pull code mới
git pull

# Rebuild và restart
docker-compose build
docker-compose up -d

# Hoặc rebuild từng service nếu cần
docker-compose build frontend  # Nếu chỉ sửa frontend
docker-compose build backend   # Nếu chỉ sửa backend
docker-compose up -d
```

## Cấu Hình Môi Trường (Tùy chọn)

Nếu cần thay đổi cấu hình, tạo file `.env` trong thư mục root:

```bash
# Ví dụ .env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
MONGO_URI=mongodb://mongo:27017/library_chatbox
GEMINI_API_KEY=your-gemini-api-key
```

Xem file `docker-compose.yml` để biết các biến môi trường cần thiết.

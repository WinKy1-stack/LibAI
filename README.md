# 📚 LibAI - Hệ thống Quản lý Thư viện

> Một hệ thống quản lý thư viện full-stack hiện đại với React frontend và Flask backend, được tích hợp với MongoDB.

## 🎯 Tổng quan

LibAI là một ứng dụng giàu tính năng được thiết kế để hợp lý hóa các hoạt động của thư viện. Nó bao gồm:

- **Giao diện thân thiện với người dùng** để tìm kiếm, mượn và quản lý sách.
- **Bảng điều khiển quản trị** để quản lý người dùng, sách và xem thống kê.
- **Xác thực dựa trên JWT** với kiểm soát truy cập dựa trên vai trò.
- **🆕 Tìm kiếm Z39.50** - Tìm kiếm sách từ các thư viện quốc tế (LOC, UW-Madison, OCLC).
- **🆕 Redis Caching** - Cache thông minh cho hiệu suất tối ưu.
- **🆕 Docker Support** - Triển khai dễ dàng với Docker Compose.

## 🚀 Bắt đầu

Để có được một bản sao cục bộ và chạy, vui lòng làm theo hướng dẫn chi tiết trong **[Hướng dẫn Cài đặt](./docs/installation.md)** của chúng tôi.

## 📖 Tài liệu

### Cơ bản
- **[Hướng dẫn Cài đặt](./docs/installation.md)**: Hướng dẫn chi tiết để thiết lập dự án.
- **[Hướng dẫn sử dụng](./docs/usage.md)**: Tìm hiểu cách sử dụng ứng dụng và tài khoản thử nghiệm.
- **[Cấu trúc dự án](./docs/project-structure.md)**: Tổng quan về cấu trúc thư mục của dự án.
- **[Cấu trúc cơ sở dữ liệu](./docs/database-structure.md)**: Chi tiết về các bộ sưu tập MongoDB.

### API & Tích hợp
- **[Tham chiếu API](./docs/api-reference.md)**: Hướng dẫn về tất cả các điểm cuối API có sẵn.
- **[🆕 Z39.50 API](./docs/z3950-api.md)**: Tìm kiếm sách từ thư viện quốc tế.
- **[🆕 Docker Guide](./docs/docker-guide.md)**: Triển khai với Docker & Docker Compose.

### Hỗ trợ
- **[Xử lý sự cố](./docs/troubleshooting.md)**: Các giải pháp cho các sự cố thường gặp.
- **[Hướng dẫn đóng góp](./docs/contributing.md)**: Tìm hiểu cách đóng góp cho dự án.

## 🎨 Ngăn xếp công nghệ

### Frontend
- React 18, TypeScript, Vite
- Tailwind CSS, Ant Design
- React Router, Axios

### Backend
- Flask (Python 3.9+)
- MongoDB (PyMongo, Flask-PyMongo)
- Redis (Cache Layer)
- JWT Authentication
- Z39.50 Integration (YAZ Toolkit)

### DevOps
- Docker & Docker Compose
- Gunicorn (Production Server)
- Redis Cache
- MongoDB Atlas (Cloud) / Local MongoDB

### External APIs
- Library of Congress (LOC) Z39.50
- UW-Madison Z39.50
- OCLC WorldCat Z39.50 (Optional)

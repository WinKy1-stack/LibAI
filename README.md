# 🤖 LibAI - AI-Powered Resource & Knowledge Automation System

> Hệ thống quản lý và tự động hóa xử lý tài nguyên thông minh, tích hợp **Trợ lý AI (Gemini Function Calling)**, đồng bộ dữ liệu đa nguồn và tối ưu hiệu năng bằng caching layer.

## 🎯 Tổng quan & Tính năng nổi bật

LibAI được thiết kế như một nền tảng tự động hóa quy trình truy xuất, xử lý và quản trị dữ liệu tài nguyên cho doanh nghiệp và trường học.

- 🧠 **AI Assistant với Gemini Function Calling:** Hiểu yêu cầu bằng ngôn ngữ tự nhiên, tra cứu dữ liệu và điều phối các tác vụ thông qua hệ thống tools có thể mở rộng.
- 🔄 **Automated Multi-Source API Sync:** Kết nối REST API và giao thức Z39.50 để truy xuất, chuẩn hóa và đồng bộ metadata từ Library of Congress, OCLC và UW-Madison.
- ⚡ **High-Performance Smart Caching:** Redis caching layer giảm truy vấn lặp, giảm tải backend và hướng tới độ trễ phản hồi thấp trong các luồng tra cứu thường xuyên.
- 🛡️ **Enterprise Security & RBAC:** JWT Authentication kết hợp phân quyền theo vai trò cho các luồng người dùng và quản trị.
- 🐳 **Production-Ready Containerization:** Đóng gói frontend, backend, MongoDB và Redis bằng Docker Compose để triển khai nhất quán giữa môi trường.
- 📊 **Operational Dashboards:** Cung cấp các luồng quản trị tài nguyên, người dùng, mượn trả, báo cáo và theo dõi hoạt động hệ thống.

## 🎨 Ngăn xếp công nghệ

### AI & Backend Automation

- **AI Engine:** Google Gemini API, Function Calling và structured output
- **Backend Framework:** Flask, Python 3.11+, Gunicorn
- **Data Layer:** MongoDB, PyMongo và Flask-PyMongo
- **Cache Layer:** Redis với chính sách LRU và persistence
- **Integration Protocols:** RESTful API, Z39.50 và YAZ Toolkit

### Frontend & User Experience

- React 19, TypeScript, Vite
- Tailwind CSS, Ant Design và Material UI
- React Router, TanStack Query, Axios và Recharts

### Security & Infrastructure

- JWT Authentication và Role-Based Access Control
- Docker, Docker Compose và Nginx
- Gunicorn production server

## 🏗️ Kiến trúc hệ thống

```text
[User Query / Natural Language]
		│
		▼
    [React Frontend - Vite]
		│ REST API / JWT
		▼
     [Flask Backend + AI Layer]
		│
	┌──────┴──────┐
	▼             ▼
[Gemini Function] [Redis Cache]
 [Tool Execution]       │
	│                │
	└──────┬─────────┘
		▼
 [External APIs / Z39.50 Sources]
		│
		▼
	[MongoDB Database]
```

## 🚀 Quick Start

### Chạy toàn bộ hệ thống bằng Docker

```bash
git clone https://github.com/Winky1-stack/LibAI.git
cd LibAI
docker compose up -d --build
```

Sau khi khởi chạy:

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

Để cấu hình Gemini và các secret cho môi trường local, tham khảo file `backend/.env.example` và [Hướng dẫn cài đặt](./docs/installation.md).

### Chạy frontend trong môi trường phát triển

```bash
npm install
npm run dev
```

## 📖 Tài liệu hệ thống

- **[Tham chiếu API & AI Endpoints](./docs/api-reference.md):** REST API, xác thực và các luồng AI.
- **[Hướng dẫn triển khai Docker](./docs/docker-guide.md):** Đóng gói và vận hành với Docker Compose.
- **[Cấu trúc cơ sở dữ liệu & Caching](./docs/database-structure.md):** Schema MongoDB và chiến lược Redis caching.
- **[Hướng dẫn tích hợp Koha](./docs/koha-integration.md):** Kết nối và đồng bộ với hệ thống Koha.
- **[Hướng dẫn AI](./docs/KOHA_AI_GUIDE.md):** Kiến trúc trợ lý AI, tools và cấu hình Gemini.
- **[Cấu trúc dự án](./docs/project-structure.md):** Tổng quan các module frontend và backend.
- **[Hướng dẫn cài đặt](./docs/installation.md):** Thiết lập môi trường local từ đầu.
- **[Xử lý sự cố](./docs/troubleshooting.md):** Các vấn đề thường gặp và cách khắc phục.

## 🔐 Biến môi trường chính

Backend sử dụng các nhóm cấu hình sau:

- `GEMINI_API_KEY` và `GEMINI_MODEL` cho AI Assistant.
- `MONGO_URI` cho MongoDB.
- `REDIS_HOST` và `REDIS_PORT` cho caching layer.
- `SECRET_KEY` và `JWT_SECRET_KEY` cho bảo mật ứng dụng.

Không commit secret hoặc API key vào repository. Hãy sử dụng biến môi trường riêng cho từng môi trường triển khai.

## 🧪 Kiểm tra chất lượng

```bash
npm run lint
npm run build
```

Backend có các test và script kiểm tra riêng trong thư mục `backend/`. Xem [Hướng dẫn đóng góp](./docs/contributing.md) để biết quy ước phát triển.

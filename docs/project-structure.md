# Cấu trúc dự án

Tài liệu này cung cấp một cái nhìn tổng quan về cấu trúc thư mục của dự án.

```
LibAI/
├── backend/ # Flask Backend
│ ├── app/
│ │ ├── __init__.py # App factory
│ │ ├── config.py # Cấu hình (chuyển đổi MongoDB)
│ │ ├── models/ # Mô hình dữ liệu
│ │ │ ├── mongodb_schemas.py # Lược đồ MongoDB
│ │ │ └── user.py # Mô hình người dùng
│ │ ├── routes/ # Các tuyến API
│ │ │ ├── auth.py # Xác thực (đăng nhập/đăng ký/đăng xuất)
│ │ │ ├── api.py # Các điểm cuối API chung
│ │ │ └── library_routes.py # API thư viện
│ │ ├── services/ # Logic nghiệp vụ
│ │ │ └── user_service.py # Dịch vụ người dùng
│ │ └── utils/ # Các hàm trợ giúp
│ │ ├── mongo_helper.py # Các tiện ích MongoDB
│ │ ├── validators.py # Xác thực đầu vào
│ │ └── decorators.py # Các decorator tùy chỉnh
│ ├── scripts/
│ │ ├── seed_library_data.py # Tạo dữ liệu mẫu cho cơ sở dữ liệu cục bộ
│ │ ├── seed_to_cloud.py # Tạo dữ liệu mẫu cho cơ sở dữ liệu đám mây
│ │ ├── init_mongodb_indexes.py # Tạo chỉ mục
│ │ └── create_users.py # Tạo người dùng thử nghiệm
│ ├── venv311/ # Môi trường ảo Python 3.11.9 (bị bỏ qua bởi git)
│ ├── .env # Biến môi trường (bị bỏ qua bởi git)
│ ├── .env.example # Mẫu môi trường
│ ├── requirements.txt # Các gói phụ thuộc Python
│ └── run.py # Điểm vào
│
├── src/ # React Frontend
│ ├── components/
│ │ ├── admin/ # Các thành phần quản trị
│ │ │ ├── layout/
│ │ │ │ └── TopBar.tsx # TopBar với nút đăng xuất
│ │ │ ├── dashboard/ # Các thành phần bảng điều khiển
│ │ │ ├── bookManagement/ # Quản lý sách
│ │ │ └── userManagement/ # Quản lý người dùng
│ │ └── user/ # Các thành phần người dùng
│ │ ├── UserLayout.tsx # Bố cục người dùng với nút đăng xuất
│ │ └── auth/ # Đăng nhập/Đăng ký
│ │ ├── LoginPage.tsx # Đăng nhập với 2 cột
│ │ └── RegisterPage.tsx # Đăng ký với 2 cột
│ ├── pages/
│ │ ├── admin/ # Các trang quản trị
│ │ │ ├── DashboardPage.tsx
│ │ │ ├── BooksManagementPage.tsx
│ │ │ └── UserManagementPage.tsx
│ │ └── user/ # Các trang người dùng
│ │ └── UserHomePage.tsx
│ ├── services/
│ │ ├── authService.ts # Máy khách API xác thực
│ │ └── userService.ts # Máy khách API người dùng
│ ├── types/ # Các kiểu TypeScript
│ │ ├── auth.ts # Các kiểu xác thực
│ │ └── index.ts # Các kiểu chung
│ ├── utils/
│ │ └── mongodb.ts # Các tiện ích MongoDB
│ ├── config/
│ │ └── theme.ts # Cấu hình giao diện
│ ├── App.tsx # Định tuyến chính (mặc định là /login)
│ ├── main.tsx # Điểm vào
│ └── index.css # Các kiểu toàn cục
│
├── public/ # Các tài sản tĩnh
├── package.json # Các gói phụ thuộc Node
├── tsconfig.json # Cấu hình TypeScript
├── vite.config.ts # Cấu hình Vite
├── tailwind.config.js # Cấu hình Tailwind
└── README.md # Tệp này
```

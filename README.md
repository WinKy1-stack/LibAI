# 📚 LibAI - Library Management System

> Hệ thống quản lý thư viện hiện đại Full-stack với React Frontend và Flask Backend

## 🎯 Tổng quan dự án

LibAI là hệ thống quản lý thư viện hiện đại full-stack, cung cấp:
- **Frontend (React + TypeScript)**:
  - Giao diện người dùng thân thiện để tìm kiếm và mượn sách
  - Admin Dashboard với quản lý sách, người dùng, và thống kê
  - Responsive Design hoạt động mượt mà trên mobile, tablet và desktop
  - Dark/Light Mode
- **Backend (Flask)**:
  - RESTful API với Flask
  - SQLAlchemy ORM cho database
  - JWT Authentication
  - Database migrations với Flask-Migrate

## 🚀 Quick Start

### 📋 Yêu cầu

**Frontend:**
- **Node.js**: >= 18.0.0 (khuyến nghị LTS)
- **npm**: >= 9.0.0

**Backend:**
- **Python**: >= 3.8.0
- **pip**: Python package manager

**Chung:**
- **Git**: >= 2.0.0

### ⚡ Cài đặt

#### 1️⃣ Frontend Setup

```bash
# Clone repository
git clone https://github.com/LockMan04/LibAI.git
cd lib-ai

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Frontend chạy tại: http://localhost:5173
```

#### 2️⃣ Backend Setup

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env từ .env.example
cp .env.example .env

# Chạy migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Chạy backend server
python run.py

# Backend API chạy tại: http://localhost:5000
```

### 🛠️ Scripts hữu ích

**Frontend:**
```bash
npm run dev      # Chạy dev server với hot reload
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Kiểm tra lỗi code
```

**Backend:**
```bash
python run.py              # Chạy Flask server
flask db migrate           # Tạo migration mới
flask db upgrade           # Apply migrations
flask db downgrade         # Rollback migrations
pytest                     # Chạy tests
```

### 🚀 Chạy Full-Stack Development

Để phát triển full-stack, bạn cần chạy cả frontend và backend cùng lúc:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
python run.py
# Backend: http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend: http://localhost:5173
```

**Kiểm tra kết nối:**
1. Mở browser và truy cập `http://localhost:5173` (Frontend)
2. Kiểm tra backend health: `http://localhost:5000/health`
3. Test API endpoint: `http://localhost:5000/api/users`

**Tip:** Sử dụng `tmux`, `screen`, hoặc VS Code integrated terminal để quản lý nhiều terminal cùng lúc.

## 🏗️ Cấu trúc dự án

```
lib-ai/
├── src/                         # Frontend Source Code
│   ├── pages/                   # Pages (route components)
│   │   └── admin/               # Admin pages
│   │       └── DashboardPage.tsx
│   │
│   ├── components/              # Reusable components
│   │   ├── admin/               # Admin components
│   │   │   ├── layout/          # Layout components
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   └── color.css        # Color configuration
│   │   └── user/                # User-facing components
│   │
│   ├── services/                # API services
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript types
│   ├── config/                  # Configuration files
│   │   └── theme.ts             # Theme configuration
│   │
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── backend/                     # Backend Source Code
│   ├── app/                     # Flask application
│   │   ├── models/              # Database models
│   │   │   ├── __init__.py
│   │   │   └── user.py          # User model
│   │   │
│   │   ├── routes/              # API routes/endpoints
│   │   │   ├── __init__.py
│   │   │   └── api.py           # API endpoints
│   │   │
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   └── user_service.py  # User service
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── __init__.py
│   │   │   └── validators.py    # Data validators
│   │   │
│   │   ├── __init__.py          # App factory
│   │   └── config.py            # Configuration
│   │
│   ├── migrations/              # Database migrations
│   ├── tests/                   # Unit tests
│   │   ├── __init__.py
│   │   └── test_api.py          # API tests
│   │
│   ├── venv/                    # Virtual environment (gitignored)
│   ├── .env                     # Environment variables (gitignored)
│   ├── .env.example             # Environment template
│   ├── .gitignore               # Python gitignore
│   ├── requirements.txt         # Python dependencies
│   ├── run.py                   # Application entry point
│   └── README.md                # Backend documentation
│
├── public/                      # Static assets
├── package.json                 # Node dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
└── README.md                    # This file
```

## 🎨 Tech Stack

### Frontend

**Core:**
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing

**UI Libraries:**
- **Ant Design** - Admin dashboard components
  - `antd` - Core components
  - `@ant-design/icons` - Icon library
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Icon library cho user interface

**Code Quality:**
- **ESLint** - Linting
- **TypeScript ESLint** - TypeScript-specific linting

### Backend

**Framework:**
- **Flask 3.0** - Lightweight Python web framework
- **Flask-SQLAlchemy** - ORM cho database
- **Flask-Migrate** - Database migrations
- **Flask-CORS** - Cross-Origin Resource Sharing

**Authentication & Security:**
- **PyJWT** - JSON Web Tokens
- **bcrypt** - Password hashing

**Database:**
- **SQLite** - Development database (có thể chuyển sang PostgreSQL/MySQL cho production)
- **SQLAlchemy ORM** - Object-Relational Mapping

**Validation & Serialization:**
- **Marshmallow** - Object serialization/deserialization

**Testing:**
- **pytest** - Testing framework

**Environment:**
- **python-dotenv** - Environment variables management

## 📍 Routing & API Endpoints

### Frontend Routes

```tsx
/              → User Interface (UserLayoutTailwind)
/admin         → Admin Dashboard (DashboardPage)
```

### Backend API Endpoints

**Base URL:** `http://localhost:5000`

**Health Check:**
```
GET /health                    → Kiểm tra trạng thái server
GET /api/health                → Kiểm tra trạng thái API
```

**User Management:**
```
GET    /api/users              → Lấy danh sách users
GET    /api/users/<id>         → Lấy thông tin user theo ID
POST   /api/users              → Tạo user mới
PUT    /api/users/<id>         → Cập nhật thông tin user
DELETE /api/users/<id>         → Xóa user
```

**Request/Response Examples:**

Tạo user mới:
```bash
POST /api/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "full_name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "Tạo user thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "created_at": "2025-10-25T00:00:00",
    "updated_at": "2025-10-25T00:00:00"
  }
}
```

## ✨ Backend Features

### Đã triển khai:
- ✅ RESTful API với Flask
- ✅ SQLAlchemy ORM
- ✅ Database migrations (Flask-Migrate)
- ✅ Password hashing với bcrypt
- ✅ Data validation
- ✅ CORS support
- ✅ Application Factory Pattern
- ✅ Blueprint structure
- ✅ Service layer architecture
- ✅ Unit tests với pytest

### Cấu hình môi trường:
Backend hỗ trợ 3 môi trường:
- **Development** - Debug mode, SQLite database
- **Production** - Optimized, có thể dùng PostgreSQL/MySQL
- **Testing** - Isolated test database

### Bảo mật:
- Password được hash bằng bcrypt trước khi lưu database
- Chuẩn bị sẵn JWT authentication (cần tích hợp)
- Input validation cho tất cả endpoints
- Environment variables cho sensitive data

### Testing:
```bash
# Chạy tất cả tests
pytest

# Chạy với coverage report
pytest --cov=app

# Chạy test cụ thể
pytest tests/test_api.py::test_create_user
```

## 🎨 Customization

### Thay đổi màu sắc Admin Dashboard

Edit `src/components/admin/color.css`:

```css
:root {
  --primary: #ff4757;           /* Màu chủ đạo */
  --success: #52c41a;           /* Màu success */
  --warning: #faad14;           /* Màu warning */
  --error: #ff4d4f;             /* Màu error */
  --radius: 12;                 /* Border radius (px) */
  --stat-icon-bg: #ffe5e8;      /* Background icon stat cards */
}
```

### Dark Mode

Toggle dark/light mode qua switch ở TopBar. Theme tự động thay đổi theo data-theme attribute.

## 🔗 Tích hợp Frontend & Backend

### Cấu hình API URL trong Frontend

Tạo file `src/config/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  baseURL: API_BASE_URL,
  users: {
    list: `${API_BASE_URL}/api/users`,
    detail: (id: number) => `${API_BASE_URL}/api/users/${id}`,
    create: `${API_BASE_URL}/api/users`,
    update: (id: number) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id: number) => `${API_BASE_URL}/api/users/${id}`,
  },
  health: `${API_BASE_URL}/api/health`,
};
```

### Tạo API Service trong Frontend

Tạo file `src/services/userService.ts`:

```typescript
import { API_ENDPOINTS } from '@/config/api';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export const userService = {
  async getAllUsers() {
    const response = await fetch(API_ENDPOINTS.users.list);
    return response.json();
  },

  async getUserById(id: number) {
    const response = await fetch(API_ENDPOINTS.users.detail(id));
    return response.json();
  },

  async createUser(data: CreateUserData) {
    const response = await fetch(API_ENDPOINTS.users.create, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateUser(id: number, data: Partial<CreateUserData>) {
    const response = await fetch(API_ENDPOINTS.users.update(id), {
      method: 'PUT',
      headers: {
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
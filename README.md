# 📚 LibAI - Library Management System

> Modern library management system với UI hiện đại cho cả User và Admin

## 🎯 Tổng quan dự án

LibAI là hệ thống quản lý thư viện hiện đại được xây dựng với React + TypeScript, cung cấp:
- **User Interface**: Giao diện người dùng thân thiện để tìm kiếm và mượn sách
- **Admin Dashboard**: Quản lý sách, người dùng, và thống kê
- **Responsive Design**: Hoạt động mượt mà trên mobile, tablet và desktop
- **Dark/Light Mode**: Hỗ trợ theme sáng/tối

## 🚀 Quick Start

### 📋 Yêu cầu

- **Node.js**: >= 18.0.0 (khuyến nghị LTS)
- **npm**: >= 9.0.0
- **Git**: >= 2.0.0

### ⚡ Cài đặt

```bash
# 1. Clone repository
git clone https://github.com/LockMan04/LibAI.git
cd lib-ai

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev

# 4. Mở trình duyệt
# Truy cập: http://localhost:5173
```

### 🛠️ Scripts hữu ích

```bash
npm run dev      # Chạy dev server với hot reload
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Kiểm tra lỗi code
```

## 🏗️ Cấu trúc dự án

```
lib-ai/
├── src/
│   ├── pages/              # Pages (route components)
│   │   └── admin/          # Admin pages
│   │       └── DashboardPage.tsx
│   │
│   ├── components/         # Reusable components
│   │   ├── admin/          # Admin components
│   │   │   ├── layout/     # Layout components (Sidebar, TopBar, AdminLayout)
│   │   │   ├── dashboard/  # Dashboard components (StatCard, Tables, etc.)
│   │   │   └── color.css   # Color configuration
│   │   └── user/           # User-facing components
│   │
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── config/             # Configuration files
│   │   └── theme.ts        # Theme configuration
│   │
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Tech Stack

### Core
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing

### UI Libraries
- **Ant Design** - Admin dashboard components
  - `antd` - Core components
  - `@ant-design/icons` - Icon library
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Icon library cho user interface

### Database
- **MongoDB** - NoSQL database

### Code Quality
- **ESLint** - Linting
- **TypeScript ESLint** - TypeScript-specific linting

## 📍 Routing

```tsx
/              → User Interface (UserLayoutTailwind)
/admin         → Admin Dashboard (DashboardPage)
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

### Port đã được sử dụng
```bash
# Thay đổi port trong vite.config.ts hoặc kill process
npx kill-port 5173
```

### Node modules lỗi
```bash
# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Clear TypeScript cache
npm run build -- --force
```
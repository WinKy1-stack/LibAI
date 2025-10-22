# Lib-AI Project

## ✅ Hoàn thành

Dự án đã được setup với:

### 1. Cấu trúc thư mục
```
src/
├── components/
│   ├── user/          # User components (Heroicons)
│   └── admin/         # Admin components (MUI)
├── services/          # Business logic & API calls
├── utils/             # Utilities (MongoDB, helpers)
├── types/             # TypeScript types
└── config/            # Config files (theme, etc.)
```

### 2. Thư viện đã cài
- ✅ **@heroicons/react** - Icons cho user UI
- ✅ **@mui/material** - Material-UI cho admin dashboard
- ✅ **@mui/icons-material** - MUI icons
- ✅ **@emotion/react** & **@emotion/styled** - CSS-in-JS
- ✅ **mongodb** - MongoDB driver

### 3. Files đã tạo

**Config:**
- `src/config/theme.ts` - MUI theme customization
- `.env.example` - Environment variables template

**Utils:**
- `src/utils/mongodb.ts` - MongoDB connection với pooling

**Types:**
- `src/types/index.ts` - Common TypeScript interfaces

**Components:**
- `src/components/user/UserLayout.tsx` - Layout với Heroicons
- `src/components/user/UserLayout.css` - Styling cho user UI
- `src/components/admin/AdminDashboard.tsx` - Admin dashboard với MUI

**Services:**
- `src/services/userService.ts` - User CRUD operations

**App:**
- `src/App.tsx` - Main app với toggle User/Admin view

### 4. Chạy dự án

```powershell
# Dev server (đã chạy)
npm run dev
# -> http://localhost:5173

# Build
npm run build

# Lint
npm run lint
```

### 5. Sử dụng

**Toggle giữa User và Admin view** bằng buttons ở góc phải trên.

**User View:** Sử dụng Heroicons  
**Admin View:** Sử dụng Material-UI

### 6. MongoDB Setup

1. Copy `.env.example` thành `.env`:
```powershell
copy .env.example .env
```

2. Cập nhật MongoDB URI trong `.env`:
```env
VITE_MONGODB_URI=mongodb://localhost:27017
VITE_DB_NAME=lib-ai-db
```

3. Sử dụng trong code:
```typescript
import { connectToMongoDB } from './utils/mongodb';
import { userService } from './services/userService';

// Kết nối
const { db } = await connectToMongoDB();

// Hoặc dùng service
const users = await userService.getAllUsers();
```

### 7. Next steps (optional)

- Cài `react-router-dom` cho routing
- Thêm authentication
- Tạo API endpoints (Express/Fastify)
- Thêm state management (Zustand/Redux)

---

Mọi thứ đã sẵn sàng! 🚀

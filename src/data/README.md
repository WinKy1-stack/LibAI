# 📊 Mock Data - Hướng dẫn sử dụng

Thư mục này chứa tất cả dữ liệu mẫu (mock data) cho ứng dụng LibAI. Tất cả các components nên import dữ liệu từ đây thay vì hardcode trực tiếp trong component.

## 🗂️ Cấu trúc Files

### Admin Mock Data

#### 1. `mockBooks.ts` - Quản lý sách
**Sử dụng cho:** Admin Books Management Page

**Exports:**
- `adminBooks: AdminBook[]` - Danh sách 16 cuốn sách mẫu
- `categoryDistribution` - Phân bố sách theo danh mục
- `monthlyBorrowTrend` - Xu hướng mượn/trả theo tháng
- `latestBookActivities` - Hoạt động mới nhất

**Types:**
```typescript
type BookStatus = "available" | "loaned" | "reserved" | "archived";
type BookFormat = "hardcover" | "paperback" | "ebook" | "audiobook";
interface AdminBook { id, title, isbn, author, category, ... }
```

#### 2. `mockBorrows.ts` - Quản lý mượn trả
**Sử dụng cho:** Admin Borrow Management Page

**Exports:**
- `borrowRecords: BorrowRecord[]` - 12 phiếu mượn mẫu
- `borrowTrendData` - Xu hướng mượn trả theo tháng
- `statusDistribution` - Phân bố trạng thái
- `latestBorrowActivities` - 5 hoạt động mới nhất

**Types:**
```typescript
type BorrowStatus = "borrowed" | "returned" | "overdue" | "lost";
interface BorrowRecord { id, userId, userName, bookId, borrowDate, ... }
```

#### 3. `mockDashboard.ts` - Dashboard
**Sử dụng cho:** Admin Dashboard Page

**Exports:**
- `bookIssuedData` - Sách đã mượn
- `dashboardUsers` - Người dùng dashboard
- `dashboardBooks` - Sách dashboard
- `topChoices` - Top sách được chọn
- `visitorsBorrowersData` - Dữ liệu biểu đồ
- `dashboardStats` - Thống kê tổng quan

#### 4. `mockDashboardStats.ts` - Dashboard Stats
**Sử dụng cho:** Admin Dashboard Page Stats Cards

**Exports:**
- `dashboardStatsData` - Số liệu thống kê dashboard
  - `totalVisitors: string` - Tổng lượt truy cập
  - `booksIssued: string` - Sách đã mượn
  - `overdueBooks: string` - Sách quá hạn
  - `newMembers: string` - Thành viên mới

#### 5. `mockUsers.ts` - Quản lý người dùng
**Sử dụng cho:** Admin User Management Page

**Exports:**
- `adminUsers: AdminUser[]` - 10 người dùng mẫu
- `userRetentionTrend` - Xu hướng giữ chân user
- `userRoleDistribution` - Phân bố vai trò
- `latestUserActivities` - Hoạt động mới

**Types:**
```typescript
type UserStatus = "active" | "pending" | "inactive" | "banned";
type UserRole = "student" | "teacher" | "librarian" | "administrator";
interface AdminUser { id, name, email, role, department, ... }
```

#### 6. `mockReports.ts` - Báo cáo
**Sử dụng cho:** Admin Report Page

**Exports:**
- `adminReports` - 7 báo cáo mẫu
- `monthlyRevenue` - Doanh thu theo tháng
- `weeklyActivity` - Hoạt động theo tuần
- `categoryPerformance` - Hiệu suất danh mục
- `topMetrics` - Top sách/user/danh mục
- `overviewMetrics` - Tổng quan metrics

**Types:**
```typescript
type ReportType = "daily" | "weekly" | "monthly" | "yearly";
type ReportStatus = "generated" | "processing" | "scheduled";
type ReportCategory = "books" | "users" | "financial" | "activity" | "overdue";
```

#### 7. `mockFaq.ts` - FAQ Management
**Sử dụng cho:** Admin FAQ Page

**Exports:**
- `faqCategories` - 6 danh mục FAQ
- `mockFaqItems` - 13 câu hỏi mẫu
- `faqStats` - Thống kê tổng quan
- `faqCategoryDistribution` - Phân bố theo danh mục
- `latestFaqActivities` - Hoạt động mới

#### 8. `mockLibrarian.ts` - Cài đặt thủ thư
**Sử dụng cho:** Librarian Settings Page

**Exports:**
- `defaultLibrarianProfile` - Profile mặc định
- `defaultLibrarianPreferences` - Tùy chọn hiển thị
- `defaultLibrarianNotifications` - Cài đặt thông báo
- `languageOptions` - Tùy chọn ngôn ngữ
- `notificationFrequencyOptions` - Tần suất thông báo

#### 9. `mockOverdueBooks.ts` - Sách quá hạn
**Sử dụng cho:** Overdue Books Table

**Exports:**
- `mockOverdueBooks: OverdueBook[]` - 10 sách quá hạn mẫu

### User Mock Data

#### 10. `mockUserSuggestions.ts` - Gợi ý User
**Sử dụng cho:** User Home Page - Suggestion Cards

**Exports:**
- `userSuggestions: UserSuggestionItem[]` - 4 câu gợi ý chat

**Types:**
```typescript
interface UserSuggestionItem {
  icon: string;
  text: string;
}
```

#### 11. `mockUserChatBooks.ts` - Sách gợi ý User
**Sử dụng cho:** Chat View - Book Suggestions

**Exports:**
- `userChatBooks: UserChatBook[]` - 4 cuốn sách gợi ý

**Types:**
```typescript
interface UserChatBook {
  id: number;
  title: string;
  author: string;
  rating: number;
  reviews: number;
  status: 'available' | 'borrowed';
  bestMatch?: boolean;
}
```

## 📖 Cách sử dụng

### Import từ index.ts (Recommended)

```typescript
// Import tất cả cùng lúc
import { 
  adminBooks, 
  borrowRecords, 
  dashboardStats,
  userSuggestions 
} from '@/data';

// Hoặc từ src
import { adminBooks } from '../../data';
```

### Import trực tiếp từ file

```typescript
// Import từ file cụ thể
import { adminBooks, categoryDistribution } from '@/data/mockBooks';
import { borrowRecords } from '@/data/mockBorrows';
```

## ✅ Best Practices

### 1. **KHÔNG hardcode dữ liệu trong components**

❌ **Bad:**
```typescript
function MyComponent() {
  const books = [
    { id: 1, title: "Book 1" },
    { id: 2, title: "Book 2" }
  ];
  
  return <div>{books.map(...)}</div>;
}
```

✅ **Good:**
```typescript
import { adminBooks } from '@/data';

function MyComponent() {
  return <div>{adminBooks.map(...)}</div>;
}
```

### 2. **Tạo file mock mới khi cần**

Nếu bạn cần dữ liệu mẫu mới:
1. Tạo file `mockYourFeature.ts` trong thư mục `src/data`
2. Export interfaces và data
3. Thêm export vào `index.ts`

**Ví dụ:**
```typescript
// src/data/mockNotifications.ts
export interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

export const mockNotifications: Notification[] = [
  { id: "1", message: "Test", timestamp: "2025-01-01" }
];
```

```typescript
// src/data/index.ts
export * from './mockNotifications';
```

### 3. **Sử dụng TypeScript Types**

Luôn định nghĩa types cho dữ liệu mẫu:

```typescript
// Define type/interface first
export interface Book {
  id: string;
  title: string;
  author: string;
}

// Then create mock data
export const mockBooks: Book[] = [
  { id: "1", title: "Sample", author: "Author" }
];
```

### 4. **Nhóm dữ liệu liên quan**

Gom các dữ liệu liên quan vào cùng một file:

```typescript
// mockBooks.ts
export const adminBooks = [...];
export const categoryDistribution = [...];
export const monthlyBorrowTrend = [...];
export const latestBookActivities = [...];
```

## 🔧 Maintenance

### Khi thêm dữ liệu mới:
1. Tạo file mock mới trong `src/data/`
2. Export types và data
3. Cập nhật `index.ts`
4. Cập nhật file README này

### Khi sửa dữ liệu:
1. Tìm file mock tương ứng
2. Sửa dữ liệu
3. Kiểm tra tất cả components sử dụng data đó

### Khi xóa dữ liệu:
1. Kiểm tra không còn component nào sử dụng
2. Xóa export từ `index.ts`
3. Xóa file mock
4. Cập nhật README

## 📝 Notes

- Tất cả mock data đều là dữ liệu TĨNH, không kết nối database
- Khi tích hợp API thực, thay thế mock data bằng API calls
- Giữ cấu trúc types nhất quán giữa mock data và API response
- Mock data giúp phát triển UI nhanh hơn khi chưa có backend

## 🎯 Migration to Real API

Khi có API thực sự, thay thế như sau:

```typescript
// Before (Mock Data)
import { adminBooks } from '@/data';

function BooksPage() {
  return <Table dataSource={adminBooks} />;
}

// After (Real API)
import { useEffect, useState } from 'react';
import { fetchBooks } from '@/api/books';

function BooksPage() {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    fetchBooks().then(setBooks);
  }, []);
  
  return <Table dataSource={books} />;
}
```

---

**Last Updated:** November 3, 2025
**Maintained by:** LibAI Development Team


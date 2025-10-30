# User Components (Tóm tắt)

## Cấu trúc

```
components/user/
├── auth/         # Login, Register, Protected/PublicRoute
├── home/         # HeroSection, SearchBar, SuggestionsGrid
├── chat/         # ChatMessages, BookSuggestions, FeedbackButtons
├── layout/       # TopBar, UserLayout
├── color.css     # Styles (dark/light, responsive)
└── utils.ts      # Helpers
```

## Thành phần chính
- HeroSection: tiêu đề hero + avatar + mô tả.
- SearchBar: ô tìm kiếm + icon trái/phải, submit.
- SuggestionsGrid: gợi ý nhanh.

- ChatMessages: danh sách tin nhắn + typing indicator.
- BookSuggestions: gợi ý sách (grid), rating, trạng thái.
- FeedbackButtons: like/dislike/refresh.

<!-- ChatInput component currently not included in codebase; kept for future -->

## Layout
- TopBar: logo, chuyển theme, avatar user, nút đăng nhập.
- UserLayout: nền theo theme, cố định TopBar, vùng nội dung.

## Styling
- `color.css` dùng biến màu (CSS variables), gradients, shadow.
- Dark/Light thông qua `data-theme` và biến màu.
- Breakpoints chính: 1200/1024/768/640/480.

## Thay đổi gần đây (30/10/2025)

### Refactoring
1. ✅ Tách `UserHomePage.tsx` thành các components nhỏ
2. ✅ Tạo folder `home/` cho home page components
3. ✅ Tạo folder `chat/` cho chat interface components
4. ✅ Tạo `index.ts` files cho clean imports
5. ✅ Export types từ `ChatMessages.tsx`
6. ✅ Fixed TypeScript import issues (FormEvent type-only import)

**Benefits:**
- Code dễ đọc và bảo trì hơn
- Components có thể tái sử dụng
- Cấu trúc tương tự admin components
- Dễ test từng component riêng biệt

### TopBar
1. ✅ Chỉnh nút "Đăng nhập" lớn hơn với padding phù hợp
2. ✅ Thay button theme toggle bằng Ant Design Switch
3. ✅ Chỉnh user avatar và name có kích thước giống admin
4. ✅ Thêm margin right cho các elements tránh sát lề
5. ✅ Cải thiện spacing và gap giữa các elements

### Light Mode
1. ✅ Thêm màu chữ cho `.book-title` trong light mode
2. ✅ Thêm màu cho `.book-rating` trong light mode
3. ✅ Cải thiện contrast của các text elements

### Feedback Icons
1. ✅ Thay emoji icons bằng Heroicons (outline)
2. ✅ Thêm CSS cho icon colors trong dark/light mode
3. ✅ Hover effects cho feedback buttons

### Mobile & Routing
1. ✅ `UserHomePage.tsx` refactor dùng `HeroSection`, `SearchBar`, `SuggestionsGrid`, `ChatMessages`, `BookSuggestions`, `FeedbackButtons`
2. ✅ Đồng bộ layout Login/Register (bỏ inline styles, dùng Tailwind, căn trái giống nhau, 3 gạch chuyển xuống gần cuối bằng absolute)
3. ✅ Ẩn cột trái (gradient) trên mobile/tablet, form full width; ẩn logo link trên auth khi mobile
4. ✅ Màu sắc light mode:
   - `.book-title`, `.book-rating` ổn định, không đổi khi hover
   - Nút trạng thái "Đã mượn": chữ tối trong light mode
   - Bong bóng chat của người dùng: nền trắng, chữ tối trong light mode
   - Nút gửi cố định: chữ tối trong light mode, thu gọn trên mobile nhỏ
   - Nút "Đăng nhập" TopBar và ở Home: chữ tối trong light mode, luôn hiện đầy đủ chữ
   - Icon hero và logo TopBar dùng `currentColor`, đổi màu theo theme
5. ✅ Social buttons: căn icon Google/Apple sát chữ trên Login/Register
6. ✅ Checkbox "Tôi đồng ý..." mặc định không còn được tick

Kết quả: UI thống nhất, responsive tốt (768/640/480), light mode rõ ràng, điều hướng sau đăng nhập ổn định theo role.
## Ví dụ sử dụng (rút gọn)
- Xem `src/pages/user/UserHomePage.tsx` để thấy cách ghép các components.

## Liên quan
- `src/pages/user/UserHomePage.tsx`
- `src/hooks/useUserTheme.ts`
- `src/contexts/ChatContext.tsx`


# Hướng dẫn sử dụng Admin Theme

## 1. Tổng quan

Admin theme được quản lý tập trung thông qua hệ thống theming của Ant Design v5, hỗ trợ đầy đủ **Light Mode** và **Dark Mode**.

**"Nguồn chân lý duy nhất" (Single Source of Truth)** cho mọi giá trị thiết kế (màu sắc, font, bo góc,...) là file cấu hình theme của Ant Design.

### File cấu hình chính:
- `src/config/adminTheme.ts` - **Nơi duy nhất** để định nghĩa và thay đổi các giá trị theme.
- `src/hooks/useAdminTheme.ts` - Hook quản lý việc chuyển đổi giữa light/dark mode.
- `src/components/admin/color.css` - Chứa các style global và ghi đè (overrides), **không chứa biến màu**.

---

## 2. Cách sử dụng Theme trong Component (Best Practice)

Để đảm bảo tính nhất quán và dễ bảo trì, hãy luôn sử dụng hook `theme.useToken()` do Ant Design cung cấp để truy cập các giá trị theme trong các component React.

### Ví dụ sử dụng trong React Component:

```tsx
import { Card, theme } from 'antd';

export function MyStyledCard() {
  // 1. Lấy ra đối tượng `token` từ hook
  const { token } = theme.useToken();

  // 2. Sử dụng các giá trị trong token để style cho component
  //    - token.colorPrimary, token.colorBgContainer, token.borderRadiusLG, ...
  //    - Tên các token tương ứng với cấu hình trong `adminTheme.ts`
  return (
    <Card
      style={{
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary, // Dùng màu viền phụ
        borderRadius: token.borderRadiusLG,
      }}
    >
      <h3 style={{ color: token.colorPrimary, marginBottom: '16px' }}>
        Tiêu đề Card
      </h3>
      <p style={{ color: token.colorTextSecondary }}>
        Nội dung mô tả. Hook `useToken` sẽ tự động cung cấp giá trị
        đúng cho cả Light và Dark mode.
      </p>
    </Card>
  );
}
```

### Lợi ích của việc dùng `useToken`:
✅ **Nhất quán:** Giao diện luôn đồng bộ với toàn bộ ứng dụng.
✅ **Dễ bảo trì:** Thay đổi giá trị trong `adminTheme.ts`, tất cả component sẽ tự động cập nhật.
✅ **Hỗ trợ Light/Dark Mode tự động:** `token` sẽ chứa giá trị đúng cho theme hiện tại mà không cần thêm logic.

---

## 3. Quy tắc vàng

1.  **LUÔN LUÔN** ưu tiên sử dụng hook `theme.useToken()` để lấy giá trị theme cho việc style (màu sắc, background, border, font-size,...).
2.  **KHÔNG** hard-code các giá trị màu sắc hoặc style trong component.
3.  **CHỈ** sử dụng các file `.css` cho các style global không thể quản lý bằng JS (ví dụ: style thanh cuộn) hoặc các trường hợp ghi đè phức tạp.
4.  Khi phát triển component mới, hãy luôn kiểm tra giao diện trên cả Light và Dark mode.


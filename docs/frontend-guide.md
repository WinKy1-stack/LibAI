# Hướng Dẫn Frontend

Tài liệu này cung cấp một cái nhìn tổng quan về kiến trúc frontend, các thành phần và các quy ước về văn phong.

## Cấu Trúc Thành Phần Người Dùng

Giao diện người dùng được chia thành các thành phần có thể tái sử dụng:

```
components/user/
├── auth/         # Đăng nhập, Đăng ký, Protected/PublicRoute
├── home/         # HeroSection, SearchBar, SuggestionsGrid
├── chat/         # ChatMessages, BookSuggestions, FeedbackButtons
├── layout/       # TopBar, UserLayout
├── color.css     # Các kiểu (tối/sáng, đáp ứng)
└── utils.ts      # Các hàm trợ giúp
```

## Thành Phần Quản Trị Chung

### Modal Biểu Mẫu Chung

Một modal biểu mẫu có thể tái sử dụng để thêm hoặc chỉnh sửa các thực thể như người dùng, sách, v.v.

**Cách Sử Dụng Cơ Bản:**

```tsx
import { GenericFormModal, type FormField } from '@/components/admin/common';

// Định nghĩa các trường của bạn
const userFields: FormField[] = [
  { name: "name", label: "Họ và tên", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "role", label: "Vai trò", type: "select", options: [...] }
];

// Sử dụng trong thành phần của bạn
<GenericFormModal
  title="User"
  visible={modalVisible}
  editItem={editingUser}
  fields={userFields}
  onClose={() => setModalVisible(false)}
  onSave={(user) => console.log("Đã lưu:", user)}
/>
```

## Sử Dụng Theme Quản Trị

Theme quản trị được quản lý tập trung bằng Ant Design v5 và hỗ trợ cả chế độ Sáng và Tối.

### Thực Hành Tốt Nhất

Luôn sử dụng hook `theme.useToken()` do Ant Design cung cấp để truy cập các giá trị theme trong các thành phần React.

**Ví Dụ:**

```tsx
import { Card, theme } from 'antd';

export function MyStyledCard() {
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <h3 style={{ color: token.colorPrimary }}>
        Tiêu đề Card
      </h3>
    </Card>
  );
}
```

### Quy Tắc Vàng

1.  **LUÔN** ưu tiên sử dụng hook `theme.useToken()` để lấy các giá trị theme.
2.  **KHÔNG** mã hóa cứng các giá trị màu sắc hoặc kiểu.
3.  **CHỈ** sử dụng các tệp `.css` cho các kiểu toàn cục không thể quản lý bằng JS.
4.  Luôn kiểm tra các thành phần mới trong cả chế độ Sáng và Tối.

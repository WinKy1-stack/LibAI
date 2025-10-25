# Generic Form Modal Component

Modal form tái sử dụng cho nhiều mục đích: thêm user, book, FAQ, v.v.

## 📦 Import

```tsx
import { GenericFormModal, type FormField } from '@/components/admin/common';
```

## 🚀 Cách sử dụng cơ bản

### 1. Thêm/Sửa User

```tsx
import { useState } from "react";
import { GenericFormModal, type FormField } from "./common";

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
}

function UserPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const userFields: FormField[] = [
    {
      name: "name",
      label: "Họ và tên",
      type: "text",
      required: true,
      placeholder: "Nhập họ tên...",
      span: { xs: 24, sm: 24, md: 12 },
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      required: true,
      placeholder: "email@example.com",
      span: { xs: 24, sm: 24, md: 12 },
      rules: [
        { required: true, message: "Vui lòng nhập email!" },
        { type: "email", message: "Email không hợp lệ!" },
      ],
    },
    {
      name: "role",
      label: "Vai trò",
      type: "select",
      required: true,
      span: { xs: 24, sm: 24, md: 24 },
      options: [
        { label: "Admin", value: "admin" },
        { label: "Member", value: "member" },
      ],
    },
  ];

  return (
    <>
      <button onClick={() => { setEditingUser(null); setModalVisible(true); }}>
        Thêm User
      </button>

      <GenericFormModal
        title="User"
        visible={modalVisible}
        editItem={editingUser}
        fields={userFields}
        onClose={() => setModalVisible(false)}
        onSave={(user) => {
          console.log("Saved:", user);
          // Save to API/State
        }}
        initialValues={{ role: "member" }}
      />
    </>
  );
}
```

### 2. Thêm/Sửa Book

```tsx
const bookFields: FormField[] = [
  {
    name: "title",
    label: "Tên sách",
    type: "text",
    required: true,
    span: { xs: 24, sm: 24, md: 16 },
  },
  {
    name: "isbn",
    label: "ISBN",
    type: "text",
    required: true,
    span: { xs: 24, sm: 24, md: 8 },
  },
  {
    name: "author",
    label: "Tác giả",
    type: "text",
    required: true,
    span: { xs: 24, sm: 12, md: 12 },
  },
  {
    name: "category",
    label: "Danh mục",
    type: "select",
    required: true,
    span: { xs: 24, sm: 12, md: 12 },
    options: [
      { label: "Fiction", value: "fiction" },
      { label: "Science", value: "science" },
    ],
  },
  {
    name: "publishYear",
    label: "Năm xuất bản",
    type: "number",
    min: 1900,
    max: 2024,
    span: { xs: 24, sm: 12, md: 6 },
  },
  {
    name: "quantity",
    label: "Số lượng",
    type: "number",
    min: 0,
    span: { xs: 24, sm: 12, md: 6 },
  },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea",
    rows: 4,
    maxLength: 500,
    span: { xs: 24, sm: 24, md: 24 },
  },
];

<GenericFormModal
  title="Book"
  visible={visible}
  editItem={editingBook}
  fields={bookFields}
  onClose={() => setVisible(false)}
  onSave={handleSave}
  width={900}
/>
```

## 📋 Field Types

| Type | Description | Props |
|------|-------------|-------|
| `text` | Input text | `placeholder`, `maxLength` |
| `textarea` | TextArea | `rows`, `maxLength`, `placeholder` |
| `select` | Dropdown | `options`, `placeholder` |
| `number` | Number input | `min`, `max`, `placeholder` |
| `date` | Date picker | - |
| `custom` | Custom component | `render` function |

## 🎨 Responsive Grid

```tsx
span: { 
  xs: 24,  // Mobile: full width
  sm: 12,  // Tablet: half width
  md: 8    // Desktop: 1/3 width
}
```

## 🔧 Advanced: Custom Field

```tsx
{
  name: "tags",
  label: "Tags",
  type: "custom",
  span: { xs: 24, sm: 24, md: 24 },
  render: (value, onChange) => (
    <TagInput
      value={value}
      onChange={onChange}
    />
  ),
}
```

## 🎯 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Modal title |
| `visible` | boolean | Yes | Show/hide modal |
| `editItem` | T \| null | Yes | Item to edit (null = add new) |
| `fields` | FormField[] | Yes | Form fields config |
| `onClose` | function | Yes | Close handler |
| `onSave` | function | Yes | Save handler |
| `initialValues` | object | No | Default values |
| `width` | number | No | Modal width (default: 800) |

## ✨ Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Built-in validation
- ✅ Auto-generated ID & timestamps
- ✅ Loading states
- ✅ Success messages
- ✅ TypeScript support
- ✅ Reusable for any entity


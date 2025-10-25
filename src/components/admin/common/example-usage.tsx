// EXAMPLE: How to use GenericFormModal for different purposes

import { useState } from "react";
import GenericFormModal, { type FormField } from "./GenericFormModal";
import { Tag, Space } from "antd";
import { UserOutlined, BookOutlined } from "@ant-design/icons";

// ==================== EXAMPLE 1: Add/Edit User ====================
interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
}

export function UserManagementExample() {
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
      name: "phone",
      label: "Số điện thoại",
      type: "text",
      placeholder: "0123456789",
      span: { xs: 24, sm: 12, md: 8 },
    },
    {
      name: "role",
      label: "Vai trò",
      type: "select",
      required: true,
      span: { xs: 24, sm: 12, md: 8 },
      options: [
        { label: "Admin", value: "admin" },
        { label: "Librarian", value: "librarian" },
        { label: "Member", value: "member" },
      ],
    },
    {
      name: "department",
      label: "Phòng ban",
      type: "select",
      span: { xs: 24, sm: 24, md: 8 },
      options: [
        { label: "IT", value: "it" },
        { label: "HR", value: "hr" },
        { label: "Library", value: "library" },
      ],
    },
  ];

  const handleSaveUser = (user: Partial<User>) => {
    console.log("Saved user:", user);
    // Add your save logic here
    setModalVisible(false);
  };

  return (
    <>
      <button onClick={() => { setEditingUser(null); setModalVisible(true); }}>
        Add User
      </button>

      <GenericFormModal
        title="User"
        visible={modalVisible}
        editItem={editingUser}
        fields={userFields}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveUser}
        initialValues={{ role: "member" }}
      />
    </>
  );
}

// ==================== EXAMPLE 2: Add/Edit Book ====================
interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishYear: number;
  quantity: number;
  description: string;
}

export function BookManagementExample() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const bookFields: FormField[] = [
    {
      name: "title",
      label: "Tên sách",
      type: "text",
      required: true,
      placeholder: "Nhập tên sách...",
      span: { xs: 24, sm: 24, md: 16 },
    },
    {
      name: "isbn",
      label: "ISBN",
      type: "text",
      required: true,
      placeholder: "978-3-16-148410-0",
      span: { xs: 24, sm: 24, md: 8 },
    },
    {
      name: "author",
      label: "Tác giả",
      type: "text",
      required: true,
      placeholder: "Nhập tên tác giả...",
      span: { xs: 24, sm: 12, md: 8 },
    },
    {
      name: "category",
      label: "Danh mục",
      type: "select",
      required: true,
      span: { xs: 24, sm: 12, md: 8 },
      options: [
        { label: "Fiction", value: "fiction" },
        { label: "Science", value: "science" },
        { label: "History", value: "history" },
        { label: "Technology", value: "technology" },
      ],
    },
    {
      name: "publishYear",
      label: "Năm xuất bản",
      type: "number",
      required: true,
      min: 1900,
      max: new Date().getFullYear(),
      span: { xs: 24, sm: 12, md: 4 },
    },
    {
      name: "quantity",
      label: "Số lượng",
      type: "number",
      required: true,
      min: 0,
      span: { xs: 24, sm: 12, md: 4 },
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      rows: 4,
      maxLength: 500,
      placeholder: "Nhập mô tả về cuốn sách...",
      span: { xs: 24, sm: 24, md: 24 },
    },
  ];

  const handleSaveBook = (book: Partial<Book>) => {
    console.log("Saved book:", book);
    // Add your save logic here
    setModalVisible(false);
  };

  return (
    <>
      <button onClick={() => { setEditingBook(null); setModalVisible(true); }}>
        Add Book
      </button>

      <GenericFormModal
        title="Book"
        visible={modalVisible}
        editItem={editingBook}
        fields={bookFields}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveBook}
        initialValues={{ quantity: 1, publishYear: new Date().getFullYear() }}
        width={900}
      />
    </>
  );
}

// ==================== EXAMPLE 3: Custom Field with Icons ====================
export function CustomFieldExample() {
  const [modalVisible, setModalVisible] = useState(false);

  const customFields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      span: { xs: 24, sm: 24, md: 12 },
    },
    {
      name: "status",
      label: "Status with Icons",
      type: "select",
      required: true,
      span: { xs: 24, sm: 24, md: 12 },
      options: [
        { 
          label: <Space><UserOutlined /> Active</Space>, 
          value: "active" 
        },
        { 
          label: <Space><BookOutlined /> Inactive</Space>, 
          value: "inactive" 
        },
      ],
    },
    {
      name: "tags",
      label: "Custom Tags Field",
      type: "custom",
      span: { xs: 24, sm: 24, md: 24 },
      render: (value, onChange) => {
        // Your custom component here
        return (
          <div>
            <Tag color="blue">Custom</Tag>
            <Tag color="green">Field</Tag>
            <input 
              value={(value as string) || ""} 
              onChange={(e) => onChange(e.target.value)}
              placeholder="Custom input..."
            />
          </div>
        );
      },
    },
  ];

  return (
    <GenericFormModal
      title="Custom Item"
      visible={modalVisible}
      editItem={null}
      fields={customFields}
      onClose={() => setModalVisible(false)}
      onSave={(item) => console.log("Saved:", item)}
    />
  );
}


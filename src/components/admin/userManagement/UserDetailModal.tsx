import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Avatar,
  Typography,
  Divider,
  App as AntdApp,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { AdminUser } from "../../../data";
import { formatDate } from "./utils";
import type { UpdateUserData } from "../../../services/userService";

const { Text, Title } = Typography;

interface UserDetailModalProps {
  visible: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onUpdate: (userId: string, data: UpdateUserData) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export function UserDetailModal({
  visible,
  user,
  onClose,
  onUpdate,
  onDelete,
}: UserDetailModalProps) {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { notification } = AntdApp.useApp();

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role === 'administrator' ? 'admin' : user.role === 'student' ? 'reader' : user.role === 'librarian' ? 'librarian' : 'reader',
        status: user.status,
        major: user.department || '',
      });
      setIsEditing(false);
    } else if (!visible) {
      form.resetFields();
      setIsEditing(false);
    }
  }, [visible, user, form]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      // Map role back to API format
      const roleMap: Record<string, 'admin' | 'librarian' | 'reader'> = {
        'admin': 'admin',
        'librarian': 'librarian',
        'reader': 'reader',
        'administrator': 'admin',
        'student': 'reader',
      };
      
      await onUpdate(user.id, {
        name: values.name,
        email: values.email,
        role: roleMap[values.role] || 'reader',
        status: values.status,
        major: values.major || '',
      });
      
      setIsEditing(false);
      notification.success({
        message: 'Thành công',
        description: 'Cập nhật thông tin người dùng thành công!',
        placement: 'topRight',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        // Validation errors are already shown by form
        return;
      }
      notification.error({
        message: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật!',
        placement: 'topRight',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setDeleting(true);
      await onDelete(user.id);
      notification.success({
        message: 'Thành công',
        description: 'Xóa người dùng thành công!',
        placement: 'topRight',
      });
      onClose();
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa!',
        placement: 'topRight',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role === 'administrator' ? 'admin' : user.role === 'student' ? 'reader' : user.role === 'librarian' ? 'librarian' : 'reader',
        status: user.status,
        major: user.department || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <Modal
      title={
        <Space>
          <Avatar
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user.email || 'user'}`}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.name}
            </Title>
            <Text type="secondary">{user.id}</Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={
        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          {isEditing ? (
            <>
              <Button onClick={handleCancel} disabled={saving}>
                <CloseOutlined /> Hủy
              </Button>
              <Button type="primary" onClick={handleSave} loading={saving}>
                <SaveOutlined /> Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Popconfirm
                title="Xóa người dùng"
                description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: deleting }}
              >
                <Button danger icon={<DeleteOutlined />} loading={deleting}>
                  Xóa
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </Button>
            </>
          )}
        </Space>
      }
    >
      <Form form={form} layout="vertical" disabled={!isEditing}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Basic Info */}
          <div>
            <Title level={5}>Thông tin cơ bản</Title>
            <Divider style={{ margin: "12px 0" }} />
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
            <Form.Item label="Mã số sinh viên">
              <Input value={user.student_id || user.id} disabled />
            </Form.Item>
          </div>

          {/* Role & Status */}
          <div>
            <Title level={5}>Vai trò và trạng thái</Title>
            <Divider style={{ margin: "12px 0" }} />
            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select
                options={[
                  { label: "Người dùng", value: "reader" },
                  { label: "Thủ thư", value: "librarian" },
                  { label: "Quản trị viên", value: "admin" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select
                options={[
                  { label: "Hoạt động", value: "active" },
                  { label: "Chờ duyệt", value: "pending" },
                  { label: "Không hoạt động", value: "inactive" },
                  { label: "Bị cấm", value: "banned" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Chuyên ngành" name="major">
              <Input placeholder="Nhập chuyên ngành..." />
            </Form.Item>
          </div>

          {/* Statistics */}
          {!isEditing && (
            <div>
              <Title level={5}>Thống kê</Title>
              <Divider style={{ margin: "12px 0" }} />
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Tổng lượt mượn:</Text>
                  <Text strong>{user.totalBorrowed}</Text>
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Sách quá hạn:</Text>
                  <Text strong type={user.overdueBooks > 0 ? "danger" : undefined}>
                    {user.overdueBooks}
                  </Text>
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Tỷ lệ hoàn thành:</Text>
                  <Text strong>{user.completionRate}%</Text>
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Ngày gia nhập:</Text>
                  <Text>{formatDate(user.joinDate)}</Text>
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Đăng nhập lần cuối:</Text>
                  <Text>{formatDate(user.lastLogin)}</Text>
                </Space>
              </Space>
            </div>
          )}
        </Space>
      </Form>
    </Modal>
  );
}


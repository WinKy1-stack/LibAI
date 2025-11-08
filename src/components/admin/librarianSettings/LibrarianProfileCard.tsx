import { Card, Form, Input, Button, Space, Typography, Avatar, Upload, Row, Col, App as AntdApp, theme } from "antd";
import { UserOutlined, SaveOutlined, CameraOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile } from "antd";
import { defaultLibrarianProfile } from "../../../data";
import { getLibrarianSettingsColors } from "./constants";

const { Title, Text } = Typography;

export default function LibrarianProfileCard() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState(defaultLibrarianProfile.avatar);
  const { token } = theme.useToken();
  const librarianColors = getLibrarianSettingsColors(token);
  const { notification } = AntdApp.useApp();

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("Profile values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notification.success({
        message: "Cập nhật thông tin thành công!",
        placement: "topRight",
      });
      setSaving(false);
    } catch {
      setSaving(false);
    }
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  };

  return (
    <Card
      variant="borderless"
      style={{
        background: librarianColors.backgrounds.card,
      }}
    >
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* Avatar Section */}
        <Row justify="center">
          <Col>
            <Space direction="vertical" align="center" size={16}>
              <div style={{ position: "relative" }}>
                <Avatar
                  size={120}
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  style={{ border: `4px solid ${librarianColors.borders.secondary}` }}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleUpload}
                  accept="image/*"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}
                  />
                </Upload>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {defaultLibrarianProfile.fullName}
                </Title>
                <Text type="secondary">{defaultLibrarianProfile.position}</Text>
              </div>
            </Space>
          </Col>
        </Row>

        {/* Form Section */}
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultLibrarianProfile}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="example@library.vn" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0912 345 678" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phòng ban"
                name="department"
              >
                <Input disabled placeholder="Phòng ban" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Vị trí"
            name="position"
          >
            <Input disabled placeholder="Vị trí công việc" />
          </Form.Item>

          <Form.Item
            label="Giới thiệu bản thân"
            name="bio"
          >
            <Input.TextArea
              rows={4}
              placeholder="Viết vài dòng về bản thân..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => form.resetFields()}>Hủy</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </Form>
      </Space>
    </Card>
  );
}


import { Card, Form, Input, Select, Switch, Button, Space, Typography, Divider, InputNumber, Row, Col } from "antd";
import { SettingOutlined, SaveOutlined, GlobalOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

interface SystemConfigCardProps {
  mode: "light" | "dark";
}

export default function SystemConfigCard({ mode }: SystemConfigCardProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("System Config values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaving(false);
    } catch (error) {
      setSaving(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <SettingOutlined style={{ fontSize: 20, color: "#52c41a" }} />
          <Title level={4} style={{ margin: 0 }}>
            Cấu hình hệ thống
          </Title>
        </Space>
      }
      variant="borderless"
      style={{
        background: mode === "dark" ? "#141414" : "#fff",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          siteName: "Thư viện AI",
          siteUrl: "https://library.ai.vn",
          adminEmail: "admin@library.ai.vn",
          timezone: "Asia/Ho_Chi_Minh",
          dateFormat: "DD/MM/YYYY",
          language: "vi",
          itemsPerPage: 20,
          sessionTimeout: 30,
          maxUploadSize: 10,
          enableRegistration: true,
          enableMaintenance: false,
          enableAnalytics: true,
          enableDebugMode: false,
        }}
      >
        <Divider orientation="left">
          <Text strong>Thông tin cơ bản</Text>
        </Divider>

        <Form.Item
          label="Tên hệ thống"
          name="siteName"
          rules={[{ required: true, message: "Vui lòng nhập tên hệ thống" }]}
        >
          <Input placeholder="Thư viện AI" />
        </Form.Item>

        <Form.Item
          label="URL hệ thống"
          name="siteUrl"
          rules={[
            { required: true, message: "Vui lòng nhập URL" },
            { type: "url", message: "URL không hợp lệ" },
          ]}
        >
          <Input prefix={<GlobalOutlined />} placeholder="https://library.ai.vn" />
        </Form.Item>

        <Form.Item
          label="Email quản trị"
          name="adminEmail"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input type="email" placeholder="admin@library.ai.vn" />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Định dạng & Ngôn ngữ</Text>
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Múi giờ"
              name="timezone"
              rules={[{ required: true, message: "Vui lòng chọn múi giờ" }]}
            >
              <Select
                showSearch
                placeholder="Chọn múi giờ"
                options={[
                  { label: "Việt Nam (GMT+7)", value: "Asia/Ho_Chi_Minh" },
                  { label: "Bangkok (GMT+7)", value: "Asia/Bangkok" },
                  { label: "Singapore (GMT+8)", value: "Asia/Singapore" },
                  { label: "Tokyo (GMT+9)", value: "Asia/Tokyo" },
                  { label: "UTC", value: "UTC" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Định dạng ngày"
              name="dateFormat"
              rules={[{ required: true, message: "Vui lòng chọn định dạng" }]}
            >
              <Select
                options={[
                  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
                  { label: "DD-MM-YYYY", value: "DD-MM-YYYY" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Ngôn ngữ mặc định"
          name="language"
          rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ" }]}
        >
          <Select
            options={[
              { label: "🇻🇳 Tiếng Việt", value: "vi" },
              { label: "🇺🇸 English", value: "en" },
              { label: "🇯🇵 日本語", value: "ja" },
              { label: "🇰🇷 한국어", value: "ko" },
              { label: "🇨🇳 中文", value: "zh" },
            ]}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Hiệu suất & Giới hạn</Text>
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Items per page"
              name="itemsPerPage"
              rules={[{ required: true, message: "Bắt buộc" }]}
              tooltip="Số lượng items hiển thị mỗi trang"
            >
              <InputNumber min={10} max={100} step={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Session timeout (phút)"
              name="sessionTimeout"
              rules={[{ required: true, message: "Bắt buộc" }]}
              tooltip="Thời gian timeout của phiên đăng nhập"
            >
              <InputNumber min={5} max={120} step={5} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Max upload (MB)"
              name="maxUploadSize"
              rules={[{ required: true, message: "Bắt buộc" }]}
              tooltip="Dung lượng tối đa cho file upload"
            >
              <InputNumber min={1} max={100} step={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">
          <Text strong>Tính năng hệ thống</Text>
        </Divider>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Form.Item
            name="enableRegistration"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Space direction="vertical" size={0}>
                <Text strong>Cho phép đăng ký tài khoản mới</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  User có thể tự đăng ký tài khoản
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="enableAnalytics"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Space direction="vertical" size={0}>
                <Text strong>Kích hoạt Analytics</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Thu thập dữ liệu thống kê và phân tích
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="enableMaintenance"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Chế độ bảo trì</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tạm khóa hệ thống để bảo trì
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="enableDebugMode"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Chế độ Debug</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hiển thị thông tin debug chi tiết (chỉ development)
                </Text>
              </Space>
            </Space>
          </Form.Item>
        </Space>

        <Divider />

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => form.resetFields()}>Đặt lại</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            Lưu cấu hình
          </Button>
        </Space>
      </Form>
    </Card>
  );
}


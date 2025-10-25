import { Card, Form, Input, Switch, Button, Space, Typography, Divider, InputNumber, Alert } from "antd";
import { SafetyOutlined, SaveOutlined, } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

interface SecurityCardProps {
  mode: "light" | "dark";
}

export default function SecurityCard({ mode }: SecurityCardProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("Security Config values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaving(false);
    } catch {
      setSaving(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <SafetyOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
          <Title level={4} style={{ margin: 0 }}>
            Bảo mật & Quyền hạn
          </Title>
        </Space>
      }
      variant="borderless"
      style={{
        background: mode === "dark" ? "#141414" : "#fff",
      }}
    >
      <Alert
        message="Cảnh báo bảo mật"
        description="Các thay đổi về cấu hình bảo mật có thể ảnh hưởng đến tất cả người dùng. Hãy cẩn thận khi điều chỉnh."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: true,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          jwtExpiration: 24,
          refreshTokenExpiration: 7,
          enable2FA: false,
          enableIPWhitelist: false,
          ipWhitelist: "",
          enableRateLimit: true,
          rateLimitRequests: 100,
          rateLimitWindow: 15,
          enableCORS: true,
          allowedOrigins: "*",
        }}
      >
        <Divider orientation="left">
          <Text strong>Chính sách mật khẩu</Text>
        </Divider>

        <Form.Item
          label="Độ dài tối thiểu"
          name="passwordMinLength"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <InputNumber min={6} max={32} style={{ width: "100%" }} />
        </Form.Item>

        <Space direction="vertical" size={12} style={{ width: "100%", marginBottom: 24 }}>
          <Form.Item
            name="passwordRequireUppercase"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Yêu cầu chữ in hoa</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="passwordRequireNumbers"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Yêu cầu chữ số</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="passwordRequireSpecialChars"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Yêu cầu ký tự đặc biệt</Text>
            </Space>
          </Form.Item>
        </Space>

        <Divider orientation="left">
          <Text strong>Bảo vệ đăng nhập</Text>
        </Divider>

        <Form.Item
          label="Số lần đăng nhập sai tối đa"
          name="maxLoginAttempts"
          rules={[{ required: true, message: "Bắt buộc" }]}
          tooltip="Khóa tài khoản sau N lần đăng nhập sai"
        >
          <InputNumber min={3} max={10} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Thời gian khóa (phút)"
          name="lockoutDuration"
          rules={[{ required: true, message: "Bắt buộc" }]}
          tooltip="Thời gian khóa tài khoản sau khi vượt quá số lần đăng nhập"
        >
          <InputNumber min={5} max={60} style={{ width: "100%" }} />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>JWT & Token</Text>
        </Divider>

        <Form.Item
          label="JWT Expiration (giờ)"
          name="jwtExpiration"
          rules={[{ required: true, message: "Bắt buộc" }]}
          tooltip="Thời gian hết hạn của access token"
        >
          <InputNumber min={1} max={48} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Refresh Token Expiration (ngày)"
          name="refreshTokenExpiration"
          rules={[{ required: true, message: "Bắt buộc" }]}
          tooltip="Thời gian hết hạn của refresh token"
        >
          <InputNumber min={1} max={30} style={{ width: "100%" }} />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Bảo mật nâng cao</Text>
        </Divider>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Form.Item
            name="enable2FA"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Bật xác thực 2 yếu tố (2FA)</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Yêu cầu mã OTP khi đăng nhập
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="enableIPWhitelist"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Bật IP Whitelist</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chỉ cho phép truy cập từ các IP được liệt kê
                </Text>
              </Space>
            </Space>
          </Form.Item>
        </Space>

        <Form.Item
          label="Danh sách IP được phép (mỗi IP một dòng)"
          name="ipWhitelist"
          style={{ marginTop: 16 }}
        >
          <Input.TextArea
            rows={3}
            placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Rate Limiting</Text>
        </Divider>

        <Form.Item
          name="enableRateLimit"
          valuePropName="checked"
        >
          <Space>
            <Switch defaultChecked />
            <Text strong>Bật giới hạn tốc độ request</Text>
          </Space>
        </Form.Item>

        <Form.Item
          label="Số request tối đa"
          name="rateLimitRequests"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <InputNumber min={10} max={1000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Khung thời gian (phút)"
          name="rateLimitWindow"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <InputNumber min={1} max={60} style={{ width: "100%" }} />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>CORS Configuration</Text>
        </Divider>

        <Form.Item
          name="enableCORS"
          valuePropName="checked"
        >
          <Space>
            <Switch defaultChecked />
            <Text strong>Bật CORS</Text>
          </Space>
        </Form.Item>

        <Form.Item
          label="Allowed Origins"
          name="allowedOrigins"
          tooltip="Sử dụng * để cho phép tất cả origins (không khuyến nghị production)"
        >
          <Input placeholder="https://example.com, https://app.example.com" />
        </Form.Item>

        <Divider />

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => form.resetFields()}>Đặt lại</Button>
          <Button
            type="primary"
            danger
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            Lưu cấu hình bảo mật
          </Button>
        </Space>
      </Form>
    </Card>
  );
}


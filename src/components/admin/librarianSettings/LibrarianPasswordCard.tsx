import { Card, Form, Input, Button, Space, Typography, Divider, Alert, Progress, message } from "antd";
import { LockOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Text } = Typography;

interface LibrarianPasswordCardProps {
  mode: "light" | "dark";
}

export default function LibrarianPasswordCard({ mode }: LibrarianPasswordCardProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordChecks({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecial: false,
      });
      return;
    }

    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordChecks(checks);

    const strength = Object.values(checks).filter(Boolean).length * 20;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#ff4d4f";
    if (passwordStrength < 60) return "#faad14";
    if (passwordStrength < 80) return "#1890ff";
    return "#52c41a";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 60) return "Trung bình";
    if (passwordStrength < 80) return "Khá";
    return "Mạnh";
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("Password values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
      setPasswordStrength(0);
      setSaving(false);
    } catch {
      setSaving(false);
    }
  };

  return (
    <Card
      variant="borderless"
      style={{
        background: mode === "dark" ? "#141414" : "#fff",
      }}
    >
      <Alert
        message="Bảo mật tài khoản"
        description="Hãy sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{}}
      >
        <Divider orientation="left">
          <Text strong>Đổi mật khẩu</Text>
        </Divider>

        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            onChange={(e) => checkPasswordStrength(e.target.value)}
          />
        </Form.Item>

        {passwordStrength > 0 && (
          <Space direction="vertical" size={12} style={{ width: "100%", marginBottom: 16 }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Độ mạnh mật khẩu:</Text>
              <Text strong style={{ color: getStrengthColor() }}>
                {getStrengthText()}
              </Text>
            </Space>
            <Progress
              percent={passwordStrength}
              strokeColor={getStrengthColor()}
              showInfo={false}
            />

            <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
              <Space>
                {passwordChecks.minLength ? (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                )}
                <Text type={passwordChecks.minLength ? "success" : "secondary"}>
                  Ít nhất 8 ký tự
                </Text>
              </Space>
              <Space>
                {passwordChecks.hasUpperCase ? (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                )}
                <Text type={passwordChecks.hasUpperCase ? "success" : "secondary"}>
                  Có chữ in hoa (A-Z)
                </Text>
              </Space>
              <Space>
                {passwordChecks.hasLowerCase ? (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                )}
                <Text type={passwordChecks.hasLowerCase ? "success" : "secondary"}>
                  Có chữ thường (a-z)
                </Text>
              </Space>
              <Space>
                {passwordChecks.hasNumber ? (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                )}
                <Text type={passwordChecks.hasNumber ? "success" : "secondary"}>
                  Có chữ số (0-9)
                </Text>
              </Space>
              <Space>
                {passwordChecks.hasSpecial ? (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                )}
                <Text type={passwordChecks.hasSpecial ? "success" : "secondary"}>
                  Có ký tự đặc biệt (!@#$...)
                </Text>
              </Space>
            </Space>
          </Space>
        )}

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>

        <Divider />

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => {
            form.resetFields();
            setPasswordStrength(0);
          }}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            danger
          >
            Đổi mật khẩu
          </Button>
        </Space>
      </Form>
    </Card>
  );
}


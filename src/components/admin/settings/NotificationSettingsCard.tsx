import { Card, Form, Switch, Button, Space, Typography, Divider, Select, InputNumber, theme } from "antd";
import { BellOutlined, SaveOutlined, MailOutlined, MessageOutlined } from "@ant-design/icons";
import { useState } from "react";
import { getSettingsColors } from "./constants";

const { Title, Text } = Typography;

export default function NotificationSettingsCard() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { token } = theme.useToken();
  const settingsColors = getSettingsColors(token);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("Notification Config values:", values);
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
          <BellOutlined style={{ fontSize: 20, color: settingsColors.icons.notification }} />
          <Title level={4} style={{ margin: 0 }}>
            Cấu hình thông báo
          </Title>
        </Space>
      }
      variant="borderless"
      style={{
        background: settingsColors.backgrounds.card,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          notifyNewUser: true,
          notifyNewBook: true,
          notifyOverdue: true,
          notifyReturn: false,
          notifyLowStock: true,
          emailProvider: "smtp",
          digestFrequency: "daily",
          overdueReminderDays: 3,
          returnReminderDays: 1,
        }}
      >
        <Divider orientation="left">
          <Text strong>Kênh thông báo</Text>
        </Divider>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Form.Item
            name="emailNotifications"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Space direction="vertical" size={0}>
                <Space>
                  <MailOutlined />
                  <Text strong>Email Notifications</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Gửi thông báo qua email
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="smsNotifications"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Space>
                  <MessageOutlined />
                  <Text strong>SMS Notifications</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Gửi thông báo qua SMS (yêu cầu API key)
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="pushNotifications"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Space direction="vertical" size={0}>
                <Space>
                  <BellOutlined />
                  <Text strong>Push Notifications</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hiển thị thông báo trên trình duyệt
                </Text>
              </Space>
            </Space>
          </Form.Item>
        </Space>

        <Divider orientation="left">
          <Text strong>Sự kiện thông báo</Text>
        </Divider>

        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Form.Item
            name="notifyNewUser"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Người dùng mới đăng ký</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="notifyNewBook"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Sách mới được thêm vào</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="notifyOverdue"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Sách quá hạn</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="notifyReturn"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Text>Sách được trả lại</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="notifyLowStock"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Sách sắp hết (tồn kho thấp)</Text>
            </Space>
          </Form.Item>
        </Space>

        <Divider orientation="left">
          <Text strong>Cấu hình Email</Text>
        </Divider>

        <Form.Item
          label="Email Provider"
          name="emailProvider"
          rules={[{ required: true, message: "Vui lòng chọn provider" }]}
        >
          <Select
            options={[
              { label: "SMTP (Custom)", value: "smtp" },
              { label: "SendGrid", value: "sendgrid" },
              { label: "Mailgun", value: "mailgun" },
              { label: "AWS SES", value: "aws-ses" },
              { label: "Gmail", value: "gmail" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Tần suất gửi email tổng hợp"
          name="digestFrequency"
          tooltip="Gộp các thông báo không quan trọng và gửi theo chu kỳ"
        >
          <Select
            options={[
              { label: "Ngay lập tức", value: "immediate" },
              { label: "Mỗi giờ", value: "hourly" },
              { label: "Hàng ngày (8:00 AM)", value: "daily" },
              { label: "Hàng tuần (Thứ 2)", value: "weekly" },
            ]}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Nhắc nhở tự động</Text>
        </Divider>

        <Form.Item
          label="Nhắc quá hạn trước (ngày)"
          name="overdueReminderDays"
          tooltip="Gửi nhắc nhở trước khi sách quá hạn"
        >
          <InputNumber min={1} max={7} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Nhắc trả sách trước (ngày)"
          name="returnReminderDays"
          tooltip="Gửi nhắc nhở trước ngày trả sách"
        >
          <InputNumber min={1} max={7} style={{ width: "100%" }} />
        </Form.Item>

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


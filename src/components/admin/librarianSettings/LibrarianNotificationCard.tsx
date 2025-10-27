import { Card, Form, Switch, Button, Space, Typography, Divider, Select, message, theme } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useState } from "react";
import { defaultLibrarianNotifications, notificationFrequencyOptions } from "../../../data";
import { getLibrarianSettingsColors } from "./constants";

const { Text } = Typography;

export default function LibrarianNotificationCard() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { token } = theme.useToken();
  const librarianColors = getLibrarianSettingsColors(token);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("Notification values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Cập nhật thông báo thành công!");
      setSaving(false);
    } catch {
      setSaving(false);
    }
  };

  return (
    <Card
      variant="borderless"
      style={{
        background: librarianColors.backgrounds.card,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultLibrarianNotifications}
      >
        <Divider orientation="left">
          <Text strong>Thông báo Email</Text>
        </Divider>

        <Form.Item
          name="emailNotifications"
          valuePropName="checked"
        >
          <Space>
            <Switch defaultChecked />
            <Space direction="vertical" size={0}>
              <Text strong>Bật thông báo Email</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Nhận thông báo qua email
              </Text>
            </Space>
          </Space>
        </Form.Item>

        <Space direction="vertical" size={12} style={{ width: "100%", marginLeft: 40 }}>
          <Form.Item
            name="newBorrowRequest"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Yêu cầu mượn sách mới</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="bookOverdue"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Sách quá hạn</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="bookReturned"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Sách được trả</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="newUserRegistration"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Text>Người dùng mới đăng ký</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="systemMaintenance"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Text>Bảo trì hệ thống</Text>
            </Space>
          </Form.Item>
        </Space>

        <Divider orientation="left">
          <Text strong>Thông báo trình duyệt</Text>
        </Divider>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Form.Item
            name="browserNotifications"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Space direction="vertical" size={0}>
                <Text strong>Bật thông báo trình duyệt</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hiển thị thông báo ngay cả khi không mở ứng dụng
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="soundNotifications"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Âm thanh thông báo</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Phát âm thanh khi có thông báo mới
                </Text>
              </Space>
            </Space>
          </Form.Item>
        </Space>

        <Divider orientation="left">
          <Text strong>Tần suất thông báo</Text>
        </Divider>

        <Form.Item
          label="Tần suất gửi thông báo"
          name="notificationFrequency"
          tooltip="Chọn tần suất nhận thông báo phù hợp với công việc"
        >
          <Select options={notificationFrequencyOptions} />
        </Form.Item>

        <Divider />

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => form.resetFields()}>Đặt lại mặc định</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            Lưu cài đặt
          </Button>
        </Space>
      </Form>
    </Card>
  );
}


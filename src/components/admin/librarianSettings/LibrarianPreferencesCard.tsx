import { Card, Form, Select, Switch, Button, Space, Typography, Divider, Radio, Slider, App as AntdApp, theme } from "antd";
import { SaveOutlined, SunOutlined, MoonOutlined, SyncOutlined } from "@ant-design/icons";
import { useState } from "react";
import { defaultLibrarianPreferences, languageOptions } from "../../../data";
import { getLibrarianSettingsColors } from "./constants";

const { Text } = Typography;

export default function LibrarianPreferencesCard() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { token } = theme.useToken();
  const librarianColors = getLibrarianSettingsColors(token);
  const { notification } = AntdApp.useApp();

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("Preferences values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notification.success({
        message: "Cập nhật giao diện thành công!",
        placement: "topRight",
      });
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
        initialValues={defaultLibrarianPreferences}
      >
        <Divider orientation="left">
          <Text strong>Giao diện</Text>
        </Divider>

        <Form.Item
          label="Chế độ hiển thị"
          name="theme"
        >
          <Radio.Group>
            <Radio.Button value="light">
              <Space>
                <SunOutlined />
                Sáng
              </Space>
            </Radio.Button>
            <Radio.Button value="dark">
              <Space>
                <MoonOutlined />
                Tối
              </Space>
            </Radio.Button>
            <Radio.Button value="auto">
              <Space>
                <SyncOutlined />
                Tự động
              </Space>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Ngôn ngữ"
          name="language"
        >
          <Select options={languageOptions} />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <Text>Kích thước chữ</Text>
              <Text type="secondary">(px)</Text>
            </Space>
          }
          name="fontSize"
        >
          <Slider
            min={12}
            max={18}
            step={1}
            marks={{
              12: "12px",
              14: "14px",
              16: "16px",
              18: "18px",
            }}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Tùy chỉnh hiển thị</Text>
        </Divider>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Form.Item
            name="compactMode"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Chế độ thu gọn</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Giảm khoảng cách giữa các thành phần
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="showAvatars"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch defaultChecked />
              <Space direction="vertical" size={0}>
                <Text strong>Hiển thị avatar</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hiện avatar trong danh sách người dùng
                </Text>
              </Space>
            </Space>
          </Form.Item>
        </Space>

        <Divider orientation="left">
          <Text strong>Bảng & Danh sách</Text>
        </Divider>

        <Form.Item
          label="Số dòng mỗi trang"
          name="tablePageSize"
        >
          <Select
            options={[
              { label: "5 dòng", value: 5 },
              { label: "10 dòng", value: 10 },
              { label: "20 dòng", value: 20 },
              { label: "50 dòng", value: 50 },
              { label: "100 dòng", value: 100 },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Bố cục Dashboard"
          name="dashboardLayout"
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="default">Mặc định (Thống kê + Biểu đồ)</Radio>
              <Radio value="compact">Thu gọn (Chỉ thống kê)</Radio>
              <Radio value="detailed">Chi tiết (Thống kê + Biểu đồ + Bảng)</Radio>
            </Space>
          </Radio.Group>
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


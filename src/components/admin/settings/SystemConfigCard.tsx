import { Card, Form, Input, Select, Switch, Button, Space, Typography, Divider, InputNumber, Row, Col, theme, App, Alert } from "antd";
import { SettingOutlined, SaveOutlined, GlobalOutlined, DatabaseOutlined, DeleteOutlined, PlusOutlined, ThunderboltOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingsColors } from "./constants";
import { adminConfigService } from "../../../services/adminConfigService";
import type { SystemConfig } from "../../../services/adminConfigService";

const { Title, Text } = Typography;

export default function SystemConfigCard() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const { token } = theme.useToken();
  const settingsColors = getSettingsColors(token);
  const queryClient = useQueryClient();

  // Default values
  const defaults: SystemConfig = {
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
    z3950Libraries: [
      {
        key: "loc",
        name: "Library of Congress",
        host: "z3950.loc.gov",
        port: 7090,
        database: "voyager",
        syntax: "USMARC",
        enabled: true
      },
      {
        key: "uw",
        name: "UW-Madison",
        host: "na02.alma.exlibrisgroup.com",
        port: 1921,
        database: "01UWI_MAD",
        syntax: "USMARC",
        enabled: true
      }
    ]
  };

  // Fetch system config with React Query
  const { data: configData, isLoading: loading } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: async () => {
      const config = await adminConfigService.getSystemConfig();

      if (config && Object.keys(config).length > 0) {
        // Merge defaults with config
        return {
          ...defaults,
          ...config,
          z3950Libraries: config.z3950Libraries && config.z3950Libraries.length > 0
            ? config.z3950Libraries
            : defaults.z3950Libraries
        };
      }
      return defaults;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update system config mutation
  const updateMutation = useMutation({
    mutationFn: (data: SystemConfig) => adminConfigService.updateSystemConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
      message.success("Đã lưu cấu hình hệ thống thành công");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Failed to save config:", error);
      message.error("Lỗi khi lưu cấu hình");
    },
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      updateMutation.mutate(values as SystemConfig);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(configData);
    setIsEditing(false);
  };

  const handleTestConnection = async (index: number) => {
    try {
      const libraries = form.getFieldValue('z3950Libraries');
      const libConfig = libraries[index];

      if (!libConfig || !libConfig.host || !libConfig.port || !libConfig.database) {
        message.warning("Vui lòng nhập đầy đủ Host, Port và Database");
        return;
      }

      setTestingConnection(index);
      const result = await adminConfigService.testZ3950Connection(libConfig);

      if (result.success) {
        message.success("Kết nối thành công!");
      } else {
        message.error(`Kết nối thất bại: ${result.message}`);
      }
    } catch (error) {
      message.error("Lỗi khi kiểm tra kết nối");
      console.error(error);
    } finally {
      setTestingConnection(null);
    }
  };

  if (loading) {
    return (
      <Card
        style={{ background: settingsColors.backgrounds.card, minHeight: 400 }}
        loading
      />
    );
  }

  return (
    <Card
      title={
        <Space>
          <SettingOutlined style={{ fontSize: 20, color: settingsColors.icons.system }} />
          <Title level={4} style={{ margin: 0 }}>
            Cấu hình hệ thống
          </Title>
        </Space>
      }
      variant="borderless"
      style={{
        background: settingsColors.backgrounds.card,
      }}
    >
      <Alert
        message="Lưu ý quan trọng"
        description="Các cấu hình hệ thống dưới đây được lưu vào cơ sở dữ liệu và sẽ áp dụng cho toàn bộ ứng dụng. Một số thay đổi có thể yêu cầu tải lại trang để có hiệu lực."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={configData || undefined}
        disabled={!isEditing}
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
              { label: "Tiếng Việt", value: "vi" },
              { label: "English", value: "en" },
              { label: "日本語", value: "ja" },
              { label: "한국어", value: "ko" },
              { label: "中文", value: "zh" },
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
          <Text strong>Thư viện Z39.50</Text>
        </Divider>

        <Form.List name="z3950Libraries">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  size="small"
                  key={key}
                  style={{ marginBottom: 16, background: token.colorFillAlter }}
                  title={
                    <Space>
                      <DatabaseOutlined />
                      <Text strong>Library Source #{key + 1}</Text>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        type="text"
                        icon={<ThunderboltOutlined />}
                        loading={testingConnection === name}
                        onClick={() => handleTestConnection(name)}
                        disabled={!isEditing}
                      >
                        Test
                      </Button>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        disabled={!isEditing}
                      />
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        label="Key (ID)"
                        rules={[{ required: true, message: 'Nhập key' }]}
                        tooltip="Mã định danh duy nhất (ví dụ: loc, uw, oclc)"
                      >
                        <Input placeholder="loc" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Tên thư viện"
                        rules={[{ required: true, message: 'Nhập tên' }]}
                      >
                        <Input placeholder="Library of Congress" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'host']}
                        label="Host Address"
                        rules={[{ required: true, message: 'Nhập host' }]}
                      >
                        <Input placeholder="z3950.loc.gov" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item
                        {...restField}
                        name={[name, 'port']}
                        label="Port"
                        rules={[{ required: true, message: 'Port' }]}
                      >
                        <InputNumber style={{ width: '100%' }} placeholder="7090" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item
                        {...restField}
                        name={[name, 'enabled']}
                        valuePropName="checked"
                        label="Active"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'database']}
                        label="Database Name"
                        rules={[{ required: true, message: 'Nhập DB name' }]}
                      >
                        <Input placeholder="voyager" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'syntax']}
                        label="Syntax"
                      >
                        <Select
                          options={[
                            { label: 'USMARC', value: 'USMARC' },
                            { label: 'UKMARC', value: 'UKMARC' },
                            { label: 'UNIMARC', value: 'UNIMARC' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({ enabled: true, syntax: 'USMARC' })}
                  block
                  icon={<PlusOutlined />}
                  disabled={!isEditing}
                >
                  Thêm thư viện Z39.50
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

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
      </Form>

      <Divider />

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        {!isEditing ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </Button>
        ) : (
          <>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              Lưu cấu hình
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
}

import { Card, Form, Input, Select, Slider, Button, Space, Typography, Divider, Tag, theme, InputNumber, App, Alert } from "antd";
import { ApiOutlined, RobotOutlined, SaveOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingsColors } from "./constants";
import { adminConfigService } from "../../../services/adminConfigService";
import type { AIConfig } from "../../../services/adminConfigService";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AIConfigCard() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const { token } = theme.useToken();
  const settingsColors = getSettingsColors(token);
  const queryClient = useQueryClient();

  // Fetch AI config with React Query
  const { data: configData, isLoading: loading } = useQuery({
    queryKey: ['aiConfig'],
    queryFn: async () => {
      const config = await adminConfigService.getAIConfig();
      return {
        apiKey: config.apiKey,
        model: config.model || "gemini-2.0-flash",
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 2000,
        topP: config.topP ?? 0.9,
        topK: config.topK ?? 40,
        systemPrompt: config.systemPrompt,
        maxBooksInContext: config.maxBooksInContext ?? 30,
        maxChatHistory: config.maxChatHistory ?? 10,
        maxMessageLength: config.maxMessageLength ?? 2000,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update AI config mutation
  const updateMutation = useMutation({
    mutationFn: (data: AIConfig) => adminConfigService.updateAIConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiConfig'] });
      message.success("Đã lưu cấu hình AI");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Failed to save AI config:", error);
      message.error("Không thể lưu cấu hình AI");
    },
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      updateMutation.mutate(values as AIConfig);
    } catch (error) {
      // Form validation error
      console.error("Form validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(configData);
    setIsEditing(false);
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
          <RobotOutlined style={{ fontSize: 20, color: settingsColors.icons.ai }} />
          <Title level={4} style={{ margin: 0 }}>
            Cấu hình AI (Gemini)
          </Title>
        </Space>
      }
      extra={
        <Tag color="blue" icon={<ApiOutlined />}>
          Gemini API
        </Tag>
      }
      variant="borderless"
      style={{
        background: settingsColors.backgrounds.card,
      }}
    >
      <Alert
        message="Lưu ý quan trọng"
        description="Vui lòng đảm bảo rằng bạn biết bạn đang làm gì khi thay đổi các trường này. Việc thay đổi không đúng có thể dẫn đến chi phí không mong muốn hoặc làm gián đoạn dịch vụ AI của bạn."
        type="error"
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={configData || undefined}
        disabled={!isEditing}
      >
        <Divider orientation="left">
          <Text strong>API Configuration</Text>
        </Divider>

        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: "Vui lòng nhập API Key" }]}
          tooltip="API key từ Google AI Studio"
        >
          <Input.Password
            prefix={<ApiOutlined />}
            placeholder="AIzaSy..."
          />
        </Form.Item>

        <Form.Item
          label="Model"
          name="model"
          rules={[{ required: true, message: "Vui lòng chọn model" }]}
          tooltip="Chọn model AI phù hợp với nhu cầu"
        >
          <Select
            options={[
              { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
              { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
              { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
              { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
              { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
              { label: "Gemini 1.0 Pro", value: "gemini-1.0-pro" },
            ]}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Model Parameters</Text>
        </Divider>

        <Form.Item
          label={
            <Space>
              <Text>Temperature</Text>
              <Text type="secondary">(Độ sáng tạo)</Text>
            </Space>
          }
          name="temperature"
          tooltip="Giá trị cao hơn = câu trả lời sáng tạo hơn. Thấp hơn = tập trung và xác định hơn"
        >
          <Slider
            min={0}
            max={2}
            step={0.1}
            marks={{ 0: "0", 0.7: "0.7", 1: "1", 2: "2" }}
            tooltip={{ formatter: (value) => `${value}` }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <Text>Max Tokens</Text>
              <Text type="secondary">(Độ dài tối đa)</Text>
            </Space>
          }
          name="maxTokens"
          tooltip="Số token tối đa cho mỗi response"
        >
          <Slider
            min={100}
            max={8192}
            step={100}
            marks={{ 100: "100", 2000: "2K", 4000: "4K", 8000: "8K" }}
            tooltip={{ formatter: (value) => `${value} tokens` }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <Text>Top P</Text>
              <Text type="secondary">(Nucleus sampling)</Text>
            </Space>
          }
          name="topP"
          tooltip="Kiểm soát độ đa dạng của output"
        >
          <Slider
            min={0}
            max={1}
            step={0.05}
            marks={{ 0: "0", 0.5: "0.5", 0.9: "0.9", 1: "1" }}
            tooltip={{ formatter: (value) => `${value}` }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <Text>Top K</Text>
              <Text type="secondary">(Top-K sampling)</Text>
            </Space>
          }
          name="topK"
          tooltip="Giới hạn số lượng token có khả năng cao nhất để xem xét cho mỗi bước"
        >
           <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>System Prompt</Text>
        </Divider>

        <Form.Item
          label="System Prompt"
          name="systemPrompt"
          tooltip="Hướng dẫn hệ thống cho AI"
        >
          <TextArea
            rows={4}
            placeholder="Nhập system prompt..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Context & History</Text>
        </Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              label="Max Books in Context"
              name="maxBooksInContext"
              tooltip="Số lượng sách tối đa được đưa vào ngữ cảnh"
            >
               <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Max Chat History"
              name="maxChatHistory"
              tooltip="Số lượng tin nhắn lịch sử tối đa được gửi kèm"
            >
               <InputNumber min={0} max={50} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Max Message Length"
              name="maxMessageLength"
              tooltip="Độ dài tối đa của tin nhắn người dùng"
            >
               <InputNumber min={100} max={10000} style={{ width: '100%' }} />
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


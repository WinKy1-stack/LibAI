import { Card, Form, Input, Select, Slider, Switch, Button, Space, Typography, Divider, Tag } from "antd";
import { ApiOutlined, RobotOutlined, SaveOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AIConfigCardProps {
  mode: "light" | "dark";
}

export default function AIConfigCard({ mode }: AIConfigCardProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      console.log("AI Config values:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
      setSaving(false);
    } catch{
      setSaving(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Cấu hình AI
          </Title>
        </Space>
      }
      extra={
        <Tag color="blue" icon={<ApiOutlined />}>
          OpenAI GPT-4
        </Tag>
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
          apiKey: "sk-proj-***************************",
          model: "gpt-4-turbo-preview",
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0,
          enableStreaming: true,
          enableCache: true,
          systemPrompt:
            "Bạn là một trợ lý AI thông minh cho hệ thống quản lý thư viện. Hãy trả lời một cách chính xác, hữu ích và thân thiện.",
        }}
      >
        <Divider orientation="left">
          <Text strong>API Configuration</Text>
        </Divider>

        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: "Vui lòng nhập API Key" }]}
          tooltip="API key từ OpenAI hoặc các provider khác"
        >
          <Input.Password
            prefix={<ApiOutlined />}
            placeholder="sk-proj-***************************"
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
              { label: "GPT-4 Turbo Preview", value: "gpt-4-turbo-preview" },
              { label: "GPT-4", value: "gpt-4" },
              { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
              { label: "Claude 3 Opus", value: "claude-3-opus" },
              { label: "Claude 3 Sonnet", value: "claude-3-sonnet" },
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
            marks={{ 0: "0", 0.5: "0.5", 1: "1", 1.5: "1.5", 2: "2" }}
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
            max={4000}
            step={100}
            marks={{ 100: "100", 1000: "1K", 2000: "2K", 4000: "4K" }}
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
            step={0.1}
            marks={{ 0: "0", 0.5: "0.5", 1: "1" }}
            tooltip={{ formatter: (value) => `${value}` }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <Text>Frequency Penalty</Text>
              <Text type="secondary">(Phạt lặp lại)</Text>
            </Space>
          }
          name="frequencyPenalty"
          tooltip="Giảm khả năng model lặp lại cùng một từ"
        >
          <Slider
            min={-2}
            max={2}
            step={0.1}
            marks={{ "-2": "-2", 0: "0", 2: "2" }}
            tooltip={{ formatter: (value) => `${value}` }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <Text>Presence Penalty</Text>
              <Text type="secondary">(Phạt chủ đề lặp)</Text>
            </Space>
          }
          name="presencePenalty"
          tooltip="Giảm khả năng model nói về cùng một chủ đề"
        >
          <Slider
            min={-2}
            max={2}
            step={0.1}
            marks={{ "-2": "-2", 0: "0", 2: "2" }}
            tooltip={{ formatter: (value) => `${value}` }}
          />
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
            maxLength={500}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>Advanced Features</Text>
        </Divider>

        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Form.Item
            name="enableStreaming"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Enable Streaming</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hiển thị câu trả lời theo thời gian thực
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item
            name="enableCache"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Space>
              <Switch />
              <Space direction="vertical" size={0}>
                <Text strong>Enable Response Cache</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Lưu cache để tiết kiệm chi phí và tăng tốc độ
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


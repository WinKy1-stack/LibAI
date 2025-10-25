import { Modal, Form, Input, Select, InputNumber, Tag, Space, message } from "antd";
import { useState, useEffect } from "react";
import type { FaqItem } from "../../../data";
import { faqCategories } from "../../../data";
import { categoryIcons } from "./constants";

const { TextArea } = Input;

interface FaqEditModalProps {
  visible: boolean;
  faqItem: FaqItem | null;
  onClose: () => void;
  onSave: (faqItem: Partial<FaqItem>) => void;
  mode: "light" | "dark";
}

export default function FaqEditModal({ visible, faqItem, onClose, onSave, mode }: FaqEditModalProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");

  useEffect(() => {
    if (faqItem) {
      form.setFieldsValue(faqItem);
      setTags(faqItem.tags || []);
    } else {
      form.resetFields();
      setTags([]);
    }
  }, [faqItem, form]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const updatedFaq: Partial<FaqItem> = {
        ...values,
        tags,
        updatedAt: new Date().toISOString(),
      };

      if (faqItem) {
        updatedFaq.id = faqItem.id;
      } else {
        updatedFaq.id = `faq-${Date.now()}`;
        updatedFaq.createdAt = new Date().toISOString();
        updatedFaq.createdBy = "La Thanh Toàn";
        updatedFaq.views = 0;
        updatedFaq.helpful = 0;
        updatedFaq.notHelpful = 0;
      }

      onSave(updatedFaq);
      message.success(faqItem ? "Cập nhật FAQ thành công!" : "Thêm FAQ mới thành công!");
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag("");
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  return (
    <Modal
      title={faqItem ? "Chỉnh sửa FAQ" : "Thêm FAQ mới"}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={saving}
      width={800}
      okText={faqItem ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "draft",
          priority: 3,
        }}
      >
        <Form.Item
          label="Câu hỏi"
          name="question"
          rules={[{ required: true, message: "Vui lòng nhập câu hỏi!" }]}
        >
          <Input placeholder="Nhập câu hỏi..." />
        </Form.Item>

        <Form.Item
          label="Câu trả lời"
          name="answer"
          rules={[{ required: true, message: "Vui lòng nhập câu trả lời!" }]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập câu trả lời chi tiết..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Space style={{ width: "100%" }} size="large">
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Select
              placeholder="Chọn danh mục"
              options={faqCategories.map((cat) => ({
                label: (
                  <Space>
                    {categoryIcons[cat.id]}
                    <span>{cat.name}</span>
                  </Space>
                ),
                value: cat.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            style={{ flex: 1, minWidth: 150 }}
          >
            <Select
              options={[
                { label: "Xuất bản", value: "published" },
                { label: "Nháp", value: "draft" },
                { label: "Lưu trữ", value: "archived" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Độ ưu tiên"
            name="priority"
            rules={[{ required: true, message: "Vui lòng chọn độ ưu tiên!" }]}
            style={{ flex: 1, minWidth: 120 }}
          >
            <InputNumber
              min={1}
              max={5}
              style={{ width: "100%" }}
              placeholder="1-5"
            />
          </Form.Item>
        </Space>

        <Form.Item label="Thẻ tags">
          <Space style={{ marginBottom: 8 }}>
            <Input
              placeholder="Nhập tag..."
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onPressEnter={handleAddTag}
              style={{ width: 200 }}
            />
            <a onClick={handleAddTag}>Thêm</a>
          </Space>
          <div>
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleRemoveTag(tag)}
                style={{ marginBottom: 8 }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}


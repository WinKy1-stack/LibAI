import { Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col, App as AntdApp } from "antd";
import { useState, useEffect, type ReactNode } from "react";

const { TextArea } = Input;

export type FieldType = 
  | "text" 
  | "textarea" 
  | "select" 
  | "number" 
  | "date"
  | "custom";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  rules?: Array<Record<string, unknown>>;
  options?: Array<{ label: ReactNode | string; value: string | number }>;
  min?: number;
  max?: number;
  maxLength?: number;
  rows?: number;
  span?: { xs: number; sm: number; md: number };
  render?: (value: unknown, onChange: (value: unknown) => void) => ReactNode;
}

interface GenericFormModalProps<T = Record<string, unknown>> {
  title: string;
  visible: boolean;
  editItem: T | null;
  fields: FormField[];
  onClose: () => void;
  onSave: (item: Partial<T>) => void;
  initialValues?: Record<string, unknown>;
  width?: number;
  showNotification?: boolean; // Allow parent to control notification
}

export default function GenericFormModal<T extends { id?: string }>({
  title,
  visible,
  editItem,
  fields,
  onClose,
  onSave,
  initialValues = {},
  width = 800,
  showNotification = true,
}: GenericFormModalProps<T>) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { notification } = AntdApp.useApp();

  useEffect(() => {
    if (visible) {
      if (editItem) {
        form.setFieldsValue(editItem);
      } else {
        form.resetFields();
        // Set initial values if provided
        if (Object.keys(initialValues).length > 0) {
          form.setFieldsValue(initialValues);
        }
      }
    } else {
      // Reset form when modal is closed
      form.resetFields();
    }
  }, [editItem, form, visible, initialValues]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const updatedItem: Partial<T> = {
        ...values,
        updatedAt: new Date().toISOString(),
      };

      if (editItem && 'id' in editItem) {
        updatedItem.id = editItem.id;
      } else {
        (updatedItem as Record<string, unknown>).id = `item-${Date.now()}`;
        (updatedItem as Record<string, unknown>).createdAt = new Date().toISOString();
      }

      onSave(updatedItem);
      if (showNotification) {
        notification.success({
          message: editItem ? "Cập nhật thành công!" : "Thêm mới thành công!",
          placement: "topRight",
        });
      }
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const defaultSpan = { xs: 24, sm: 24, md: 24 };
    const span = field.span || defaultSpan;

    const formItem = (
      <Form.Item
        label={field.label}
        name={field.name}
        rules={field.rules || (field.required ? [{ required: true, message: `Vui lòng nhập ${field.label.toLowerCase()}!` }] : [])}
      >
        {renderInput(field)}
      </Form.Item>
    );

    return (
      <Col key={field.name} {...span}>
        {formItem}
      </Col>
    );
  };

  const renderInput = (field: FormField) => {
    switch (field.type) {
      case "text":
        return <Input placeholder={field.placeholder} maxLength={field.maxLength} />;
      
      case "textarea":
        return (
          <TextArea
            rows={field.rows || 4}
            placeholder={field.placeholder}
            showCount={!!field.maxLength}
            maxLength={field.maxLength}
          />
        );
      
      case "select":
        return (
          <Select
            placeholder={field.placeholder}
            options={field.options}
          />
        );
      
      case "number":
        return (
          <InputNumber
            min={field.min}
            max={field.max}
            style={{ width: "100%" }}
            placeholder={field.placeholder}
          />
        );
      
      case "date":
        return <DatePicker style={{ width: "100%" }} />;
      
      case "custom":
        return field.render ? (
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue, setFieldValue }) => 
              field.render!(getFieldValue(field.name), (val: unknown) => setFieldValue(field.name, val))
            }
          </Form.Item>
        ) : null;
      
      default:
        return <Input placeholder={field.placeholder} />;
    }
  };

  return (
    <Modal
      title={editItem ? `Chỉnh sửa ${title}` : `Thêm ${title} mới`}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={saving}
      width={width}
      okText={editItem ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={16}>
          {fields.map((field) => renderField(field))}
        </Row>
      </Form>
    </Modal>
  );
}


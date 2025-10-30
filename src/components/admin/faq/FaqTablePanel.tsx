import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Grid,
  Tooltip,
  Popconfirm,
  theme,
} from "antd";
import { 
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import type { FaqItem } from "../../../data";
import { getFaqColors } from "./constants";

const { Text } = Typography;
const { Search } = Input;

interface FaqTablePanelProps {
  data: FaqItem[];
  statusFilter: "all" | "published" | "draft" | "archived";
  categoryFilter: "all" | string;
  searchValue: string;
  categories: Array<{ id: string; name: string }>;
  onStatusChange: (value: "all" | "published" | "draft" | "archived") => void;
  onCategoryChange: (value: "all" | string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onEdit: (record: FaqItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function FaqTablePanel({
  data,
  statusFilter,
  categoryFilter,
  searchValue,
  categories,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  onEdit,
  onDelete,
  loading = false,
}: FaqTablePanelProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const faqColors = getFaqColors(token);

  const categoryMap: Record<string, { label: string; color: string }> = useMemo(() => ({
    borrowing: { label: "Mượn sách", color: faqColors.tagColors.borrowing },
    returning: { label: "Trả sách", color: faqColors.tagColors.returning },
    membership: { label: "Thẻ TV", color: faqColors.tagColors.membership },
    fines: { label: "Phí & Phạt", color: faqColors.tagColors.fines },
    services: { label: "Dịch vụ", color: faqColors.tagColors.services },
    technical: { label: "Kỹ thuật", color: faqColors.tagColors.technical },
  }), [faqColors.tagColors]);

  const statusMap: Record<string, { label: string; color: string }> = useMemo(() => ({
    published: { label: "Xuất bản", color: "success" },
    draft: { label: "Nháp", color: "warning" },
    archived: { label: "Lưu trữ", color: "default" },
  }), []);

  const columns: ColumnsType<FaqItem> = useMemo(
    () => [
      {
        title: "Câu hỏi",
        dataIndex: "question",
        key: "question",
        render: (text: string, record: FaqItem) => (
          <Space direction="vertical" size={4}>
            <Text strong ellipsis={{ tooltip: text }}>{text}</Text>
            <Space size={4} wrap>
              {record.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} color="blue" style={{ fontSize: 11 }}>
                  {tag}
                </Tag>
              ))}
              {record.tags.length > 3 && (
                <Tag color="default" style={{ fontSize: 11 }}>
                  +{record.tags.length - 3}
                </Tag>
              )}
            </Space>
          </Space>
        ),
        width: 360,
        ellipsis: true,
      },
      {
        title: "Câu trả lời",
        dataIndex: "answer",
        key: "answer",
        responsive: ["md"],
        render: (text: string) => (
          <Tooltip title={text}>
            <Text type="secondary" ellipsis>
              {text.substring(0, 80)}
              {text.length > 80 ? "..." : ""}
            </Text>
          </Tooltip>
        ),
        width: 280,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
        render: (category: string) => {
          const cat = categoryMap[category] || { label: category, color: "default" };
          return <Tag color={cat.color}>{cat.label}</Tag>;
        },
        width: 120,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        responsive: ["lg"],
        render: (status: string) => {
          const stat = statusMap[status] || { label: status, color: "default" };
          return <Tag color={stat.color}>{stat.label}</Tag>;
        },
        width: 120,
      },
      {
        title: "Thống kê",
        key: "stats",
        responsive: ["xl"],
        render: (_: unknown, record: FaqItem) => (
          <Space direction="vertical" size={2}>
            <Space size={8}>
              <Tooltip title="Lượt xem">
                <Space size={4}>
                  <EyeOutlined style={{ fontSize: 12 }} />
                  <Text style={{ fontSize: 12 }}>{record.views}</Text>
                </Space>
              </Tooltip>
              <Tooltip title="Hữu ích">
                <Space size={4}>
                  <LikeOutlined style={{ fontSize: 12, color: faqColors.actions.like }} />
                  <Text style={{ fontSize: 12 }}>{record.helpful}</Text>
                </Space>
              </Tooltip>
              <Tooltip title="Không hữu ích">
                <Space size={4}>
                  <DislikeOutlined style={{ fontSize: 12, color: faqColors.actions.dislike }} />
                  <Text style={{ fontSize: 12 }}>{record.notHelpful}</Text>
                </Space>
              </Tooltip>
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Ưu tiên: {record.priority}/5
            </Text>
          </Space>
        ),
        width: 200,
      },
      {
        title: "",
        key: "actions",
        fixed: "right" as const,
        render: (_: unknown, record: FaqItem) => (
          <Space direction="vertical" size={0}>
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa FAQ"
              description="Bạn có chắc muốn xóa FAQ này?"
              onConfirm={() => onDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button 
                type="link" 
                size="small" 
                danger
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
        width: screens.md ? 100 : 60,
      },
    ],
    [categoryMap, statusMap, screens.md, onEdit, onDelete, faqColors.actions.like, faqColors.actions.dislike],
  );

  return (
    <Card
      variant="borderless"
      style={{ borderRadius: 16 }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ 
        padding: '24px 24px 16px', 
        display: 'flex', 
        flexDirection: screens.lg ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: screens.lg ? 'center' : 'flex-start',
        gap: 16
      }}>
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 18 }}>
            Danh sách câu hỏi
          </Text>
          <Text type="secondary">Kết quả phù hợp: {data.length}</Text>
        </Space>
        
        <Space wrap style={{ width: screens.lg ? 'auto' : '100%' }}>
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "published", label: "Xuất bản" },
              { value: "draft", label: "Nháp" },
              { value: "archived", label: "Lưu trữ" },
            ]}
            style={{ minWidth: 150, flex: screens.lg ? 'none' : 1 }}
            size={screens.md ? "large" : "middle"}
          />
          <Select
            value={categoryFilter}
            onChange={onCategoryChange}
            options={[
              { value: "all", label: "Tất cả danh mục" },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
            style={{ minWidth: 150, flex: screens.lg ? 'none' : 1 }}
            size={screens.md ? "large" : "middle"}
          />
          <Search
            placeholder="Tìm câu hỏi, câu trả lời, tag..."
            allowClear
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onSearch={onSearchSubmit}
            style={{ width: screens.sm ? 260 : '100%' }}
            size={screens.md ? "large" : "middle"}
          />
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={{
          spinning: loading,
          indicator: <></>,
        }}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        rowKey="id"
        scroll={{ x: 1200 }}
        style={{ borderRadius: 16 }}
      />
    </Card>
  );
}


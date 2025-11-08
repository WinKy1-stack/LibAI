import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Avatar,
  Button,
  Card,
  Input,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Grid,
  theme,
} from "antd";
import { 
  BookOutlined,
  InfoCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { AdminBook, BookStatus } from "../../../data";
import { formatLabels, statusLabels } from "./constants";
import { getStatusMeta, formatDate, timeAgo } from "./utils";

const { Text } = Typography;
const { Search } = Input;

interface BooksTablePanelProps {
  data: AdminBook[];
  statusFilter: "all" | BookStatus;
  categoryFilter: "all" | string;
  searchValue: string;
  categories: string[];
  loading?: boolean;
  onStatusChange: (value: "all" | BookStatus) => void;
  onCategoryChange: (value: "all" | string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

export function BooksTablePanel({
  data,
  statusFilter,
  categoryFilter,
  searchValue,
  categories,
  loading = false,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
}: BooksTablePanelProps) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  const columns: ColumnsType<AdminBook> = useMemo(
    () => [
      {
        title: "Tựa sách",
        dataIndex: "title",
        key: "title",
        render: (_, record) => (
          <Space align="start" size={12}>
            <Avatar
              shape="square"
              size={48}
              src={record.cover}
              style={{ backgroundColor: token.colorPrimary, color: "#fff" }}
              icon={!record.cover ? <BookOutlined /> : undefined}
            >
              {!record.cover ? record.title.charAt(0) : null}
            </Avatar>
            <Space direction="vertical" size={2}>
              <Text strong ellipsis={{ tooltip: record.title }}>{record.title}</Text>
              <Text type="secondary" ellipsis={{ tooltip: `${record.author} · ${record.publishedYear}` }}>
                {record.author} · {record.publishedYear}
              </Text>
              <Text type="secondary">ISBN: {record.isbn}</Text>
              <Space size={6} wrap>
                <Tag color="blue">{record.category}</Tag>
                <Tag color="purple">{formatLabels[record.format]}</Tag>
                {record.tags?.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Space>
          </Space>
        ),
        width: 360,
        ellipsis: true,
      },
      {
        title: "Tồn kho",
        key: "inventory",
        responsive: ["lg"],
        render: (_, record) => {
          const percent =
            record.totalCopies === 0 ? 0 : Math.round((record.availableCopies / record.totalCopies) * 100);
          return (
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {record.availableCopies}/{record.totalCopies} bản khả dụng
              </Text>
              <Progress percent={percent} size="small" status={percent <= 20 ? "exception" : "active"} />
              <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                {record.reservedCount} đặt chỗ · {record.overdueCount} quá hạn
              </Text>
            </Space>
          );
        },
        width: 220,
      },
      {
        title: "Số lượt mượn",
        dataIndex: "borrowedCount",
        key: "borrowedCount",
        align: "center",
        responsive: ["md"],
        render: (value: number) => <Text strong>{value}</Text>,
        width: 140,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: BookStatus) => {
          const meta = getStatusMeta(status);
          return (
            <Tag color={meta.color} icon={meta.icon} style={{ marginInlineEnd: 0 }}>
              {statusLabels[status]}
            </Tag>
          );
        },
        width: 140,
      },
      {
        title: "Cập nhật",
        dataIndex: "lastActivity",
        key: "lastActivity",
        responsive: ["xl"],
        render: (value: string) => (
          <Space direction="vertical" size={2}>
            <Text strong style={{ whiteSpace: "nowrap" }}>{formatDate(value)}</Text>
            <Text type="secondary" style={{ whiteSpace: "nowrap" }}>{timeAgo(value)}</Text>
          </Space>
        ),
        width: 160,
      },
      {
        title: "",
        key: "actions",
        fixed: "right" as const,
        render: () => (
          <Space direction="vertical" size={0}>
            <Button type="link" size="small" icon={<InfoCircleOutlined />}>
              Chi tiết
            </Button>
            <Button type="link" size="small" icon={<InboxOutlined />}>
              Nhập kho
            </Button>
          </Space>
        ),
        width: screens.md ? 120 : 60,
      },
    ],
    [token.colorPrimary, screens.md],
  );

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
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
            Danh mục sách
          </Text>
          <Text type="secondary">Kết quả phù hợp: {data.length}</Text>
        </Space>
        
        <Space wrap 
          style={{ 
            width: screens.lg ? 'auto' : '100%', 
            }}>
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
            ]}
            style={{ minWidth: 150, flex: screens.lg ? 'none' : 1 }}
            size={screens.md ? "large" : "middle"}
          />
          <Select
            value={categoryFilter}
            onChange={onCategoryChange}
            options={[
              { value: "all", label: "Tất cả chuyên mục" },
              ...categories.map((category) => ({ value: category, label: category })),
            ]}
            style={{ minWidth: 180, flex: screens.lg ? 'none' : 1 }}
            size={screens.md ? "large" : "middle"}
          />
          <Search
            placeholder="Tìm theo tựa sách, tác giả, ISBN..."
            allowClear
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onSearch={onSearchSubmit}
            style={{ width: screens.sm ? 260 : '100%' }}
            size={screens.md ? "large" : "middle"}
          />
        </Space>
      </div>
      <div style={{ minHeight: 780, overflow: "auto", margin: "0 auto"}}>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        rowKey="id"
        scroll={{ x: 1200 }}
        style={{ borderRadius: 16 }}
      />
      </div>
    </Card>
  );
}

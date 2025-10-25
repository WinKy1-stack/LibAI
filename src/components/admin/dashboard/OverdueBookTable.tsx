import type { ColumnsType } from "antd/es/table";
import { Table, Avatar, Space, Typography, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { OverdueBook } from "../../../types";
import StatusTag from "./StatusTag";

const { Text } = Typography;

interface OverdueBookTableProps {
  dataSource: OverdueBook[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function OverdueBookTable({
  dataSource,
  loading = false,
  currentPage,
  pageSize,
  total,
  onPageChange,
}: OverdueBookTableProps) {
  const columns: ColumnsType<OverdueBook> = [
    {
      title: "User ID",
      dataIndex: "userId",
      width: 100,
      responsive: ["md"],
    },
    {
      title: "User Name",
      dataIndex: "userName",
      width: 200,
      ellipsis: true,
      render: (name: string) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: "#ff4757" }}>
            {name.charAt(0)}
          </Avatar>
          <Text strong ellipsis={{ tooltip: name }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Book ID",
      dataIndex: "bookId",
      width: 140,
      responsive: ["lg"],
    },
    {
      title: "Title",
      dataIndex: "title",
      ellipsis: true,
      render: (title: string) => (
        <Text ellipsis={{ tooltip: title }}>{title}</Text>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
      width: 180,
      responsive: ["xl"],
      ellipsis: { showTitle: true },
    },
    {
      title: "Overdue",
      dataIndex: "overdueDays",
      width: 100,
      align: "center",
      render: (days: number) => (
        <Text strong>{days > 0 ? `${days} days` : "-"}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: "Fine",
      dataIndex: "fine",
      width: 120,
      align: "right",
      render: (fine: number) => (
        <Text strong style={{ color: fine > 0 ? "#f5222d" : undefined }}>
          {fine > 0 ? `BDT. ${fine}` : "-"}
        </Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      align: "center",
      fixed: "right",
      render: () => <Button type="text" icon={<MoreOutlined />} />,
    },
  ];

  return (
    <Table
      size="middle"
      rowKey="key"
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        onChange: onPageChange,
        showSizeChanger: false,
        position: ["bottomCenter"],
      }}
    />
  );
}


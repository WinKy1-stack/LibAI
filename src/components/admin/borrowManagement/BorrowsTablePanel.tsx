import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Avatar,
  Space,
  Input,
  Select,
  Card,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  BellOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { BorrowRecord, BorrowStatus } from "../../../data/mockBorrows";

const { Text } = Typography;
const { useToken } = theme;

interface BorrowsTablePanelProps {
  borrows: BorrowRecord[];
  loading?: boolean;
}

const getStatusConfig = (
  status: BorrowStatus
): { text: string; color: string } => {
  const configs = {
    borrowed: { text: "Đang mượn", color: "blue" },
    returned: { text: "Đã trả", color: "green" },
    overdue: { text: "Quá hạn", color: "red" },
    lost: { text: "Mất sách", color: "default" },
  };
  return configs[status];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const BorrowsTablePanel = ({
  borrows,
  loading = false,
}: BorrowsTablePanelProps) => {
  const { token } = useToken();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | "all">("all");

  // Filter data
  const filteredData = borrows.filter((record) => {
    const matchesSearch =
      record.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.bookTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      record.id.toLowerCase().includes(searchText.toLowerCase()) ||
      record.userEmail.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<BorrowRecord> = [
    {
      title: "Mã mượn",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: "Người mượn",
      key: "user",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar src={record.userAvatar} size={40}>
            {record.userName.charAt(0)}
          </Avatar>
          <div>
            <div>
              <Text strong>{record.userName}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.userEmail}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Sách",
      key: "book",
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.bookCover}
            shape="square"
            size={50}
            icon={<SearchOutlined />}
          />
          <div>
            <div>
              <Text strong>{record.bookTitle}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.bookAuthor}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Hạn trả",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Ngày trả",
      dataIndex: "returnDate",
      key: "returnDate",
      width: 120,
      render: (date?: string) => (date ? formatDate(date) : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: BorrowStatus) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Gia hạn",
      dataIndex: "renewalCount",
      key: "renewalCount",
      width: 80,
      align: "center",
      render: (count: number) => <Text>{count} lần</Text>,
    },
    {
      title: "Phí phạt",
      dataIndex: "fineAmount",
      key: "fineAmount",
      width: 120,
      align: "right",
      render: (amount: number) => (
        <Text type={amount > 0 ? "danger" : "secondary"}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => console.log("View", record.id)}
            />
          </Tooltip>
          {record.status === "borrowed" && (
            <Tooltip title="Gia hạn">
              <Button
                type="link"
                icon={<ReloadOutlined />}
                onClick={() => console.log("Renew", record.id)}
              />
            </Tooltip>
          )}
          {record.status === "overdue" && (
            <Tooltip title="Nhắc nhở">
              <Button
                type="link"
                danger
                icon={<BellOutlined />}
                onClick={() => console.log("Remind", record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Space wrap>
          <Input
            placeholder="Tìm theo người mượn, sách, mã mượn..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Đang mượn", value: "borrowed" },
              { label: "Đã trả", value: "returned" },
              { label: "Quá hạn", value: "overdue" },
              { label: "Mất sách", value: "lost" },
            ]}
          />
        </Space>
        <Text type="secondary">
          Hiển thị {filteredData.length} / {borrows.length} bản ghi
        </Text>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
      />
    </Card>
  );
};

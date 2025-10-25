import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Avatar, Typography, theme } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { dashboardUsers, type UserRecord } from "../../../data";

const { Text } = Typography;
const { useToken } = theme;

export default function UsersTable() {
  const { token } = useToken();

  const columns: ColumnsType<UserRecord> = [
    { 
      title: "User ID", 
      dataIndex: "id", 
      width: 100,
      responsive: ["sm"],
    },
    {
      title: "User Name",
      dataIndex: "name",
      ellipsis: true,
      render: (t: string) => (
        <Space>
          <Avatar 
            size={32} 
            style={{ backgroundColor: "#ff4757" }}
          >
            {t.charAt(0)}
          </Avatar>
          <Text strong ellipsis={{ tooltip: t }}>{t}</Text>
        </Space>
      ),
    },
    { 
      title: "Book Issued", 
      dataIndex: "issued", 
      align: "center", 
      width: 120,
      render: (n: number) => <Text strong>{n}</Text>,
    },
    { 
      title: "Department", 
      dataIndex: "dept", 
      responsive: ["md"],
      ellipsis: { showTitle: true },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: () => (
        <Button type="text" icon={<MoreOutlined />} />
      ),
      width: 80,
    },
  ];

  return (
    <Card 
      title={<Text strong style={{ fontSize: 24, fontWeight: 600 }}>Danh sách người dùng</Text>}
      extra={
        <Button 
          type="primary" 
          size="middle"
          style={{ borderRadius: 8 }}
        >
          Thêm người dùng
        </Button>
      } 
      variant="borderless"
      style={{ borderRadius: 16 }}
    >
      <Table
        size="middle"
        rowKey="key"
        dataSource={dashboardUsers}
        columns={columns}
        pagination={false}
        scroll={{ x: 480 }}
      />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button type="link" style={{ color: token.colorPrimary }}>See All</Button>
      </div>
    </Card>
  );
}

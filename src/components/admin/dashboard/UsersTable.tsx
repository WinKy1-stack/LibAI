import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Avatar, Typography, theme } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { dashboardUsers, type UserRecord } from "../../../data";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const { Text } = Typography;
const { useToken } = theme;

export default function UsersTable() {
  const { token } = useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

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
            style={{ backgroundColor: token.colorPrimary }}
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
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Table
        size="middle"
        rowKey="key"
        dataSource={dashboardUsers}
        columns={columns}
        loading={{
          spinning: loading,
          indicator: <></>,
        }}
        pagination={false}
        scroll={{ x: 480 }}
      />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button type="link" style={{ color: token.colorPrimary }} onClick={() => navigate('/admin/users')}>Xem thêm</Button>
      </div>
    </Card>
  );
}

import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Avatar, Typography, theme } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useUsers } from "../../../hooks/useAdminQueries";

const { Text } = Typography;
const { useToken } = theme;

interface DashboardUserRecord {
  key: number;
  student_id?: string;
  name: string;
  email: string;
  issued: number;
  dept: string;
}

export default function UsersTable() {
  const { token } = useToken();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();

  // Map users to UserRecord format and get last 5 (newest users)
  const dashboardUsers: DashboardUserRecord[] = useMemo(() => {
    // Sort by joinDate (newest first) and get first 5
    const sortedUsers = [...users].sort((a, b) => {
      const dateA = new Date(a.joinDate).getTime();
      const dateB = new Date(b.joinDate).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return sortedUsers
      .slice(0, 5) // Get first 5 (newest users)
      .map((user, index) => ({
        key: index + 1,
        student_id: user.student_id,
        name: user.name,
        email: user.email,
        issued: user.totalBorrowed,
        dept: user.department,
      }));
  }, [users]);

  const columns: ColumnsType<DashboardUserRecord> = [
    { 
      title: "MSSV", 
      dataIndex: "student_id", 
      width: 100,
      responsive: ["sm"],
      render: (student_id: string) => <Text strong>{student_id}</Text>,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      ellipsis: true,
      render: (name: string, record: DashboardUserRecord) => (
        <Space>
          <Avatar
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${record.email || 'user'}`}
            size={32}
          >
            {name.charAt(0)}
          </Avatar>
          <Text strong ellipsis={{ tooltip: name }}>{name}</Text>
        </Space>
      ),
    },
    { 
      title: "Số lượt mượn", 
      dataIndex: "issued", 
      align: "center", 
      width: 120,
      render: (n: number) => <Text strong>{n}</Text>,
    },
    { 
      title: "Khoa/Bộ phận", 
      dataIndex: "dept", 
      responsive: ["md"],
      ellipsis: { showTitle: true },
    },
    {
      title: "Hành động",
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
        loading={isLoading}
        pagination={false}
        scroll={{ x: 480 }}
      />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button type="link" style={{ color: token.colorPrimary }} onClick={() => navigate('/admin/users')}>Xem thêm</Button>
      </div>
    </Card>
  );
}

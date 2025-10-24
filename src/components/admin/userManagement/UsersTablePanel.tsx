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
  theme,
  Grid,
} from "antd";
import {
  BellOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { AdminUser, UserRole, UserStatus } from "../../../data/mockUsers";
import { roleLabels, statusLabels } from "./constants";
import { getStatusBadge, formatDate } from "./utils";

const { Text } = Typography;
const { Search } = Input;

interface UsersTablePanelProps {
  data: AdminUser[];
  statusFilter: "all" | UserStatus;
  roleFilter: "all" | UserRole;
  searchValue: string;
  onStatusChange: (value: "all" | UserStatus) => void;
  onRoleChange: (value: "all" | UserRole) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

export function UsersTablePanel({
  data,
  statusFilter,
  roleFilter,
  searchValue,
  onStatusChange,
  onRoleChange,
  onSearchChange,
  onSearchSubmit,
}: UsersTablePanelProps) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  const columns: ColumnsType<AdminUser> = useMemo(
    () => [
      {
        title: "Người dùng",
        dataIndex: "name",
        key: "user",
        render: (_, record) => (
          <Space align="center" size={12}>
            <Avatar src={record.avatar} icon={!record.avatar ? <TeamOutlined /> : undefined} size={36}>
              {record.name.charAt(0)}
            </Avatar>
            <Space direction="vertical" size={2}>
              <Text strong ellipsis={{ tooltip: record.name }}>{record.name}</Text>
              <Space size={8}>
                <Tag color={token.colorPrimary} style={{ color: token.colorWhite, marginInlineEnd: 0 }}>
                  {roleLabels[record.role]}
                </Tag>
                <Text type="secondary">{record.id}</Text>
              </Space>
            </Space>
          </Space>
        ),
        width: 280,
        ellipsis: true,
      },
      {
        title: "Thông tin liên hệ",
        key: "contact",
        responsive: ["lg"],
        ellipsis: true,
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            <Space size={6}>
              <MailOutlined />
              <Text ellipsis={{ tooltip: record.email }}>{record.email}</Text>
            </Space>
            <Space size={6}>
              <PhoneOutlined />
              <Text>{record.phone ?? "—"}</Text>
            </Space>
            <Space size={6}>
              <EnvironmentOutlined />
              <Text>{record.city ?? "—"}</Text>
            </Space>
          </Space>
        ),
        width: 240,
      },
      {
        title: "Khoa/Bộ phận",
        dataIndex: "department",
        key: "department",
        responsive: ["md"],
        ellipsis: { showTitle: true },
        width: 150,
      },
      {
        title: "Hiệu suất",
        key: "performance",
        responsive: ["xl"],
        render: (_, record) => (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Text strong style={{ whiteSpace: "nowrap" }}>{record.totalBorrowed} lượt mượn</Text>
            <Text type="secondary" style={{ whiteSpace: "nowrap" }}>{record.overdueBooks} sách quá hạn</Text>
            <Progress
              percent={record.completionRate}
              size="small"
              status={record.completionRate >= 75 ? "active" : record.completionRate >= 50 ? "normal" : "exception"}
            />
          </Space>
        ),
        width: 180,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: UserStatus) => {
          const { color, icon } = getStatusBadge(status);
          return (
            <Tag icon={icon} color={color} style={{ marginInlineEnd: 0 }}>
              {statusLabels[status]}
            </Tag>
          );
        },
        width: 160,
      },
      {
        title: "Hoạt động gần nhất",
        key: "lastLogin",
        responsive: ["xxl"],
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            <Text style={{ whiteSpace: "nowrap" }}>{formatDate(record.lastLogin)}</Text>
            <Text type="secondary" style={{ whiteSpace: "nowrap" }}>Gia nhập: {formatDate(record.joinDate)}</Text>
          </Space>
        ),
        width: 180,
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
            <Button type="link" size="small" icon={<BellOutlined />}>
              Nhắc nhở
            </Button>
          </Space>
        ),
        width: screens.md ? 120 : 60,
      },
    ],
    [token.colorPrimary, token.colorWhite, screens.md],
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
            Danh sách người dùng
          </Text>
          <Text type="secondary">Kết quả phù hợp: {data.length}</Text>
        </Space>
        
        <Space wrap style={{ width: screens.lg ? 'auto' : '100%' }}>
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
            ]}
            style={{ minWidth: 160, flex: screens.lg ? 'none' : 1 }}
            size={screens.md ? "large" : "middle"}
          />
          <Select
            value={roleFilter}
            onChange={onRoleChange}
            options={[
              { value: "all", label: "Tất cả vai trò" },
              ...Object.entries(roleLabels).map(([value, label]) => ({ value, label })),
            ]}
            style={{ minWidth: 150, flex: screens.lg ? 'none' : 1 }}
            size={screens.md ? "large" : "middle"}
          />
          <Search
            placeholder="Tìm theo tên, email hoặc mã"
            allowClear
            onSearch={onSearchSubmit}
            onChange={(event) => onSearchChange(event.target.value)}
            value={searchValue}
            style={{ width: screens.sm ? 240 : '100%' }}
            size={screens.md ? "large" : "middle"}
          />
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 6,
          showSizeChanger: false,
          position: ["bottomRight"],
        }}
        rowKey="id"
        scroll={{ x: 1200 }}
        style={{ borderRadius: 16 }}
      />
    </Card>
  );
}

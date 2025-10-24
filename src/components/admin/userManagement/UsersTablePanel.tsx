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
  EnvironmentOutlined,
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
          <Space direction="vertical" size={0}>
            <Space align="center">
              <Avatar src={record.avatar} icon={!record.avatar ? <TeamOutlined /> : undefined} size={36}>
                {record.name.charAt(0)}
              </Avatar>
              <div>
                <Text strong>{record.name}</Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color={token.colorPrimary} style={{ color: token.colorWhite, marginInlineEnd: 0 }}>
                    {roleLabels[record.role]}
                  </Tag>
                  <Text type="secondary">{record.id}</Text>
                </div>
              </div>
            </Space>
          </Space>
        ),
        width: 280,
      },
      {
        title: "Thông tin liên hệ",
        key: "contact",
        responsive: ["lg"],
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            <Space size={6}>
              <MailOutlined />
              <Text>{record.email}</Text>
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
      },
      {
        title: "Hiệu suất",
        key: "performance",
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Text strong>{record.totalBorrowed} lượt mượn</Text>
            <Text type="secondary">{record.overdueBooks} sách quá hạn</Text>
            <Progress
              percent={record.completionRate}
              size="small"
              status={record.completionRate >= 75 ? "active" : record.completionRate >= 50 ? "normal" : "exception"}
            />
          </Space>
        ),
        width: 200,
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
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Text>{formatDate(record.lastLogin)}</Text>
            <Text type="secondary">Gia nhập: {formatDate(record.joinDate)}</Text>
          </Space>
        ),
        width: 180,
      },
      {
        title: "",
        key: "actions",
        fixed: screens.lg ? undefined : "right",
        render: () => (
          <Space size="small">
            <Button type="link">Chi tiết</Button>
            <Button type="link">Nhắc nhở</Button>
          </Space>
        ),
        width: 120,
      },
    ],
    [token.colorPrimary, token.colorWhite, screens.lg],
  );

  return (
    <Card
      title={
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 18 }}>
            Danh sách người dùng
          </Text>
          <Text type="secondary">Kết quả phù hợp: {data.length}</Text>
        </Space>
      }
      extra={
        <Space wrap>
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
            ]}
            style={{ minWidth: 160 }}
            size={screens.md ? "large" : "middle"}
          />
          <Select
            value={roleFilter}
            onChange={onRoleChange}
            options={[
              { value: "all", label: "Tất cả vai trò" },
              ...Object.entries(roleLabels).map(([value, label]) => ({ value, label })),
            ]}
            style={{ minWidth: 150 }}
            size={screens.md ? "large" : "middle"}
          />
          <Search
            placeholder="Tìm theo tên, email hoặc mã"
            allowClear
            onSearch={onSearchSubmit}
            onChange={(event) => onSearchChange(event.target.value)}
            value={searchValue}
            style={{ width: screens.sm ? 240 : "100%" }}
            size={screens.md ? "large" : "middle"}
          />
        </Space>
      }
      variant="borderless"
      style={{ borderRadius: 16 }}
      styles={{ body: { padding: 0 } }}
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 6,
          showSizeChanger: false,
          position: ["bottomRight"],
        }}
        rowKey="id"
        scroll={{ x: 960 }}
        style={{ borderRadius: 16 }}
      />
    </Card>
  );
}

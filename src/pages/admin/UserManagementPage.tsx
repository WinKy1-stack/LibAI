import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Grid,
  Input,
  List,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  TeamOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  StopFilled,
  UserAddOutlined,
  FilterOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MailOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import StatCard from "../../components/admin/dashboard/StatCard";
import {
  adminUsers,
  latestUserActivities,
  userRetentionTrend,
  userRoleDistribution,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "../../data/mockUsers";

const { Title, Text } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

const statusLabels: Record<UserStatus, string> = {
  active: "Đang hoạt động",
  pending: "Chờ duyệt",
  inactive: "Ngừng hoạt động",
  banned: "Tạm khóa",
};

const roleLabels: Record<UserRole, string> = {
  student: "Sinh viên",
  teacher: "Giảng viên",
  librarian: "Thủ thư",
  administrator: "Quản trị viên",
};

export default function UserManagementPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { token } = theme.useToken();

  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [searchValue, setSearchValue] = useState("");

  const totals = useMemo(() => {
    const active = adminUsers.filter((user) => user.status === "active").length;
    const pending = adminUsers.filter((user) => user.status === "pending").length;
    const flagged = adminUsers.filter((user) => user.status === "banned" || user.overdueBooks >= 3).length;
    const completedAverage =
      Math.round(adminUsers.reduce((acc, user) => acc + user.completionRate, 0) / adminUsers.length);

    return {
      total: adminUsers.length,
      active,
      pending,
      flagged,
      completedAverage,
    };
  }, []);

  const totalRoleCount = useMemo(
    () => userRoleDistribution.reduce((accumulator, item) => accumulator + item.count, 0),
    []
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return adminUsers.filter((user) => {
      const matchSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.id.toLowerCase().includes(normalizedSearch);

      const matchStatus = statusFilter === "all" ? true : user.status === statusFilter;
      const matchRole = roleFilter === "all" ? true : user.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [statusFilter, roleFilter, searchValue]);

  const tableColumns: ColumnsType<AdminUser> = [
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
  ];

  const retentionChange = useMemo(() => {
    if (userRetentionTrend.length < 2) {
      return { active: 0, churn: 0 };
    }
    const last = userRetentionTrend[userRetentionTrend.length - 1];
    const previous = userRetentionTrend[userRetentionTrend.length - 2];
    return {
      active: last.active - previous.active,
      churn: last.churned - previous.churned,
    };
  }, []);

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Card
            style={{ borderRadius: 16 }}
            variant="borderless"
            styles={{ body: { padding: isMobile ? 16 : 20 } }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Space direction="vertical" size={4}>
                  <Title level={3} style={{ margin: 0 }}>
                    Quản lý người dùng
                  </Title>
                  <Text type="secondary">
                    Theo dõi hoạt động, thống kê hiệu suất và quản trị vòng đời người dùng.
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={12} style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                <Space wrap>
                  <Button icon={<FilterOutlined />} size={isMobile ? "middle" : "large"}>
                    Bộ lọc nâng cao
                  </Button>
                  <Button icon={<DownloadOutlined />} size={isMobile ? "middle" : "large"}>
                    Xuất báo cáo
                  </Button>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    size={isMobile ? "middle" : "large"}
                    style={{ borderRadius: 10 }}
                  >
                    Thêm người dùng
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <StatCard title="Tổng người dùng" value={totals.total} icon={<TeamOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard title="Đang hoạt động" value={totals.active} icon={<CheckCircleFilled />} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard title="Chờ phê duyệt" value={totals.pending} icon={<ClockCircleFilled />} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard title="Cần xem xét" value={totals.flagged} icon={<StopFilled />} />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 18 }}>
                      Danh sách người dùng
                    </Text>
                    <Text type="secondary">Kết quả phù hợp: {filteredUsers.length}</Text>
                  </Space>
                }
                extra={
                  <Space wrap>
                    <Select
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value)}
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "active", label: statusLabels.active },
                        { value: "pending", label: statusLabels.pending },
                        { value: "inactive", label: statusLabels.inactive },
                        { value: "banned", label: statusLabels.banned },
                      ]}
                      onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                      style={{ minWidth: 160 }}
                      size={isMobile ? "middle" : "large"}
                    />
                    <Select
                      value={roleFilter}
                      onChange={(value) => setRoleFilter(value as typeof roleFilter)}
                      options={[
                        { value: "all", label: "Tất cả vai trò" },
                        ...Object.entries(roleLabels).map(([value, label]) => ({ value, label })),
                      ]}
                      style={{ minWidth: 150 }}
                      size={isMobile ? "middle" : "large"}
                    />
                    <Search
                      placeholder="Tìm theo tên, email hoặc mã"
                      allowClear
                      onSearch={setSearchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      value={searchValue}
                      style={{ width: screens.sm ? 240 : "100%" }}
                      size={isMobile ? "middle" : "large"}
                    />
                  </Space>
                }
                variant="borderless"
                style={{ borderRadius: 16 }}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  columns={tableColumns}
                  dataSource={filteredUsers}
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
            </Col>
            <Col xs={24} lg={8}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card
                  title="Tỷ lệ giữ chân người dùng"
                  variant="borderless"
                  style={{ borderRadius: 16 }}
                >
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Space size={16} wrap>
                      <Badge
                        color={token.colorSuccess}
                        text={
                          <Space>
                            <ArrowUpOutlined /> Hoạt động tháng này: {userRetentionTrend.at(-1)?.active ?? 0}%
                          </Space>
                        }
                      />
                      <Badge
                        color={token.colorError}
                        text={
                          <Space>
                            <ArrowDownOutlined /> Rời hệ thống: {userRetentionTrend.at(-1)?.churned ?? 0}%
                          </Space>
                        }
                      />
                    </Space>
                    <Space size={16} wrap>
                      <Tag color={retentionChange.active >= 0 ? "success" : "warning"}>
                        Biến động hoạt động: {formatDelta(retentionChange.active)}%
                      </Tag>
                      <Tag color={retentionChange.churn <= 0 ? "processing" : "error"}>
                        Biến động rời hệ thống: {formatDelta(retentionChange.churn)}%
                      </Tag>
                    </Space>

                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      {userRetentionTrend.map((item) => (
                        <div
                          key={item.month}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            background: token.colorFillTertiary,
                            borderRadius: 12,
                            padding: "12px 14px",
                          }}
                        >
                          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                            <Text strong>{item.month}</Text>
                            <Text type="secondary">{item.active}% giữ chân</Text>
                          </Space>
                          <Progress
                            percent={item.active}
                            strokeColor={token.colorSuccess}
                            size="small"
                            style={{ marginBottom: 0 }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Rời hệ thống: {item.churned}%
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </Space>
                </Card>

                <Card
                  title="Cơ cấu vai trò"
                  variant="borderless"
                  style={{ borderRadius: 16 }}
                >
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    {userRoleDistribution.map((item) => {
                      const percent =
                        totalRoleCount === 0 ? 0 : Math.round((item.count / totalRoleCount) * 100);
                      return (
                        <div key={item.role}>
                          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                            <Text strong>{roleLabels[item.role]}</Text>
                            <Text type="secondary">{item.count} người</Text>
                          </Space>
                          <Progress
                            percent={percent}
                            strokeColor={
                              item.role === "administrator"
                                ? token.colorWarning
                                : item.role === "librarian"
                                ? token.colorPrimary
                                : token.colorInfo
                            }
                            size="small"
                          />
                        </div>
                      );
                    })}
                    <Card
                      style={{
                        borderRadius: 14,
                        background: token.colorFillSecondary,
                      }}
                      bordered={false}
                    >
                      <Space direction="vertical" size={6}>
                        <Text strong style={{ fontSize: 16 }}>
                          Hiệu suất trung bình
                        </Text>
                        <Text type="secondary">
                          Điểm hoàn thành nhiệm vụ mượn trả trung bình của toàn bộ hệ thống.
                        </Text>
                        <Progress
                          percent={totals.completedAverage}
                          strokeColor={token.colorSuccess}
                          status="active"
                          size="small"
                        />
                      </Space>
                    </Card>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>

          <Card
            title="Hoạt động mới nhất"
            variant="borderless"
            style={{ borderRadius: 16 }}
            extra={<Button type="link">Xem toàn bộ nhật ký</Button>}
          >
            <List
              dataSource={latestUserActivities}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag>{item.id}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text>{item.action}</Text>
                        <Text type="secondary">{item.timestamp}</Text>
                      </Space>
                    }
                  />
                  <Button type="link">Chi tiết</Button>
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </div>
    </AdminLayout>
  );
}

function getStatusBadge(status: UserStatus): { color: string; icon: ReactNode } {
  switch (status) {
    case "active":
      return { color: "success", icon: <CheckCircleFilled /> };
    case "pending":
      return { color: "processing", icon: <ClockCircleFilled /> };
    case "inactive":
      return { color: "default", icon: <ClockCircleFilled /> };
    case "banned":
      return { color: "error", icon: <StopFilled /> };
    default:
      return { color: "default", icon: null };
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDelta(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  if (value < 0) {
    return `${value}`;
  }
  return "0";
}

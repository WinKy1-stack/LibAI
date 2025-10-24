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
  BookOutlined,
  InboxOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  PauseCircleFilled,
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import StatCard from "../../components/admin/dashboard/StatCard";
import {
  adminBooks,
  categoryDistribution,
  latestBookActivities,
  monthlyBorrowTrend,
  type AdminBook,
  type BookStatus,
  type BookFormat,
} from "../../data/mockBooks";

const { Title, Text } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

const statusLabels: Record<BookStatus, string> = {
  available: "Có sẵn",
  loaned: "Đang mượn",
  reserved: "Đã đặt chỗ",
  archived: "Lưu trữ",
};

const statusColors: Record<BookStatus, { color: string; icon: ReactNode }> = {
  available: { color: "success", icon: <CheckCircleFilled /> },
  loaned: { color: "processing", icon: <ReadOutlined /> },
  reserved: { color: "warning", icon: <ClockCircleFilled /> },
  archived: { color: "default", icon: <PauseCircleFilled /> },
};

const formatLabels: Record<BookFormat, string> = {
  hardcover: "Bìa cứng",
  paperback: "Bìa mềm",
  ebook: "Ebook",
  audiobook: "Audiobook",
};

export default function BooksManagementPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { token } = theme.useToken();

  const [statusFilter, setStatusFilter] = useState<"all" | BookStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [searchValue, setSearchValue] = useState("");

  const totals = useMemo(() => {
    const totalBooks = adminBooks.reduce((acc, book) => acc + book.totalCopies, 0);
    const totalAvailable = adminBooks.reduce((acc, book) => acc + book.availableCopies, 0);
    const totalLoaned = adminBooks.reduce((acc, book) => acc + (book.totalCopies - book.availableCopies), 0);
    const totalOverdue = adminBooks.reduce((acc, book) => acc + book.overdueCount, 0);

    return {
      titles: adminBooks.length,
      totalBooks,
      totalAvailable,
      totalLoaned,
      totalOverdue,
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    return adminBooks.filter((book) => {
      const matchSearch =
        !normalized ||
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.isbn.toLowerCase().includes(normalized);

      const matchStatus = statusFilter === "all" ? true : book.status === statusFilter;
      const matchCategory = categoryFilter === "all" ? true : book.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [categoryFilter, statusFilter, searchValue]);

  const tableColumns: ColumnsType<AdminBook> = [
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
            style={{ backgroundColor: token.colorPrimary, color: token.colorWhite }}
            icon={!record.cover ? <BookOutlined /> : undefined}
          >
            {!record.cover ? record.title.charAt(0) : null}
          </Avatar>
          <Space direction="vertical" size={2}>
            <Text strong>{record.title}</Text>
            <Text type="secondary">
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
    },
    {
      title: "Tồn kho",
      key: "inventory",
      render: (_, record) => {
        const percent = record.totalCopies === 0 ? 0 : Math.round((record.availableCopies / record.totalCopies) * 100);
        return (
          <Space direction="vertical" size={2}>
            <Text strong>
              {record.availableCopies}/{record.totalCopies} bản khả dụng
            </Text>
            <Progress percent={percent} size="small" status={percent <= 20 ? "exception" : "active"} />
            <Text type="secondary">{record.reservedCount} đặt chỗ · {record.overdueCount} quá hạn</Text>
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
      render: (value: number) => <Text strong>{value}</Text>,
      width: 140,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: BookStatus) => {
        const { color, icon } = statusColors[status];
        return (
          <Tag color={color} icon={icon} style={{ marginInlineEnd: 0 }}>
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
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{formatDate(date)}</Text>
          <Text type="secondary">{timeAgo(date)}</Text>
        </Space>
      ),
      width: 160,
    },
    {
      title: "",
      key: "actions",
      fixed: screens.lg ? undefined : "right",
      render: () => (
        <Space size={4}>
          <Button type="link">Chi tiết</Button>
          <Button type="link">Nhập kho</Button>
        </Space>
      ),
      width: 140,
    },
  ];

  const borrowDelta = useMemo(() => {
    if (monthlyBorrowTrend.length < 2) {
      return { borrowed: 0, returned: 0 };
    }

    const last = monthlyBorrowTrend[monthlyBorrowTrend.length - 1];
    const previous = monthlyBorrowTrend[monthlyBorrowTrend.length - 2];
    return {
      borrowed: last.borrowed - previous.borrowed,
      returned: last.returned - previous.returned,
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
                    Quản lý sách
                  </Title>
                  <Text type="secondary">Kiểm soát kho sách, lượt mượn và tình trạng tồn kho theo thời gian thực.</Text>
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
                    icon={<PlusOutlined />}
                    size={isMobile ? "middle" : "large"}
                    style={{ borderRadius: 10 }}
                  >
                    Thêm đầu sách
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <StatCard title="Đầu sách" value={totals.titles} icon={<BookOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard title="Tổng bản in" value={totals.totalBooks} icon={<DatabaseOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard title="Đang mượn" value={totals.totalLoaned} icon={<ReadOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard title="Quá hạn" value={totals.totalOverdue} icon={<InboxOutlined />} />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 18 }}>
                      Danh mục sách
                    </Text>
                    <Text type="secondary">Kết quả phù hợp: {filteredBooks.length}</Text>
                  </Space>
                }
                extra={
                  <Space wrap>
                    <Select
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
                      ]}
                      style={{ minWidth: 150 }}
                      size={isMobile ? "middle" : "large"}
                    />
                    <Select
                      value={categoryFilter}
                      onChange={(value) => setCategoryFilter(value as typeof categoryFilter)}
                      options={[
                        { value: "all", label: "Tất cả chuyên mục" },
                        ...categoryDistribution.map((item) => ({ value: item.category, label: item.category })),
                      ]}
                      style={{ minWidth: 180 }}
                      size={isMobile ? "middle" : "large"}
                    />
                    <Search
                      placeholder="Tìm theo tựa sách, tác giả, ISBN..."
                      allowClear
                      onSearch={setSearchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      value={searchValue}
                      style={{ width: screens.sm ? 260 : "100%" }}
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
                  dataSource={filteredBooks}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  rowKey="id"
                  scroll={{ x: 1024 }}
                  style={{ borderRadius: 16 }}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card title="Kho sách theo chuyên mục" variant="borderless" style={{ borderRadius: 16 }}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    {categoryDistribution.map((item) => {
                      const percent =
                        totals.totalBooks === 0 ? 0 : Math.round((item.count / totals.totalBooks) * 100);
                      return (
                        <div
                          key={item.category}
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: token.colorFillTertiary,
                          }}
                        >
                          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                            <Space size={8}>
                              <AppstoreOutlined />
                              <Text strong>{item.category}</Text>
                            </Space>
                            <Text type="secondary">{item.count} bản</Text>
                          </Space>
                          <Progress
                            percent={percent}
                            strokeColor={token.colorPrimary}
                            size="small"
                            style={{ marginBottom: 0, marginTop: 8 }}
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
                          Sẵn có hiện tại
                        </Text>
                        <Text type="secondary">Tỷ lệ sách đang có sẵn trong kho so với tổng bản in.</Text>
                        <Progress
                          percent={
                            totals.totalBooks === 0
                              ? 0
                              : Math.round((totals.totalAvailable / totals.totalBooks) * 100)
                          }
                          strokeColor={token.colorSuccess}
                          status="active"
                          size="small"
                        />
                      </Space>
                    </Card>
                  </Space>
                </Card>

                <Card title="Xu hướng mượn sách" variant="borderless" style={{ borderRadius: 16 }}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Space wrap>
                      <Badge
                        color={token.colorSuccess}
                        text={
                          <Space>
                            <ArrowUpOutlined /> Mượn tháng này: {monthlyBorrowTrend.at(-1)?.borrowed ?? 0}
                          </Space>
                        }
                      />
                      <Badge
                        color={token.colorInfo}
                        text={
                          <Space>
                            <ArrowDownOutlined /> Trả tháng này: {monthlyBorrowTrend.at(-1)?.returned ?? 0}
                          </Space>
                        }
                      />
                    </Space>
                    <Space wrap>
                      <Tag color={borrowDelta.borrowed >= 0 ? "success" : "warning"}>
                        Biến động mượn: {formatDelta(borrowDelta.borrowed)}
                      </Tag>
                      <Tag color={borrowDelta.returned >= 0 ? "processing" : "error"}>
                        Biến động trả: {formatDelta(borrowDelta.returned)}
                      </Tag>
                    </Space>

                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      {monthlyBorrowTrend.map((item) => (
                        <div
                          key={item.month}
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: token.colorFillTertiary,
                          }}
                        >
                          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                            <Text strong>{item.month}</Text>
                            <Text type="secondary">{item.borrowed} lượt mượn</Text>
                          </Space>
                          <Progress
                            percent={Math.min(Math.round((item.borrowed / 700) * 100), 100)}
                            strokeColor={token.colorPrimary}
                            size="small"
                            style={{ marginBottom: 0, marginTop: 8 }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Đã trả: {item.returned} lượt
                          </Text>
                        </div>
                      ))}
                    </Space>
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
              dataSource={latestBookActivities}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<BookOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
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

function timeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  const days = Math.round(hours / 24);
  return `${days} ngày trước`;
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

import { Card, Table, Tag, Button, Space, Input, Select, Row, Col, Typography, Badge, theme } from "antd";
import { DownloadOutlined, SearchOutlined, EyeOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { ReportItem, ReportType, ReportStatus, ReportCategory } from "../../../data/mockReports";

const { Text } = Typography;
const { useToken } = theme;

interface ReportTablePanelProps {
  data: ReportItem[];
  typeFilter: "all" | ReportType;
  categoryFilter: "all" | ReportCategory;
  statusFilter: "all" | ReportStatus;
  searchValue: string;
  onTypeChange: (value: "all" | ReportType) => void;
  onCategoryChange: (value: "all" | ReportCategory) => void;
  onStatusChange: (value: "all" | ReportStatus) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

export function ReportTablePanel({
  data,
  typeFilter,
  categoryFilter,
  statusFilter,
  searchValue,
  onTypeChange,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onSearchSubmit,
}: ReportTablePanelProps) {
  const { token } = useToken();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "generated":
        return "success";
      case "processing":
        return "processing";
      case "scheduled":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case "generated":
        return "Đã tạo";
      case "processing":
        return "Đang xử lý";
      case "scheduled":
        return "Đã lên lịch";
      default:
        return status;
    }
  };

  const getCategoryText = (category: ReportCategory) => {
    switch (category) {
      case "books":
        return "Sách";
      case "users":
        return "Người dùng";
      case "financial":
        return "Tài chính";
      case "activity":
        return "Hoạt động";
      case "overdue":
        return "Quá hạn";
      default:
        return category;
    }
  };

  const getTypeText = (type: ReportType) => {
    switch (type) {
      case "daily":
        return "Hàng ngày";
      case "weekly":
        return "Hàng tuần";
      case "monthly":
        return "Hàng tháng";
      case "yearly":
        return "Hàng năm";
      default:
        return type;
    }
  };

  const handleDownload = (record: ReportItem) => {
    console.log("Download report:", record.id);
    // Logic tải báo cáo
  };

  const handleView = (record: ReportItem) => {
    console.log("View report:", record.id);
    // Logic xem báo cáo
  };

  const columns = [
    {
      title: "Tên báo cáo",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text: string, record: ReportItem) => (
        <Space direction="vertical" size={2}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "category",
      width: "12%",
      render: (category: ReportCategory) => (
        <Tag color="blue">{getCategoryText(category)}</Tag>
      ),
    },
    {
      title: "Chu kỳ",
      dataIndex: "type",
      key: "type",
      width: "12%",
      render: (type: ReportType) => (
        <Text>{getTypeText(type)}</Text>
      ),
    },
    {
      title: "Kỳ báo cáo",
      dataIndex: "period",
      key: "period",
      width: "12%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status: ReportStatus) => (
        <Badge status={getStatusColor(status) as any} text={getStatusText(status)} />
      ),
    },
    {
      title: "Lượt tải",
      dataIndex: "downloads",
      key: "downloads",
      width: "10%",
      align: "center" as const,
      render: (downloads: number) => <Text strong>{downloads}</Text>,
    },
    {
      title: "Dung lượng",
      dataIndex: "fileSize",
      key: "fileSize",
      width: "10%",
    },
    {
      title: "Thao tác",
      key: "action",
      width: "12%",
      render: (_: any, record: ReportItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
            disabled={record.status !== "generated"}
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownload(record)}
            disabled={record.status !== "generated"}
          />
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
        boxShadow: token.boxShadowSecondary,
      }}
      styles={{ body: { padding: 24 } }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* Filters */}
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm kiếm báo cáo..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onSearch={onSearchSubmit}
              allowClear
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Col>
          <Col xs={8} sm={4} md={4}>
            <Select
              value={categoryFilter}
              onChange={onCategoryChange}
              style={{ width: "100%" }}
              size="large"
              options={[
                { label: "Tất cả loại", value: "all" },
                { label: "Sách", value: "books" },
                { label: "Người dùng", value: "users" },
                { label: "Tài chính", value: "financial" },
                { label: "Hoạt động", value: "activity" },
                { label: "Quá hạn", value: "overdue" },
              ]}
            />
          </Col>
          <Col xs={8} sm={4} md={4}>
            <Select
              value={typeFilter}
              onChange={onTypeChange}
              style={{ width: "100%" }}
              size="large"
              options={[
                { label: "Tất cả chu kỳ", value: "all" },
                { label: "Hàng ngày", value: "daily" },
                { label: "Hàng tuần", value: "weekly" },
                { label: "Hàng tháng", value: "monthly" },
                { label: "Hàng năm", value: "yearly" },
              ]}
            />
          </Col>
          <Col xs={8} sm={4} md={4}>
            <Select
              value={statusFilter}
              onChange={onStatusChange}
              style={{ width: "100%" }}
              size="large"
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Đã tạo", value: "generated" },
                { label: "Đang xử lý", value: "processing" },
                { label: "Đã lên lịch", value: "scheduled" },
              ]}
            />
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            total: data.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} báo cáo`,
          }}
          scroll={{ x: 1000 }}
        />
      </Space>
    </Card>
  );
}


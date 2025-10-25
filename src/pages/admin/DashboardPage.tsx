import { Card, Space, Typography, Row, Col, Grid, Select, theme } from "antd";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import StatCard from "../../components/admin/dashboard/StatCard";
import UsersTable from "../../components/admin/dashboard/UsersTable";
import BooksTable from "../../components/admin/dashboard/BooksTable";
import TopChoicesGrid from "../../components/admin/dashboard/TopChoicesGrid";
import BooksIssuedTable from "../../components/admin/dashboard/BooksIssuedTable";
import VisitorsBorrowersChart from "../../components/admin/dashboard/VisitorsBorrowersChart";
import { OverdueBookTable } from "../../components/admin/overdue";
import { mockOverdueBooks } from "../../data/mockOverdueBooks";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
};

export default function DashboardPage() {
  const screens = useBreakpoint();
  const { token } = useToken();
  const [timeRange, setTimeRange] = useState("this-week");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const currentDateString = useMemo(
    () => new Date().toLocaleDateString("vi-VN", dateOptions),
    []
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ display: "block", width: "100%" }}>
        
        {/* --- Welcome Card --- */}
          <Card
            variant="borderless"
            hoverable={false}
            style={{
              borderRadius: 16,
              background: "transparent",
              boxShadow: "none",
              transition: "none",
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Row justify="space-between" align="middle" wrap={false}>
              {/* Left side: greeting */}
              <Col flex="auto">
                <Space direction="vertical" size={0}>
                  <Title
                    level={screens.xs ? 4 : 3}
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: screens.xs ? 20 : 36,
                    }}
                  >
                    Xin chào,{" "}
                    <span style={{ color: token.colorPrimary }}>Thanh Toàn!</span>
                  </Title>
                  <Text style={{ fontSize: screens.xs ? 14 : 16 }}>
                    {currentDateString}
                  </Text>
                </Space>
              </Col>

              {/* Right side: dropdown */}
              <Col>
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  options={[
                    { label: "Hôm nay", value: "today" },
                    { label: "Tuần này", value: "this-week" },
                    { label: "Tháng này", value: "this-month" },
                  ]}
                  style={{
                    minWidth: 140,
                    borderRadius: 12,
                  }}
                  size={screens.xs ? "middle" : "large"}
                />
              </Col>
            </Row>
          </Card>

          {/* --- Stats Section --- */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={6}>
              <StatCard title="Tổng lượt truy cập" value="1223" icon={<TeamOutlined />} />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <StatCard title="Sách đã mượn" value="740" icon={<BookOutlined />} />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <StatCard title="Sách quá hạn" value="22" icon={<BookOutlined />} />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <StatCard title="Thành viên mới" value="60" icon={<UserOutlined />} />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
            <Col xs={24} xl={12}>
              <UsersTable />
            </Col>
            <Col xs={24} xl={12}>
              <BooksTable />
            </Col>
          </Row>

          <TopChoicesGrid />

          {/* --- Overdue Books Section --- */}
          <Card
            variant="borderless"
            style={{ borderRadius: 16, marginTop: 16 }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>
                Sách quá hạn
              </Title>
            </div>
            <OverdueBookTable
              dataSource={mockOverdueBooks}
              currentPage={currentPage}
              pageSize={pageSize}
              total={mockOverdueBooks.length}
              onPageChange={handlePageChange}
            />
          </Card>

          {/* --- Books Issued & Statistics Section --- */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} xl={14}>
              <BooksIssuedTable />
            </Col>
            <Col xs={24} xl={10}>
              <VisitorsBorrowersChart />
            </Col>
          </Row>
        </Space>
      </div>
  );
}

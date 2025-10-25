import { useMemo, useState, useEffect } from "react";
import { Col, Grid, Row, Space, Spin } from "antd";
import {
  HeaderCard,
  StatsOverview,
  ReportTablePanel,
  RevenueCard,
  ActivityCard,
  CategoryPerformanceCard,
  TopMetricsCard,
} from "../../components/admin/reportManagement";
import type { ReportType, ReportStatus, ReportCategory } from "../../data";
import {
  adminReports,
  overviewMetrics,
  monthlyRevenue,
  weeklyActivity,
  categoryPerformance,
  topMetrics,
} from "../../data";

const { useBreakpoint } = Grid;

export default function ReportPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ReportCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredReports = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    return adminReports.filter((report) => {
      const matchSearch =
        !normalized ||
        report.name.toLowerCase().includes(normalized) ||
        report.id.toLowerCase().includes(normalized) ||
        report.period.toLowerCase().includes(normalized);

      const matchType = typeFilter === "all" ? true : report.type === typeFilter;
      const matchCategory = categoryFilter === "all" ? true : report.category === categoryFilter;
      const matchStatus = statusFilter === "all" ? true : report.status === statusFilter;

      return matchSearch && matchType && matchCategory && matchStatus;
    });
  }, [typeFilter, categoryFilter, statusFilter, searchValue]);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        width: "100%" 
      }}>
        <Spin size="large" tip="">
          <div />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Header */}
          <HeaderCard isMobile={isMobile} />

          {/* Stats Overview */}
          <StatsOverview totals={overviewMetrics} />

          {/* Main Content: Reports Table and Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <ReportTablePanel
                data={filteredReports}
                typeFilter={typeFilter}
                categoryFilter={categoryFilter}
                statusFilter={statusFilter}
                searchValue={searchValue}
                onTypeChange={(value) => setTypeFilter(value)}
                onCategoryChange={(value) => setCategoryFilter(value)}
                onStatusChange={(value) => setStatusFilter(value)}
                onSearchChange={(value) => setSearchValue(value)}
                onSearchSubmit={(value) => setSearchValue(value)}
              />
            </Col>
          </Row>

          {/* Revenue and Activity Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <RevenueCard data={monthlyRevenue} />
            </Col>
            <Col xs={24} lg={10}>
              <ActivityCard data={weeklyActivity} />
            </Col>
          </Row>

          {/* Category Performance and Top Metrics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <CategoryPerformanceCard data={categoryPerformance} />
            </Col>
            <Col xs={24} lg={10}>
              <TopMetricsCard data={topMetrics} />
            </Col>
          </Row>
        </Space>
    </div>
  );
}


import { useMemo, useState, useEffect } from "react";
import { Col, Grid, Row, Space } from "antd";
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

  // Individual loading states for each component with 10s timeout for testing
  const [tableLoading, setTableLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const tableTimer = setTimeout(() => setTableLoading(false), 10000);
    const revenueTimer = setTimeout(() => setRevenueLoading(false), 10000);
    const activityTimer = setTimeout(() => setActivityLoading(false), 10000);
    const categoryTimer = setTimeout(() => setCategoryLoading(false), 10000);
    const metricsTimer = setTimeout(() => setMetricsLoading(false), 10000);

    return () => {
      clearTimeout(tableTimer);
      clearTimeout(revenueTimer);
      clearTimeout(activityTimer);
      clearTimeout(categoryTimer);
      clearTimeout(metricsTimer);
    };
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
                loading={tableLoading}
              />
            </Col>
          </Row>

          {/* Revenue and Activity Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <RevenueCard data={monthlyRevenue} loading={revenueLoading} />
            </Col>
            <Col xs={24} lg={10}>
              <ActivityCard data={weeklyActivity} loading={activityLoading} />
            </Col>
          </Row>

          {/* Category Performance and Top Metrics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <CategoryPerformanceCard data={categoryPerformance} loading={categoryLoading} />
            </Col>
            <Col xs={24} lg={10}>
              <TopMetricsCard data={topMetrics} loading={metricsLoading} />
            </Col>
          </Row>
        </Space>
    </div>
  );
}


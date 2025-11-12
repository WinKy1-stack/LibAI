import { useMemo, useState } from "react";
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
  useReports,
  useReportMetrics,
  useReportRevenue,
  useReportActivity,
  useReportCategoryPerformance,
  useReportTopMetrics,
} from "../../hooks/useAdminQueries";

const { useBreakpoint } = Grid;

export default function ReportPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ReportCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [searchValue, setSearchValue] = useState("");

  // Use react-query hooks
  const { data: adminReports = [], isLoading: tableLoading } = useReports();
  const { data: overviewMetrics } = useReportMetrics();
  const { data: monthlyRevenue = [], isLoading: revenueLoading } = useReportRevenue();
  const { data: weeklyActivity = [], isLoading: activityLoading } = useReportActivity();
  const { data: categoryPerformance = [], isLoading: categoryLoading } = useReportCategoryPerformance();
  const { data: topMetrics, isLoading: metricsLoading } = useReportTopMetrics();

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
  }, [typeFilter, categoryFilter, statusFilter, searchValue, adminReports]);

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Header */}
          <HeaderCard isMobile={isMobile} />

          {/* Stats Overview */}
          {overviewMetrics && <StatsOverview totals={overviewMetrics} />}

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
              {topMetrics && <TopMetricsCard data={topMetrics} loading={metricsLoading} />}
            </Col>
          </Row>
        </Space>
    </div>
  );
}


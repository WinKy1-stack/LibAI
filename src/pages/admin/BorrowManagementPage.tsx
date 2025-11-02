import { useState, useEffect, useMemo } from "react";
import { Row, Col, Space } from "antd";
import { HeaderCard } from "../../components/admin/borrowManagement/HeaderCard";
import { StatsOverview } from "../../components/admin/borrowManagement/StatsOverview";
import { BorrowTrendCard } from "../../components/admin/borrowManagement/BorrowTrendCard";
import { StatusDistributionCard } from "../../components/admin/borrowManagement/StatusDistributionCard";
import { RecentActivityCard } from "../../components/admin/borrowManagement/RecentActivityCard";
import { BorrowsTablePanel } from "../../components/admin/borrowManagement/BorrowsTablePanel";
import {
  borrowRecords,
  borrowTrendData,
  statusDistribution,
  latestBorrowActivities,
} from "../../data/mockBorrows";

export const BorrowManagementPage = () => {
  const [trendLoading, setTrendLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  // Simulate loading data with 10s timeout for testing
  useEffect(() => {
    const trendTimer = setTimeout(() => setTrendLoading(false), 10000);
    const statusTimer = setTimeout(() => setStatusLoading(false), 10000);
    const activityTimer = setTimeout(() => setActivityLoading(false), 10000);
    const tableTimer = setTimeout(() => setTableLoading(false), 10000);

    return () => {
      clearTimeout(trendTimer);
      clearTimeout(statusTimer);
      clearTimeout(activityTimer);
      clearTimeout(tableTimer);
    };
  }, []);

  // Memoize data to avoid unnecessary re-renders
  const borrows = useMemo(() => borrowRecords, []);
  const trendData = useMemo(() => borrowTrendData, []);
  const statusData = useMemo(() => statusDistribution, []);
  const activities = useMemo(() => latestBorrowActivities, []);

  return (
    <div
      style={{
        maxWidth: 1400,
        marginInline: "auto",
        width: "100%",
      }}
    >
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* Header */}
        <HeaderCard />

        {/* Stats Overview */}
        <StatsOverview borrows={borrows} />

        {/* Charts Row */}
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <BorrowTrendCard data={trendData} loading={trendLoading} />
          </Col>
          <Col xs={24} xl={10}>
            <StatusDistributionCard data={statusData} loading={statusLoading} />
          </Col>
        </Row>

        {/* Recent Activity */}
        <RecentActivityCard activities={activities} loading={activityLoading} />

        {/* Main Table */}
        <BorrowsTablePanel borrows={borrows} loading={tableLoading} />
      </Space>
    </div>
  );
};

import { useState, useEffect, useMemo } from "react";
import { Row, Col, Space, Spin } from "antd";
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
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Memoize data to avoid unnecessary re-renders
  const borrows = useMemo(() => borrowRecords, []);
  const trendData = useMemo(() => borrowTrendData, []);
  const statusData = useMemo(() => statusDistribution, []);
  const activities = useMemo(() => latestBorrowActivities, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu...">
        </Spin>
      </div>
    );
  }

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
            <BorrowTrendCard data={trendData} loading={false} />
          </Col>
          <Col xs={24} xl={10}>
            <StatusDistributionCard data={statusData} loading={false} />
          </Col>
        </Row>

        {/* Recent Activity */}
        <RecentActivityCard activities={activities} loading={false} />

        {/* Main Table */}
        <BorrowsTablePanel borrows={borrows} loading={false} />
      </Space>
    </div>
  );
};

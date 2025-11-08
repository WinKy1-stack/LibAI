import { Row, Col, Space } from "antd";
import { HeaderCard } from "../../components/admin/borrowManagement/HeaderCard";
import { StatsOverview } from "../../components/admin/borrowManagement/StatsOverview";
import { BorrowTrendCard } from "../../components/admin/borrowManagement/BorrowTrendCard";
import { StatusDistributionCard } from "../../components/admin/borrowManagement/StatusDistributionCard";
import { RecentActivityCard } from "../../components/admin/borrowManagement/RecentActivityCard";
import { BorrowsTablePanel } from "../../components/admin/borrowManagement/BorrowsTablePanel";
import {
  useBorrows,
  useBorrowTrendData,
  useBorrowStatus,
  useBorrowActivities,
} from "../../hooks/useAdminQueries";

export const BorrowManagementPage = () => {
  // Use react-query hooks
  const { data: borrows = [], isLoading: tableLoading } = useBorrows();
  const { data: trendData = [], isLoading: trendLoading } = useBorrowTrendData();
  const { data: statusData = [], isLoading: statusLoading } = useBorrowStatus();
  const { data: activities = [], isLoading: activityLoading } = useBorrowActivities();

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

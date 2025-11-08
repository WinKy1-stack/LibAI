import { useMemo, useState } from "react";
import { Col, Grid, Row, Space } from "antd";
import { HeaderCard } from "../../components/admin/userManagement/HeaderCard";
import { StatsOverview, type UserTotals } from "../../components/admin/userManagement/StatsOverview";
import { UsersTablePanel } from "../../components/admin/userManagement/UsersTablePanel";
import { RetentionCard } from "../../components/admin/userManagement/RetentionCard";
import { RoleDistributionCard } from "../../components/admin/userManagement/RoleDistributionCard";
import { ActivityCard } from "../../components/admin/userManagement/ActivityCard";
import {
  useUsers,
  useUserActivities,
  useUserRetention,
  useUserRoleDistribution,
} from "../../hooks/useAdminQueries";
import type { UserRole, UserStatus } from "../../data";

const { useBreakpoint } = Grid;

export default function UserManagementPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [searchValue, setSearchValue] = useState("");

  // Use react-query hooks
  const { data: adminUsers = [], isLoading: usersLoading } = useUsers();
  const { data: latestUserActivities = [] } = useUserActivities();
  const { data: userRetentionTrend = [] } = useUserRetention();
  const { data: userRoleDistribution = [] } = useUserRoleDistribution();

  const totals = useMemo(() => {
    if (adminUsers.length === 0) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        flagged: 0,
        completedAverage: 0,
      };
    }
    const active = adminUsers.filter((user) => user.status === "active").length;
    const pending = adminUsers.filter((user) => user.status === "pending").length;
    const flagged = adminUsers.filter((user) => user.status === "banned" || user.overdueBooks >= 3).length;
    const completedAverage =
      Math.round(adminUsers.reduce((accumulator, user) => accumulator + user.completionRate, 0) / adminUsers.length);

    return {
      total: adminUsers.length,
      active,
      pending,
      flagged,
      completedAverage,
    };
  }, [adminUsers]);

  const overviewTotals: UserTotals = {
    total: totals.total,
    active: totals.active,
    pending: totals.pending,
    flagged: totals.flagged,
  };

  const totalRoleCount = useMemo(
    () => userRoleDistribution.reduce((accumulator, item) => accumulator + item.count, 0),
    [userRoleDistribution],
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
  }, [statusFilter, roleFilter, searchValue, adminUsers]);

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
  }, [userRetentionTrend]);

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <HeaderCard isMobile={isMobile} />

          <StatsOverview totals={overviewTotals} />

          {/* Users Table - Full Width */}
          <UsersTablePanel
            data={filteredUsers}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            searchValue={searchValue}
            onStatusChange={(value) => setStatusFilter(value)}
            onRoleChange={(value) => setRoleFilter(value)}
            onSearchChange={(value) => setSearchValue(value)}
            onSearchSubmit={(value) => setSearchValue(value)}
            loading={usersLoading}
          />

          {/* Metrics Cards Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <RetentionCard trend={userRetentionTrend} change={{ active: retentionChange.active, churn: retentionChange.churn }} />
            </Col>
            <Col xs={24} lg={12}>
              <RoleDistributionCard
                distribution={userRoleDistribution}
                totalCount={totalRoleCount}
                averageCompletion={totals.completedAverage}
              />
            </Col>
          </Row>

          {/* Activity Card - Full Width */}
          <ActivityCard activities={latestUserActivities} />
        </Space>
    </div>
  );
}

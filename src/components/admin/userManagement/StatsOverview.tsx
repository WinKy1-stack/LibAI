import { Col, Row } from "antd";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  StopFilled,
  TeamOutlined,
} from "@ant-design/icons";
import StatCard from "../dashboard/StatCard";

export interface UserTotals {
  total: number;
  active: number;
  pending: number;
  flagged: number;
}

interface StatsOverviewProps {
  totals: UserTotals;
}

export function StatsOverview({ totals }: StatsOverviewProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <StatCard title="Tổng người dùng" value={totals.total} icon={<TeamOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Đang hoạt động" value={totals.active} icon={<CheckCircleFilled />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Chờ phê duyệt" value={totals.pending} icon={<ClockCircleFilled />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Cần xem xét" value={totals.flagged} icon={<StopFilled />} />
      </Col>
    </Row>
  );
}

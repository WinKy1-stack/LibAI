import { Col, Row } from "antd";
import { BookOutlined, DatabaseOutlined, InboxOutlined, ReadOutlined } from "@ant-design/icons";
import StatCard from "../dashboard/StatCard";

export interface BookTotals {
  titles: number;
  totalBooks: number;
  totalLoaned: number;
  totalOverdue: number;
}

interface StatsOverviewProps {
  totals: BookTotals;
}

export function StatsOverview({ totals }: StatsOverviewProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <StatCard title="Đầu sách" value={totals.titles} icon={<BookOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Tổng bản in" value={totals.totalBooks} icon={<DatabaseOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Đang mượn" value={totals.totalLoaned} icon={<ReadOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Quá hạn" value={totals.totalOverdue} icon={<InboxOutlined />} />
      </Col>
    </Row>
  );
}

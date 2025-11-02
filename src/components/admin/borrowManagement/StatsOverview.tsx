import { Col, Row } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { BorrowRecord } from "../../../data/mockBorrows";
import StatCard from "../dashboard/StatCard";

interface StatsOverviewProps {
  borrows: BorrowRecord[];
}

export const StatsOverview = ({ borrows }: StatsOverviewProps) => {
  const totalBorrows = borrows.length;
  const activeBorrows = borrows.filter((b) => b.status === "borrowed").length;
  const overdueBorrows = borrows.filter((b) => b.status === "overdue").length;
  const lostBooks = borrows.filter((b) => b.status === "lost").length;

  const stats = [
    {
      title: "Tổng lượt mượn",
      value: totalBorrows,
      icon: <BookOutlined />,
    },
    {
      title: "Đang mượn",
      value: activeBorrows,
      icon: <CheckCircleOutlined />,
    },
    {
      title: "Quá hạn",
      value: overdueBorrows,
      icon: <ClockCircleOutlined />,
    },
    {
      title: "Mất sách",
      value: lostBooks,
      icon: <ExclamationCircleOutlined />,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={12} md={6} key={index}>
          <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
        </Col>
      ))}
    </Row>
  );
};

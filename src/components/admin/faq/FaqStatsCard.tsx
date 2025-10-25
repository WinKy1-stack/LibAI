import { Col, Row } from "antd";
import { 
  QuestionCircleOutlined, 
  CheckCircleOutlined, 
  EditOutlined, 
  EyeOutlined 
} from "@ant-design/icons";
import StatCard from "../dashboard/StatCard";

export interface FaqTotals {
  totalQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  totalViews: number;
}

interface FaqStatsOverviewProps {
  totals: FaqTotals;
}

export function FaqStatsOverview({ totals }: FaqStatsOverviewProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <StatCard title="Tổng câu hỏi" value={totals.totalQuestions} icon={<QuestionCircleOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Đã xuất bản" value={totals.publishedQuestions} icon={<CheckCircleOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Đang soạn" value={totals.draftQuestions} icon={<EditOutlined />} />
      </Col>
      <Col xs={12} md={6}>
        <StatCard title="Lượt xem" value={totals.totalViews} icon={<EyeOutlined />} />
      </Col>
    </Row>
  );
}


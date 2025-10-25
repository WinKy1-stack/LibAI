import { Card, Col, Row, Space, Statistic, theme, Typography } from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  RiseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

export interface ReportTotals {
  totalReports: number;
  generatedThisMonth: number;
  totalDownloads: number;
  scheduledReports: number;
  avgGenerationTime: string;
  storageUsed: string;
}

interface StatsOverviewProps {
  totals: ReportTotals;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const { token } = useToken();

  return (
    <Card
      variant="borderless"
      hoverable
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowSecondary,
        height: "100%",
      }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              background: color,
              borderRadius: 12,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 20,
            }}
          >
            {icon}
          </div>
        </div>
        <div>
          <Statistic
            value={value}
            valueStyle={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
          />
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            {title}
          </Text>
        </div>
      </Space>
    </Card>
  );
}

export function StatsOverview({ totals }: StatsOverviewProps) {
  const { token } = useToken();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Tổng báo cáo"
          value={totals.totalReports}
          icon={<FileTextOutlined />}
          color={token.colorPrimary}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Tạo tháng này"
          value={totals.generatedThisMonth}
          icon={<RiseOutlined />}
          color="#52c41a"
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Lượt tải"
          value={totals.totalDownloads}
          icon={<DownloadOutlined />}
          color="#1890ff"
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Đã lên lịch"
          value={totals.scheduledReports}
          icon={<CalendarOutlined />}
          color="#faad14"
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Thời gian TB"
          value={totals.avgGenerationTime}
          icon={<ClockCircleOutlined />}
          color="#722ed1"
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Dung lượng"
          value={totals.storageUsed}
          icon={<DatabaseOutlined />}
          color="#eb2f96"
        />
      </Col>
    </Row>
  );
}


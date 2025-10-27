import { Card, Col, Row, Space, Statistic, theme, Typography } from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  RiseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getChartColors } from "./constants";

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
              color: token.colorWhite || "#fff",
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
  const chartColors = getChartColors(token);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Tổng báo cáo"
          value={totals.totalReports}
          icon={<FileTextOutlined />}
          color={chartColors.stats.primary}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Tạo tháng này"
          value={totals.generatedThisMonth}
          icon={<RiseOutlined />}
          color={chartColors.stats.success}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Lượt tải"
          value={totals.totalDownloads}
          icon={<DownloadOutlined />}
          color={chartColors.stats.info}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Đã lên lịch"
          value={totals.scheduledReports}
          icon={<CalendarOutlined />}
          color={chartColors.stats.warning}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Thời gian TB"
          value={totals.avgGenerationTime}
          icon={<ClockCircleOutlined />}
          color={chartColors.stats.purple}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={4}>
        <StatCard
          title="Dung lượng"
          value={totals.storageUsed}
          icon={<DatabaseOutlined />}
          color={chartColors.stats.pink}
        />
      </Col>
    </Row>
  );
}


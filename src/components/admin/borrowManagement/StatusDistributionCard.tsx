import { Card, Typography, Progress, Space, theme, Skeleton } from "antd";

const { Title, Text } = Typography;
const { useToken } = theme;

interface StatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface StatusDistributionCardProps {
  data: StatusData[];
  loading?: boolean;
}

export const StatusDistributionCard = ({
  data,
  loading = false,
}: StatusDistributionCardProps) => {
  const { token } = useToken();
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Title level={5} style={{ marginBottom: 24 }}>
        Phân bố trạng thái
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {data.map((item, index) => (
            <div key={index}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text strong>{item.status}</Text>
                <Text type="secondary">
                  {item.count} ({item.percentage}%)
                </Text>
              </div>
              <Progress
                percent={item.percentage}
                strokeColor={item.color}
                showInfo={false}
              />
            </div>
          ))}
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              backgroundColor: token.colorFillTertiary,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong>Tổng cộng</Text>
              <Title level={4} style={{ margin: 0 }}>
                {totalCount}
              </Title>
            </div>
          </div>
        </Space>
      )}
    </Card>
  );
};

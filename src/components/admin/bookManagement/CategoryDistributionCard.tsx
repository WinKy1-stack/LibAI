import { AppstoreOutlined } from "@ant-design/icons";
import { Card, Progress, Space, Typography, theme } from "antd";

const { Text } = Typography;

interface CategoryDistributionCardProps {
  distribution: Array<{ category: string; count: number }>;
  totalBooks: number;
  totalAvailable: number;
}

export function CategoryDistributionCard({
  distribution,
  totalBooks,
  totalAvailable,
}: CategoryDistributionCardProps) {
  const { token } = theme.useToken();

  const availablePercent = totalBooks === 0 ? 0 : Math.round((totalAvailable / totalBooks) * 100);

  return (
    <Card title="Kho sách theo chuyên mục" variant="borderless" style={{ borderRadius: 16 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {distribution.map((item) => {
          const percent = totalBooks === 0 ? 0 : Math.round((item.count / totalBooks) * 100);
          return (
            <div
              key={item.category}
              style={{
                padding: 12,
                borderRadius: 12,
                background: token.colorFillTertiary,
              }}
            >
              <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                <Space size={8}>
                  <AppstoreOutlined />
                  <Text strong>{item.category}</Text>
                </Space>
                <Text type="secondary">{item.count} bản</Text>
              </Space>
              <Progress
                percent={percent}
                strokeColor={token.colorPrimary}
                size="small"
                style={{ marginBottom: 0, marginTop: 8 }}
              />
            </div>
          );
        })}
        <Card
          style={{
            borderRadius: 14,
            background: token.colorFillSecondary,
          }}
          bordered={false}
        >
          <Space direction="vertical" size={6}>
            <Text strong style={{ fontSize: 16 }}>
              Sẵn có hiện tại
            </Text>
            <Text type="secondary">Tỷ lệ sách đang có sẵn trong kho so với tổng bản in.</Text>
            <Progress percent={availablePercent} strokeColor={token.colorSuccess} status="active" size="small" />
          </Space>
        </Card>
      </Space>
    </Card>
  );
}

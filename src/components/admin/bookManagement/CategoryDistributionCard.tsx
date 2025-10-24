import { AppstoreOutlined } from "@ant-design/icons";
import { Card, Divider, Empty, Progress, Space, Typography, theme } from "antd";

const { Text, Title } = Typography;

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

  const availablePercent = totalBooks > 0 ? Math.round((totalAvailable / totalBooks) * 100) : 0;
  const itemsWithPercentage = distribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      percent: totalBooks > 0 ? Math.round((item.count / totalBooks) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card
      title="Phân bổ sách theo chuyên mục"
      extra={
        <Space size={8}>
          <Text type="secondary">Tổng số</Text>
          <Text strong>{totalBooks}</Text>
        </Space>
      }
      style={{ borderRadius: 16 }}
      headStyle={{ borderBottom: "none", padding: "16px 24px 0" }}
      bodyStyle={{ padding: "8px 24px 24px" }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {itemsWithPercentage.length === 0 ? (
          <Empty description="Chưa có dữ liệu phân bổ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          itemsWithPercentage.map((item, index) => (
            <div
              key={item.category}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: index === 0 ? token.colorFillSecondary : token.colorFillTertiary,
                border: `1px solid ${token.colorSplit}`,
              }}
            >
              <Space
                align="center"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Space size={10}>
                  <AppstoreOutlined style={{ color: token.colorPrimary }} />
                  <Title level={5} style={{ margin: 0 }}>
                    {item.category}
                  </Title>
                </Space>
                <Space size={6}>
                  <Text strong>{item.count}</Text>
                  <Text type="secondary">ấn bản</Text>
                </Space>
              </Space>
              <Progress
                percent={item.percent}
                strokeColor={index === 0 ? token.colorPrimary : token.colorPrimaryBorder}
                trailColor={token.colorBgContainerDisabled}
                size="small"
                style={{ marginBottom: 0 }}
              />
            </div>
          ))
        )}

        <Divider style={{ margin: "8px 0" }} />

        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            background: token.colorFillSecondary,
            boxShadow: "none",
          }}
        >
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Text strong style={{ fontSize: 16 }}>
              Tỷ lệ sẵn có hiện tại
            </Text>
            <Text type="secondary">
              Tỷ trọng sách đang sẵn sàng trong kho so với tổng số đầu sách xuất bản.
            </Text>
            <Progress percent={availablePercent} strokeColor={token.colorSuccess} status="active" size="small" />
          </Space>
        </Card>
      </Space>
    </Card>
  );
}

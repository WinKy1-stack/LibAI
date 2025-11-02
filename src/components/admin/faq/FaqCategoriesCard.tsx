import { Card, Divider, Empty, Progress, Space, Typography, theme, Skeleton } from "antd";
import { categoryIcons, getFaqColors } from "./constants";

const { Text, Title } = Typography;

interface FaqCategoriesCardProps {
  distribution: Array<{ category: string; categoryName: string; icon: string; count: number }>;
  totalFaqs: number;
  publishedFaqs: number;
  loading?: boolean;
}

export function FaqCategoriesCard({
  distribution,
  totalFaqs,
  publishedFaqs,
  loading = false,
}: FaqCategoriesCardProps) {
  const { token } = theme.useToken();
  const faqColors = getFaqColors(token);

  const publishedPercent = totalFaqs > 0 ? Math.round((publishedFaqs / totalFaqs) * 100) : 0;
  const itemsWithPercentage = distribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      percent: totalFaqs > 0 ? Math.round((item.count / totalFaqs) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card
      title="Phân bổ theo danh mục"
      extra={
        <Space size={8}>
          <Text type="secondary">Tổng số</Text>
          <Text strong>{totalFaqs}</Text>
        </Space>
      }
      style={{ borderRadius: 16 }}
      styles={{ 
        header: { borderBottom: "none", padding: "16px 24px 0" },
        body: { padding: "8px 24px 24px" }
      }}
    >
      {loading ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton.Button active style={{ width: "100%", height: 100 }} />
        </Space>
      ) : (
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
                  <span style={{ fontSize: 18, color: faqColors.categories[item.category] || token.colorPrimary }}>
                    {categoryIcons[item.category]}
                  </span>
                  <Title level={5} style={{ margin: 0 }}>
                    {item.categoryName}
                  </Title>
                </Space>
                <Space size={6}>
                  <Text strong>{item.count}</Text>
                  <Text type="secondary">câu hỏi</Text>
                </Space>
              </Space>
              <Progress
                percent={item.percent}
                strokeColor={index === 0 ? faqColors.categories[item.category] || token.colorPrimary : token.colorPrimaryBorder}
                trailColor={token.colorBgContainerDisabled}
                size="small"
                style={{ marginBottom: 0 }}
              />
            </div>
          ))
        )}

        <Divider style={{ margin: "8px 0" }} />

        <Card
          variant="borderless"
          style={{
            borderRadius: 12,
            background: token.colorFillSecondary,
            boxShadow: "none",
          }}
        >
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Text strong style={{ fontSize: 16 }}>
              Tỷ lệ xuất bản
            </Text>
            <Text type="secondary">
              Số lượng câu hỏi đã được xuất bản so với tổng số câu hỏi.
            </Text>
            <Progress percent={publishedPercent} strokeColor={faqColors.status.published} status="active" size="small" />
          </Space>
        </Card>
      </Space>
      )}
    </Card>
  );
}


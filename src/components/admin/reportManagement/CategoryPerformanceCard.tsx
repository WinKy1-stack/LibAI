import { Card, Space, Typography, Table, Progress, theme, Skeleton } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { getChartColors } from "./constants";

const { Title, Text } = Typography;
const { useToken } = theme;

interface CategoryPerformanceProps {
  data: Array<{ category: string; borrowed: number; revenue: number }>;
  loading?: boolean;
}

export function CategoryPerformanceCard({ data, loading = false }: CategoryPerformanceProps) {
  const { token } = useToken();
  const chartColors = getChartColors(token);

  const maxBorrowed = Math.max(...data.map((item) => item.borrowed));
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  const columns = [
    {
      title: "Thể loại",
      dataIndex: "category",
      key: "category",
      render: (text: string, _: { category: string; borrowed: number; revenue: number }, index: number) => (
        <Space>
          {index < 3 && (
            <TrophyOutlined 
              style={{ 
                color: [
                  chartColors.trophy.gold, 
                  chartColors.trophy.silver, 
                  chartColors.trophy.bronze
                ][index] 
              }} 
            />
          )}
          <Text strong={index < 3}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Lượt mượn",
      dataIndex: "borrowed",
      key: "borrowed",
      align: "center" as const,
      render: (value: number) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Text strong>{value}</Text>
          <Progress
            percent={(value / maxBorrowed) * 100}
            showInfo={false}
            strokeColor={token.colorPrimary}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (value: number) => (
        <Text strong style={{ color: token.colorSuccess }}>
          {value.toLocaleString()} VNĐ
        </Text>
      ),
    },
  ];

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowSecondary,
      }}
      styles={{ body: { padding: 24 } }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Hiệu suất theo thể loại
            </Title>
            <Text type="secondary">Doanh thu và lượt mượn theo danh mục</Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Title level={4} style={{ margin: 0, color: token.colorSuccess }}>
              {totalRevenue.toLocaleString()} VNĐ
            </Title>
            <Text type="secondary">Tổng doanh thu</Text>
          </div>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
          columns={columns}
          dataSource={data}
          rowKey="category"
          pagination={false}
          size="small"
          scroll={{ x: 400 }}
        />
        )}
      </Space>
    </Card>
  );
}


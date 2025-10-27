import { Card, Space, Typography, List, Tag, theme, Tabs, Badge, Progress } from "antd";
import { BookOutlined, UserOutlined, PieChartOutlined, CrownOutlined } from "@ant-design/icons";
import type { TopMetrics } from "../../../data";
import { getChartColors } from "./constants";

const { Title, Text } = Typography;
const { useToken } = theme;

interface TopMetricsCardProps {
  data: TopMetrics;
}

export function TopMetricsCard({ data }: TopMetricsCardProps) {
  const { token } = useToken();
  const chartColors = getChartColors(token);

  const items = [
    {
      key: "books",
      label: (
        <Space>
          <BookOutlined />
          <span>Top sách</span>
        </Space>
      ),
      children: (
        <List
          dataSource={data.topBooks}
          renderItem={(item, index) => (
            <List.Item>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Space>
                  <Badge
                    count={index + 1}
                    style={{
                      backgroundColor: index < 3 ? chartColors.stats.primary : token.colorBgTextHover,
                    }}
                  />
                  <Space direction="vertical" size={0}>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.author}
                    </Text>
                  </Space>
                </Space>
                <Tag color="blue">{item.borrows} lượt</Tag>
              </Space>
            </List.Item>
          )}
          size="small"
        />
      ),
    },
    {
      key: "users",
      label: (
        <Space>
          <UserOutlined />
          <span>Top người dùng</span>
        </Space>
      ),
      children: (
        <List
          dataSource={data.topUsers}
          renderItem={(item, index) => (
            <List.Item>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Space>
                  <Badge
                    count={index + 1}
                    style={{
                      backgroundColor: index < 3 ? chartColors.stats.primary : token.colorBgTextHover,
                    }}
                  />
                  <Space direction="vertical" size={0}>
                    <Text strong>{item.name}</Text>
                    <Tag
                      color={item.membership === "Premium" ? "gold" : "default"}
                      style={{ fontSize: 11 }}
                    >
                      {item.membership === "Premium" && <CrownOutlined />} {item.membership}
                    </Tag>
                  </Space>
                </Space>
                <Tag color="green">{item.borrows} lượt</Tag>
              </Space>
            </List.Item>
          )}
          size="small"
        />
      ),
    },
    {
      key: "categories",
      label: (
        <Space>
          <PieChartOutlined />
          <span>Thể loại phổ biến</span>
        </Space>
      ),
      children: (
        <List
          dataSource={data.topCategories}
          renderItem={(item, index) => (
            <List.Item>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space>
                    <Badge
                      count={index + 1}
                      style={{
                        backgroundColor: index < 3 ? chartColors.stats.primary : token.colorBgTextHover,
                      }}
                    />
                    <Text strong>{item.category}</Text>
                  </Space>
                  <Text type="secondary">{item.percentage}%</Text>
                </Space>
                <Progress
                  percent={item.percentage}
                  showInfo={false}
                  strokeColor={chartColors.stats.primary}
                  size="small"
                />
              </Space>
            </List.Item>
          )}
          size="small"
        />
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
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            Top hoạt động
          </Title>
          <Text type="secondary">Thống kê các mục nổi bật trong hệ thống</Text>
        </div>

        <Tabs items={items} />
      </Space>
    </Card>
  );
}


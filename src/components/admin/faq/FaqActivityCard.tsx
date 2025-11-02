import { Avatar, Button, Card, List, Space, Tag, Typography, theme, Skeleton } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { getFaqColors } from "./constants";

const { Text } = Typography;

interface FaqActivity {
  id: string;
  question: string;
  action: string;
  timestamp: string;
  category: string;
}

interface FaqActivityCardProps {
  activities: FaqActivity[];
  loading?: boolean;
}

export function FaqActivityCard({ activities, loading = false }: FaqActivityCardProps) {
  const { token } = theme.useToken();
  const faqColors = getFaqColors(token);

  return (
    <Card
      title="Hoạt động mới nhất"
      variant="borderless"
      style={{ borderRadius: 16 }}
      extra={<Button type="link">Xem toàn bộ nhật ký</Button>}
    >
      {loading ? (
        <List
          dataSource={[1, 2, 3, 4, 5]}
          renderItem={() => (
            <List.Item>
              <Skeleton avatar active paragraph={{ rows: 2 }} />
            </List.Item>
          )}
        />
      ) : (
        <List
          dataSource={activities}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar icon={<QuestionCircleOutlined />} style={{ backgroundColor: faqColors.categories[item.category] || token.colorPrimary }} />}
                title={
                  <Space direction="vertical" size={4}>
                    <Text strong>{item.question}</Text>
                    <Tag color={faqColors.tagColors[item.category] || 'default'}>{item.category}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    <Text>{item.action}</Text>
                    <Text type="secondary">{item.timestamp}</Text>
                  </Space>
                }
              />
              <Button type="link">Chi tiết</Button>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}


import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

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
}

export function FaqActivityCard({ activities }: FaqActivityCardProps) {
  return (
    <Card
      title="Hoạt động mới nhất"
      variant="borderless"
      style={{ borderRadius: 16 }}
      extra={<Button type="link">Xem toàn bộ nhật ký</Button>}
    >
      <List
        dataSource={activities}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              avatar={<Avatar icon={<QuestionCircleOutlined />} />}
              title={
                <Space direction="vertical" size={4}>
                  <Text strong>{item.question}</Text>
                  <Tag>{item.category}</Tag>
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
    </Card>
  );
}


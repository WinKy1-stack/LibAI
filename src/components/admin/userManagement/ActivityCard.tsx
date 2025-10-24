import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Activity {
  id: string;
  name: string;
  action: string;
  timestamp: string;
}

interface ActivityCardProps {
  activities: Activity[];
}

export function ActivityCard({ activities }: ActivityCardProps) {
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
              avatar={<Avatar icon={<TeamOutlined />} />}
              title={
                <Space>
                  <Text strong>{item.name}</Text>
                  <Tag>{item.id}</Tag>
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

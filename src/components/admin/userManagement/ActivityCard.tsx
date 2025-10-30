import { Avatar, Button, Card, List, Space, Tag, Typography, theme, Skeleton } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Text } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      title="Hoạt động mới nhất"
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
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
      )}
    </Card>
  );
}

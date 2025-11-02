import { Card, List, Avatar, Tag, Typography, theme, Skeleton } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { BorrowActivity } from "../../../data/mockBorrows";

const { Title, Text } = Typography;
const { useToken } = theme;

interface RecentActivityCardProps {
  activities: BorrowActivity[];
  loading?: boolean;
}

const getActionConfig = (
  action: BorrowActivity["action"]
): { text: string; color: string; icon: React.ReactNode } => {
  const configs = {
    borrow: {
      text: "Mượn sách",
      color: "blue",
      icon: <BookOutlined />,
    },
    return: {
      text: "Trả sách",
      color: "green",
      icon: <CheckCircleOutlined />,
    },
    renew: {
      text: "Gia hạn",
      color: "orange",
      icon: <ReloadOutlined />,
    },
    overdue: {
      text: "Quá hạn",
      color: "red",
      icon: <ClockCircleOutlined />,
    },
    lost: {
      text: "Mất sách",
      color: "default",
      icon: <ExclamationCircleOutlined />,
    },
  };
  return configs[action];
};

export const RecentActivityCard = ({ activities, loading = false }: RecentActivityCardProps) => {
  const { token } = useToken();

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
        Hoạt động gần đây
      </Title>
      {loading ? (
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={activities}
        renderItem={(item) => {
          const actionConfig = getActionConfig(item.action);
          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={item.userAvatar} size={40}>
                    {item.userName.charAt(0)}
                  </Avatar>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Text strong>{item.userName}</Text>
                    <Tag color={actionConfig.color} icon={actionConfig.icon}>
                      {actionConfig.text}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text ellipsis style={{ display: "block" }}>
                      {item.bookTitle}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.timeAgo}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      )}
    </Card>
  );
};

import { AppstoreOutlined } from "@ant-design/icons";
import { Card, Progress, Space, Tag, Typography, theme } from "antd";
import type { UserRole } from "../../../data";
import { roleLabels } from "./constants";

const { Text } = Typography;

interface RoleDistributionCardProps {
  distribution: Array<{ role: UserRole; count: number }>;
  totalCount: number;
  averageCompletion: number;
}

export function RoleDistributionCard({
  distribution,
  totalCount,
  averageCompletion,
}: RoleDistributionCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      title="Cơ cấu vai trò"
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {distribution.map((item) => {
          const percent = totalCount === 0 ? 0 : Math.round((item.count / totalCount) * 100);
          return (
            <div key={item.role}>
              <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                <Space size={8}>
                  <AppstoreOutlined />
                  <Text strong>{roleLabels[item.role]}</Text>
                </Space>
                <Text type="secondary">{item.count} người</Text>
              </Space>
              <Progress
                percent={percent}
                strokeColor={
                  item.role === "administrator"
                    ? token.colorWarning
                    : item.role === "librarian"
                    ? token.colorPrimary
                    : token.colorInfo
                }
                size="small"
              />
            </div>
          );
        })}
        <Card
          style={{
            borderRadius: 14,
            background: token.colorFillSecondary,
          }}
          variant="borderless"
        >
          <Space direction="vertical" size={6}>
            <Text strong style={{ fontSize: 16 }}>
              Hiệu suất trung bình
            </Text>
            <Text type="secondary">Điểm hoàn thành nhiệm vụ mượn trả trung bình của toàn bộ hệ thống.</Text>
            <Progress percent={averageCompletion} strokeColor={token.colorSuccess} status="active" size="small" />
            <Tag color="processing" style={{ alignSelf: "flex-start", marginTop: 4 }}>
              {averageCompletion}% hoàn thành
            </Tag>
          </Space>
        </Card>
      </Space>
    </Card>
  );
}

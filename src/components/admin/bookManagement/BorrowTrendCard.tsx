import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Badge, Card, Progress, Space, Tag, Typography, theme } from "antd";
import { formatDelta } from "./utils";

const { Text } = Typography;

interface BorrowTrendPoint {
  month: string;
  borrowed: number;
  returned: number;
}

interface BorrowTrendCardProps {
  trend: BorrowTrendPoint[];
  change: { borrowed: number; returned: number };
}

export function BorrowTrendCard({ trend, change }: BorrowTrendCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      title="Xu hướng mượn sách"
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space wrap>
          <Badge
            color={token.colorSuccess}
            text={
              <Space>
                <ArrowUpOutlined /> Mượn tháng này: {trend.at(-1)?.borrowed ?? 0}
              </Space>
            }
          />
          <Badge
            color={token.colorInfo}
            text={
              <Space>
                <ArrowDownOutlined /> Trả tháng này: {trend.at(-1)?.returned ?? 0}
              </Space>
            }
          />
        </Space>
        <Space wrap>
          <Tag color={change.borrowed >= 0 ? "success" : "warning"}>
            Biến động mượn: {formatDelta(change.borrowed)}
          </Tag>
          <Tag color={change.returned >= 0 ? "processing" : "error"}>
            Biến động trả: {formatDelta(change.returned)}
          </Tag>
        </Space>

        {/* Scrollable container với thanh scroll ẩn */}
        <div
          style={{
            overflowY: "auto",
            width: "100%",
          }}
          className="hide-scrollbar"
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none; /* Chrome, Safari */
            }
          `}</style>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {[...trend].reverse().map((item: BorrowTrendPoint) => (
              <div
                key={item.month}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: token.colorFillTertiary,
                }}
              >
                <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                  <Text strong>{item.month}</Text>
                  <Text type="secondary">{item.borrowed} lượt mượn</Text>
                </Space>
                <Progress
                  percent={Math.min(Math.round((item.borrowed / 700) * 100), 100)}
                  strokeColor={token.colorPrimary}
                  size="small"
                  style={{ marginBottom: 0, marginTop: 8 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Đã trả: {item.returned} lượt
                </Text>
              </div>
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  );
}

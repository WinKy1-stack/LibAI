import { Card, Space, Typography, theme } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ActivityMetrics } from "../../../data/mockReports";

const { Title, Text } = Typography;
const { useToken } = theme;

interface ActivityCardProps {
  data: ActivityMetrics[];
}

export function ActivityCard({ data }: ActivityCardProps) {
  const { token } = useToken();

  const totalActivity = data.reduce(
    (sum, item) => sum + item.checkouts + item.returns + item.visitors,
    0
  );

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
              Hoạt động trong tuần
            </Title>
            <Text type="secondary">Theo dõi lượt mượn, trả và khách tham quan</Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
              {totalActivity}
            </Title>
            <Text type="secondary">Tổng hoạt động</Text>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorder} />
            <XAxis
              dataKey="date"
              stroke={token.colorTextSecondary}
              style={{ fontSize: 12 }}
            />
            <YAxis stroke={token.colorTextSecondary} style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: token.colorBgContainer,
                borderColor: token.colorBorder,
                borderRadius: 8,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => {
                switch (value) {
                  case "checkouts":
                    return "Lượt mượn";
                  case "returns":
                    return "Lượt trả";
                  case "visitors":
                    return "Khách tham quan";
                  default:
                    return value;
                }
              }}
            />
            <Line
              type="monotone"
              dataKey="checkouts"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="returns"
              stroke="#52c41a"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#722ed1"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Space>
    </Card>
  );
}


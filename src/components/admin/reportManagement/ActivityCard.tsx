import { Card, Space, Typography, theme, Skeleton } from "antd";
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
import type { ActivityMetrics } from "../../../data";
import { getChartColors } from "./constants";

const { Title, Text } = Typography;
const { useToken } = theme;

interface ActivityCardProps {
  data: ActivityMetrics[];
  loading?: boolean;
}

export function ActivityCard({ data, loading = false }: ActivityCardProps) {
  const { token } = useToken();
  const chartColors = getChartColors(token);

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

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
            <Skeleton.Image active />
          </div>
        ) : (
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
              stroke={chartColors.checkouts}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="returns"
              stroke={chartColors.returns}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke={chartColors.visitors}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </Space>
    </Card>
  );
}


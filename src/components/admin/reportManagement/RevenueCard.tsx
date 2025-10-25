import { Card, Space, Typography, theme } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RevenueData } from "../../../data/mockReports";

const { Title, Text } = Typography;
const { useToken } = theme;

interface RevenueCardProps {
  data: RevenueData[];
}

export function RevenueCard({ data }: RevenueCardProps) {
  const { token } = useToken();

  const totalRevenue = data.reduce(
    (sum, item) => sum + item.fines + item.subscriptions + item.lateReturns,
    0
  );

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}K`;
  };

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
              Doanh thu theo tháng
            </Title>
            <Text type="secondary">Thu nhập từ phí phạt và dịch vụ</Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Title level={3} style={{ margin: 0, color: token.colorSuccess }}>
              {formatCurrency(totalRevenue)}
            </Title>
            <Text type="secondary">Tổng doanh thu</Text>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorder} />
            <XAxis
              dataKey="month"
              stroke={token.colorTextSecondary}
              style={{ fontSize: 12 }}
            />
            <YAxis
              stroke={token.colorTextSecondary}
              style={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: token.colorBgContainer,
                borderColor: token.colorBorder,
                borderRadius: 8,
              }}
              formatter={(value: number) => [`${value.toLocaleString()} VNĐ`, ""]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => {
                switch (value) {
                  case "fines":
                    return "Phí phạt";
                  case "subscriptions":
                    return "Phí thành viên";
                  case "lateReturns":
                    return "Phí trả muộn";
                  default:
                    return value;
                }
              }}
            />
            <Bar dataKey="fines" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="subscriptions" fill="#52c41a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lateReturns" fill="#faad14" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Space>
    </Card>
  );
}


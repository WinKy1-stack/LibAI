import { Card, Typography, theme, Skeleton } from "antd";
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
import { visitorsBorrowersData } from "../../../data";
import { useState, useEffect } from "react";

const { Text } = Typography;

export default function VisitorsBorrowersChart() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      title={
        <Text strong style={{ fontSize: 24, fontWeight: 600 }}>
          Phân tích lượt truy cập và mượn sách
        </Text>
      }
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowTertiary,
        transition: "box-shadow 0.3s ease",
      }}
    >
      {loading ? (
        <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Skeleton.Image
            active
            style={{
              width: 300,
              height: 300,
            }}
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={visitorsBorrowersData}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorder} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: token.colorTextSecondary, fontSize: 13 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: token.colorTextSecondary, fontSize: 13 }}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadowSecondary,
                backgroundColor: token.colorBgContainer,
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Bar
              dataKey="visitors"
              name="Visitors"
              fill={token.colorPrimary}
              radius={[4, 4, 0, 0]}
              barSize={25}
            />
            <Bar
              dataKey="borrowers"
              name="Borrowers"
              fill={token.colorTextSecondary}
              radius={[4, 4, 0, 0]}
              barSize={25}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}


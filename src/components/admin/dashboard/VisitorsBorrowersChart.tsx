import { Card, Typography } from "antd";
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

const { Text } = Typography;

const chartData = [
  {
    day: "SAT",
    visitors: 25,
    borrowers: 48,
  },
  {
    day: "SUN",
    visitors: 75,
    borrowers: 40,
  },
  {
    day: "MON",
    visitors: 12,
    borrowers: 65,
  },
  {
    day: "TUE",
    visitors: 98,
    borrowers: 75,
  },
  {
    day: "WED",
    visitors: 15,
    borrowers: 12,
  },
  {
    day: "THU",
    visitors: 8,
    borrowers: 28,
  },
  {
    day: "FRI",
    visitors: 35,
    borrowers: 90,
  },
];

export default function VisitorsBorrowersChart() {
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
        boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02)"
      }}
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8c8c8c", fontSize: 13 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8c8c8c", fontSize: 13 }}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
            fill="#ff4757"
            radius={[4, 4, 0, 0]}
            barSize={25}
          />
          <Bar
            dataKey="borrowers"
            name="Borrowers"
            fill="#a0a0a0"
            radius={[4, 4, 0, 0]}
            barSize={25}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}


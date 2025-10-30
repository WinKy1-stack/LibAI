import { Card, Typography, theme, Skeleton } from "antd";
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

const { Title } = Typography;
const { useToken } = theme;

interface BorrowTrendData {
  month: string;
  borrows: number;
  returns: number;
  overdue: number;
}

interface BorrowTrendCardProps {
  data: BorrowTrendData[];
  loading?: boolean;
}

export const BorrowTrendCard = ({ data, loading = false }: BorrowTrendCardProps) => {
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
        Xu hướng mượn sách
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="borrows"
              stroke={token.colorInfo}
              name="Lượt mượn"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="returns"
              stroke={token.colorSuccess}
              name="Lượt trả"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="overdue"
              stroke={token.colorError}
              name="Quá hạn"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

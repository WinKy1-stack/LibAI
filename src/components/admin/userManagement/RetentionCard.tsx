import { Badge, Card, Progress, Space, Tag, Typography, theme, Skeleton } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { formatDelta } from "./utils";

const { Text } = Typography;

export interface RetentionTrendPoint {
  month: string;
  active: number;
  churned: number;
}

interface RetentionCardProps {
  trend: RetentionTrendPoint[];
  change: { active: number; churn: number };
}

export function RetentionCard({ trend, change }: RetentionCardProps) {
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
      title="Tỷ lệ giữ chân người dùng"
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      {loading ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Skeleton.Button active style={{ width: "100%", height: 32 }} />
          <Skeleton.Button active style={{ width: "100%", height: 32 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </Space>
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space size={16} wrap>
          <RetentionBadge
            color={token.colorSuccess}
            icon={<ArrowUpOutlined />}
            label={`Hoạt động tháng này: ${trend.at(-1)?.active ?? 0}%`}
          />
          <RetentionBadge
            color={token.colorError}
            icon={<ArrowDownOutlined />}
            label={`Rời hệ thống: ${trend.at(-1)?.churned ?? 0}%`}
          />
        </Space>
        <Space size={16} wrap>
          <Tag color={change.active >= 0 ? "success" : "warning"}>
            Biến động hoạt động: {formatDelta(change.active)}%
          </Tag>
          <Tag color={change.churn <= 0 ? "processing" : "error"}>
            Biến động rời hệ thống: {formatDelta(change.churn)}%
          </Tag>
        </Space>

        {/* Scrollable container với thanh scroll ẩn */}
        <div
          style={{
            maxHeight: "323px",
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
            {[...trend].reverse().map((item: RetentionTrendPoint) => (
              <div
                key={item.month}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  background: token.colorFillTertiary,
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                  <Text strong>{item.month}</Text>
                  <Text type="secondary">{item.active}% giữ chân</Text>
                </Space>
                <Progress percent={item.active} strokeColor={token.colorSuccess} size="small" style={{ marginBottom: 0 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Rời hệ thống: {item.churned}%
                </Text>
              </div>
            ))}
          </Space>
        </div>
      </Space>
      )}
    </Card>
  );
}

interface RetentionBadgeProps {
  color: string;
  icon: ReactNode;
  label: string;
}

function RetentionBadge({ color, icon, label }: RetentionBadgeProps) {
  return (
    <Badge
      color={color}
      text={
        <Space>
          {icon}
          {label}
        </Space>
      }
    />
  );
}

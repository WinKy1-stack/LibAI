import { Card, Typography, Space, theme } from "antd";
import React from "react";

const { Title, Text } = Typography;
const { useToken } = theme;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const { token } = useToken();

  return (
    <Card
      variant="borderless"
      hoverable
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowSecondary,
        transition: "all 0.3s ease",
        height: "100%",
      }}
      styles={{
        body: {
          padding: "20px 24px",
          height: "100%",
        },
      }}
    >
      <Space
        align="center"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left: text */}
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ margin: 0, fontSize: 32, marginBottom: 6 }}>
            {value}
          </Title>
          <Text style={{ fontSize: 14, fontWeight: 700, color: token.colorTextSecondary }}>
            {title}
          </Text>
        </Space>

        {/* Right: icon */}
        <div
          style={{
            background: token.colorPrimary,
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 16,
          }}
        >
          {icon}
        </div>
      </Space>
    </Card>
  );
};

export default StatCard;

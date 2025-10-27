import { Space, Tabs, Spin, Grid, Typography } from "antd";
import { RobotOutlined, SettingOutlined, SafetyOutlined, BellOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { AIConfigCard, SystemConfigCard, SecurityCard, NotificationSettingsCard } from "../../components/admin/settings";

const { useBreakpoint } = Grid;
const { Title } = Typography;

export default function SettingsPage() {
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ai");

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          width: "100%",
        }}
      >
        <Spin size="large" tip="">
          <div />
        </Spin>
      </div>
    );
  }

  const tabItems = [
    {
      key: "ai",
      label: screens.md && "AI Configuration",
      icon: <RobotOutlined />,
      children: <AIConfigCard />,
    },
    {
      key: "system",
      label: screens.md && "System Config",
      icon: <SettingOutlined />,
      children: <SystemConfigCard />,
    },
    {
      key: "security",
      label: screens.md && "Security & Access",
      icon: <SafetyOutlined />,
      children: <SecurityCard />,
    },
    {
      key: "notifications",
      label: screens.md && "Notifications",
      icon: <BellOutlined />,
      children: <NotificationSettingsCard />,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ display: "block", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Cài đặt hệ thống
          </Title>
          <Typography.Text type="secondary">
            Quản lý cấu hình AI, hệ thống, bảo mật và thông báo
          </Typography.Text>
        </div>

        {/* Settings Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size={screens.md ? "large" : "middle"}
          tabPosition="top"
          type="card"
          style={{
            width: "100%",
            background: "transparent",
          }}
        />
      </Space>
    </div>
  );
}


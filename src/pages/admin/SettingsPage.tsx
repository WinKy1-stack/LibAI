import { Space, Tabs, Spin, Grid, Typography } from "antd";
import { RobotOutlined, SettingOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { AIConfigCard, SystemConfigCard } from "../../components/admin/settings";

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

  // Must be called before any early returns (Rules of Hooks)
  const tabItems = useMemo(() => [
    {
      key: "ai",
      label: screens.md && "AI Configuration",
      icon: <RobotOutlined />,
      children: activeTab === "ai" ? <AIConfigCard key="ai-card" /> : <div />,
    },
    {
      key: "system",
      label: screens.md && "System Config",
      icon: <SettingOutlined />,
      children: activeTab === "system" ? <SystemConfigCard key="system-card" /> : <div />,
    },
  ], [activeTab, screens.md]);

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

  return (
    <div style={{ maxWidth: 1200, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ display: "block", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Cài đặt hệ thống
          </Title>
          <Typography.Text type="secondary">
            Quản lý cấu hình AI và hệ thống
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


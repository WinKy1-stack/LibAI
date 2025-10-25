import { Space, Tabs, Spin, Grid, theme } from "antd";
import { RobotOutlined, SettingOutlined, SafetyOutlined, BellOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { AIConfigCard, SystemConfigCard, SecurityCard, NotificationSettingsCard } from "../../components/admin/settings";

const { useBreakpoint } = Grid;

export default function SettingsPage() {
  const screens = useBreakpoint();
  const { token } = theme.useToken();
  // Detect dark mode from theme
  const mode = token.colorBgContainer === "#141414" ? "dark" : "light";
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
      label: (
        <span>
          <RobotOutlined />
          {screens.md && " AI Configuration"}
        </span>
      ),
      children: <AIConfigCard mode={mode} />,
    },
    {
      key: "system",
      label: (
        <span>
          <SettingOutlined />
          {screens.md && " System"}
        </span>
      ),
      children: <SystemConfigCard mode={mode} />,
    },
    {
      key: "security",
      label: (
        <span>
          <SafetyOutlined />
          {screens.md && " Security"}
        </span>
      ),
      children: <SecurityCard mode={mode} />,
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined />
          {screens.md && " Notifications"}
        </span>
      ),
      children: <NotificationSettingsCard mode={mode} />,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ display: "block", width: "100%" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size={screens.md ? "large" : "middle"}
          tabPosition={screens.md ? "top" : "top"}
          type="card"
          style={{
            width: "100%",
          }}
        />
      </Space>
    </div>
  );
}


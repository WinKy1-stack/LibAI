import { Space, Tabs, Grid, theme, Typography } from "antd";
import { UserOutlined, BellOutlined, PictureOutlined, LockOutlined } from "@ant-design/icons";
import { useState } from "react";
import LibrarianProfileCard from "../../components/admin/librarianSettings/LibrarianProfileCard";
import LibrarianPreferencesCard from "../../components/admin/librarianSettings/LibrarianPreferencesCard";
import LibrarianNotificationCard from "../../components/admin/librarianSettings/LibrarianNotificationCard";
import LibrarianPasswordCard from "../../components/admin/librarianSettings/LibrarianPasswordCard";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function LibrarianSettingsPage() {
  const screens = useBreakpoint();
  const { token } = theme.useToken();
  const mode = token.colorBgContainer === "#141414" ? "dark" : "light";
  const [activeTab, setActiveTab] = useState("profile");

  const tabItems = [
    {
      key: "profile",
      label: (
        <span>
          <UserOutlined />
          {screens.md && " Hồ sơ cá nhân"}
        </span>
      ),
      children: <LibrarianProfileCard mode={mode} />,
    },
    {
      key: "preferences",
      label: (
        <span>
          <PictureOutlined />
          {screens.md && " Giao diện"}
        </span>
      ),
      children: <LibrarianPreferencesCard mode={mode} />,
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined />
          {screens.md && " Thông báo"}
        </span>
      ),
      children: <LibrarianNotificationCard mode={mode} />,
    },
    {
      key: "password",
      label: (
        <span>
          <LockOutlined />
          {screens.md && " Bảo mật"}
        </span>
      ),
      children: <LibrarianPasswordCard mode={mode} />,
    },
  ];

  return (
    <div style={{ maxWidth: 1000, marginInline: "auto", width: "100%", padding: screens.md ? 24 : 16 }}>
      <Space direction="vertical" size={24} style={{ display: "block", width: "100%" }}>
        <Title level={2} style={{ margin: 0 }}>
          Cài đặt thủ thư
        </Title>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size={screens.md ? "large" : "middle"}
          type="card"
          style={{
            width: "100%",
          }}
        />
      </Space>
    </div>
  );
}


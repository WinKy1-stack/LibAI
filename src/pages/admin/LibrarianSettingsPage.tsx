import { Space, Tabs, Grid, Typography } from "antd";
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
      children: <LibrarianProfileCard />,
    },
    {
      key: "preferences",
      label: (
        <span>
          <PictureOutlined />
          {screens.md && " Giao diện"}
        </span>
      ),
      children: <LibrarianPreferencesCard />,
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined />
          {screens.md && " Thông báo"}
        </span>
      ),
      children: <LibrarianNotificationCard />,
    },
    {
      key: "password",
      label: (
        <span>
          <LockOutlined />
          {screens.md && " Bảo mật"}
        </span>
      ),
      children: <LibrarianPasswordCard />,
    },
  ];

  return (
    <div style={{ maxWidth: 1000, marginInline: "auto", width: "100%", padding: screens.md ? 24 : 16 }}>
      <Space direction="vertical" size={24} style={{ display: "block", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Cài đặt thủ thư
          </Title>
          <Typography.Text type="secondary">
            Quản lý thông tin cá nhân, giao diện, thông báo và bảo mật
          </Typography.Text>
        </div>
        
        {/* Librarian Settings Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size={screens.md ? "large" : "middle"}
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


import { Layout, Menu, Button, Grid } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { useBreakpoint } = Grid;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mode: string;
}

export default function Sidebar({ collapsed, onCollapse, mode }: SidebarProps) {
  const screens = useBreakpoint();

  const menuItems = [
    { 
      key: "dashboard", 
      icon: <DashboardOutlined />, 
      label: "Dashboard" 
    },
    { 
      key: "users", 
      icon: <TeamOutlined />, 
      label: "Users" 
    },
    { 
      key: "books", 
      icon: <BookOutlined />, 
      label: "Books" 
    },
  ];

  return (
    <Sider
      breakpoint="md"
      collapsedWidth={screens.xs ? 0 : 64}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      style={{ 
        position: "sticky", 
        top: 0, 
        height: "100vh",
        background: mode === "dark" ? "#001529" : "#fff",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        borderRight: mode === "dark" ? "none" : "1px solid #f0f0f0",
      }}
    >
      {/* Logo */}
      <div style={{ 
        height: 64, 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: collapsed ? 18 : 20,
        color: mode === "dark" ? "#fff" : "#000",
        borderBottom: mode === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f0f0f0",
        padding: "0 16px",
      }}>
        {collapsed ? "📚" : "LOGO"}
      </div>
      
      {/* Menu */}
      <Menu
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        style={{ 
          border: "none",
          background: "transparent",
          marginTop: 16,
        }}
        items={menuItems}
      />
      
      {/* Sidebar footer - Settings icon */}
      {!collapsed && (
        <div style={{ 
          position: "absolute", 
          bottom: 24, 
          left: 0, 
          right: 0,
          padding: "0 16px" 
        }}>
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            style={{ width: "100%" }}
          >
            Settings
          </Button>
        </div>
      )}
    </Sider>
  );
}

import { useMemo } from 'react';
import { Layout, Menu, Button, Grid, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImg from '/logo.png';
import logoDarkImg from '/logo_darkmode.png';

const { Sider } = Layout;
const { useBreakpoint } = Grid;
const { useToken } = theme;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mode: string;
}

// Menu items outside component to prevent re-renders
const menuItems = [
  { 
    key: "/admin", 
    icon: <DashboardOutlined />, 
    label: "Dashboard" 
  },
  { 
    key: "/admin/users", 
    icon: <TeamOutlined />, 
    label: "Users" 
  },
  { 
    key: "/admin/books", 
    icon: <BookOutlined />, 
    label: "Books" 
  },
  { 
    key: "/admin/reports", 
    icon: <BarChartOutlined />, 
    label: "Reports"
  },
  { 
    key: "/admin/faq", 
    icon: <QuestionCircleOutlined />, 
    label: "FAQ"
  },
  { 
    key: "/admin/settings", 
    icon: <SettingOutlined />, 
    label: "Settings"
  },
];

export default function Sidebar({ collapsed, onCollapse, mode }: SidebarProps) {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();

  const selectedKey = useMemo(() => {
    const stringKeys = menuItems
      .map(({ key }) => key)
      .filter((key): key is string => typeof key === "string");

    const exactMatch = stringKeys.find((key) => location.pathname === key);
    if (exactMatch) return exactMatch;

    const partialMatch = stringKeys
      .filter((key) => location.pathname.startsWith(`${key}/`))
      .sort((a, b) => b.length - a.length)[0];

    return partialMatch ?? "/admin";
  }, [location.pathname]);

  const isMobile = !screens.md;

  return (
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      {/* Overlay/Backdrop when sidebar is expanded */}
      {!collapsed && (
        <div
          onClick={() => onCollapse(true)}
          style={{
            position: "fixed",
            top: 0,
            left: isMobile ? 0 : 80, // Start from sidebar minimized width on desktop
            right: 0,
            bottom: 0,
            background: mode === "dark"
              ? "rgba(0, 0, 0, 0.65)"
              : isMobile ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}
      
      <Sider
        breakpoint="md"
        collapsedWidth={isMobile ? 0 : 80}
        width={isMobile ? 280 : collapsed ? 80 : 280}
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={null}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          background: token.colorBgContainer,
          boxShadow: token.boxShadowSecondary,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          zIndex: 1000,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          ...(isMobile && {
            transform: collapsed ? "translateX(-100%)" : "translateX(0)",
          }),
        }}
      >
      {/* Logo */}
      <div style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed && !isMobile ? "center" : "space-between",
        fontWeight: 700,
        fontSize: collapsed && !isMobile ? 24 : 20,
        color: token.colorText,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: collapsed && !isMobile ? "0" : "0 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed && !isMobile ? 0 : 12 }}>
          <img 
            src={mode === "dark" ? logoDarkImg : logoImg} 
            alt="LibAI Logo" 
            style={{ 
              height: collapsed && !isMobile ? 32 : 40,
              width: "auto",
              objectFit: "contain"
            }} 
          />
          {!collapsed && <span>LibAI</span>}
        </div>
        {!collapsed && (
          <Button
            type="text"
            onClick={() => onCollapse(true)}
            style={{
              color: token.colorText,
              fontSize: 20,
              padding: "4px 8px",
            }}
          >
            ✕
          </Button>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => {
          if (typeof key === 'string') {
            navigate(key);
            // Auto-close sidebar when expanded (has backdrop)
            if (!collapsed) {
              onCollapse(true);
            }
          }
        }}
        style={{ 
          border: "none",
          background: "transparent",
          marginTop: 16,
        }}
        items={menuItems}
      />
      </Sider>
    </>
  );
}

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { ConfigProvider, Layout, Grid, theme } from "antd";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAdminTheme } from "../../../hooks/useAdminTheme";
import "../style.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const screens = useBreakpoint();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(!screens.md); // Auto collapse on mobile
  const { token } = theme.useToken();

  // Sử dụng custom hook để quản lý theme
  const { mode, setMode, themeConfig } = useAdminTheme();

  // Update document title based on current route
  useEffect(() => {
    const pathToTitle: Record<string, string> = {
      "/admin": "LibAI - Dashboard",
      "/admin/user": "LibAI - User Management",
      "/admin/books": "LibAI - Books Management",
      "/admin/reports": "LibAI - Reports",
      "/admin/faq": "LibAI - FAQ Management",
      "/admin/settings": "LibAI - Settings",
      "/admin/librarian": "LibAI - Librarian Settings",
    };

    const title = pathToTitle[location.pathname] || "LibAI - Admin";
    document.title = title;
  }, [location.pathname]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (!screens.md) {
      setCollapsed(true);
    }
  }, [screens.md]);

  const layoutStyle = useMemo(
    () => ({ minHeight: "100vh", height: "100vh" }),
    []
  );

  const innerLayoutStyle = useMemo(
    () => ({ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column" as const,
      width: "100%",
    }),
    []
  );

  const contentStyle = useMemo(
    () => ({
      padding: screens.md ? 24 : 16,
      paddingTop: 64 + (screens.md ? 24 : 16), // TopBar height + padding
      flex: 1,
      overflowY: "auto" as const,
      width: screens.md ? "calc(100% - 80px)" : "100%",
      background: token.colorBgLayout,
      marginLeft: screens.md ? 80 : 0, // Space for minimized sidebar on desktop/tablet
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }),
    [screens.md, token.colorBgLayout]
  );

  const handleToggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      {/* Sidebar overlay - outside layout */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} mode={mode} />
      
      <Layout style={layoutStyle}>
        {/* Main Content Area */}
        <Layout style={innerLayoutStyle}>
          <TopBar 
            collapsed={collapsed} 
            onToggle={handleToggle} 
            mode={mode} 
            setMode={setMode} 
          />

          <Content style={contentStyle}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { ConfigProvider, Layout, Grid, theme, Spin } from "antd";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAdminTheme } from "../../../hooks/useAdminTheme";
import { authService } from "../../../services/authService";
import type { User } from "../../../types/auth";
import "../style.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const screens = useBreakpoint();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(!screens.md); // Auto collapse on mobile
  const { token } = theme.useToken();

  // Sử dụng custom hook để quản lý theme
  const { mode, setMode, themeConfig } = useAdminTheme();

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setLoading(false);
          return;
        }

        // If not in localStorage, fetch from API
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        // Store in localStorage for future use
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // If fetch fails, try to use stored user anyway
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
      transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }),
    [screens.md, token.colorBgLayout]
  );

  const handleToggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  // Show loading spinner while fetching user
  if (loading) {
    return (
      <ConfigProvider theme={themeConfig}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: token.colorBgLayout
        }}>
          <Spin size="large" />
        </div>
      </ConfigProvider>
    );
  }

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
            user={user}
          />

          <Content style={contentStyle}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

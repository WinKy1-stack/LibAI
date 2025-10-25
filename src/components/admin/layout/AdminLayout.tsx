import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { ConfigProvider, theme as antdTheme, Layout, Grid } from "antd";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../color.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

// Design tokens - pure Ant Design, no CSS variables
const designTokens = {
  colorPrimary: "#ff4757",
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorError: "#ff4d4f",
  borderRadius: 12,
  fontFamily: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const screens = useBreakpoint();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(!screens.md); // Auto collapse on mobile
  
  // Load theme from localStorage or default to light
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    return (savedTheme === "dark" || savedTheme === "light") ? savedTheme : "light";
  });

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

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("admin-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (!screens.md) {
      setCollapsed(true);
    }
  }, [screens.md]);

  const themeConfig = useMemo(
    () => ({
      algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: designTokens,
    }),
    [mode]
  );

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
      flex: 1,
      overflowY: "auto" as const,
      width: screens.md ? "calc(100% - 80px)" : "100%",
      background: mode === "dark" ? "#141414" : "#f5f5f5",
      marginLeft: screens.md ? 80 : 0, // Space for minimized sidebar on desktop/tablet
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }),
    [screens.md, mode]
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

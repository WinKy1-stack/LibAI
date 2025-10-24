import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { ConfigProvider, theme as antdTheme, Layout, Grid } from "antd";
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
  const [collapsed, setCollapsed] = useState(!screens.md); // Auto collapse on mobile
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
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
    () => ({ height: "100vh", display: "flex", flexDirection: "column" as const }),
    []
  );

  const contentStyle = useMemo(
    () => ({
      padding: screens.md ? 24 : 16,
      flex: 1,
      overflowY: "auto" as const,
      width: "100%",
      background: mode === "dark" ? "#141414" : "#f5f5f5",
    }),
    [screens.md, mode]
  );

  const handleToggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={layoutStyle}>
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} mode={mode} />
        
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

import { useState, useEffect, type ReactNode } from "react";
import { ConfigProvider, theme as antdTheme, Layout, Grid } from "antd";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../color.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

// ------- Helpers to read CSS variables from color.css ---------
const readCssVar = (name: string, fallback: string): string => {
  const r = getComputedStyle(document.documentElement).getPropertyValue(name);
  return r ? String(r).trim() : fallback;
};

function useDesignTokens(mode: "light" | "dark") {
  const [tokens, setTokens] = useState({});

  useEffect(() => {
    const primary = readCssVar("--primary", "#ff4757");
    const success = readCssVar("--success", "#52c41a");
    const warning = readCssVar("--warning", "#faad14");
    const error = readCssVar("--error", "#ff4d4f");
    const radius = Number(readCssVar("--radius", "12"));

    setTokens({
      colorPrimary: primary,
      colorSuccess: success,
      colorWarning: warning,
      colorError: error,
      borderRadius: radius,
    });
  }, [mode]);

  return tokens;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(!screens.md); // Auto collapse on mobile
  const [mode, setMode] = useState<"light" | "dark">("light");
  const tokens = useDesignTokens(mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (!screens.md) {
      setCollapsed(true);
    }
  }, [screens.md]);

  const algorithm = mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  return (
    <ConfigProvider theme={{ algorithm, token: tokens }}>
      <Layout style={{ minHeight: "100vh", height: "100vh" }}>
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} mode={mode} />
        
        {/* Main Content Area */}
        <Layout style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <TopBar 
            collapsed={collapsed} 
            onToggle={() => setCollapsed((c) => !c)} 
            mode={mode} 
            setMode={setMode} 
          />

          <Content style={{ 
            padding: screens.md ? 24 : 16, 
            flex: 1,
            overflowY: "auto",
            width: "100%",
            background: mode === "dark" ? "#141414" : "#f5f5f5",
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

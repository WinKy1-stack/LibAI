import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
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

// Cache tokens to avoid expensive getComputedStyle calls
const cachedTokens = {
  light: null as Record<string, unknown> | null,
  dark: null as Record<string, unknown> | null,
};

function getDesignTokens(mode: "light" | "dark") {
  // Return cached if available
  if (cachedTokens[mode]) {
    return cachedTokens[mode]!;
  }

  const primary = readCssVar("--primary", "#ff4757");
  const success = readCssVar("--success", "#52c41a");
  const warning = readCssVar("--warning", "#faad14");
  const error = readCssVar("--error", "#ff4d4f");
  const radius = Number(readCssVar("--radius", "12"));

  const tokens = {
    colorPrimary: primary,
    colorSuccess: success,
    colorWarning: warning,
    colorError: error,
    borderRadius: radius,
  };

  // Cache the result
  cachedTokens[mode] = tokens;
  return tokens;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(!screens.md); // Auto collapse on mobile
  const [mode, setMode] = useState<"light" | "dark">("light");
  const tokens = getDesignTokens(mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (!screens.md) {
      setCollapsed(true);
    }
  }, [screens.md]);

  const algorithm = useMemo(
    () => (mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm),
    [mode]
  );

  const themeConfig = useMemo(
    () => ({ algorithm, token: tokens }),
    [algorithm, tokens]
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

import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import { useUserTheme } from "../../../hooks/useUserTheme";
import { ConfigProvider } from "antd";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  
  const { mode, toggleMode, themeConfig } = useUserTheme();

  // Hide layout for login and signup pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // theme state handled by useUserTheme

  // Auth pages (login/signup) - no layout
  if (isAuthPage) {
    return <div>{children}</div>;
  }

  const handleToggleTheme = () => toggleMode();

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={{ 
        minHeight: "100vh",
        background: mode === "dark" 
          ? "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Top Bar */}
        <TopBar mode={mode} onToggleTheme={handleToggleTheme} />

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: "24px",
          paddingTop: "calc(72px + 24px)", // TopBar height + padding
        }}>
          {children}
        </main>
      </div>
    </ConfigProvider>
  );
}

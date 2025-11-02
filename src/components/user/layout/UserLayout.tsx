import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("user-theme");
    return (savedTheme === "dark" || savedTheme === "light") ? savedTheme : "dark";
  });

  // Hide layout for login and signup pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    localStorage.setItem("user-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Auth pages (login/signup) - no layout
  if (isAuthPage) {
    return <div>{children}</div>;
  }

  const handleToggleTheme = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
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
  );
}

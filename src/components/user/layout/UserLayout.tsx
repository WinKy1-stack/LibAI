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
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: mode === "dark"
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(0, 0, 0, 0.08)",
        padding: "24px",
        background: mode === "dark"
          ? "rgba(10, 10, 10, 0.6)"
          : "rgba(248, 249, 250, 0.9)",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          color: mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
          fontSize: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg style={{ width: 18, height: 18 }} fill="white" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700 }}>LibAI</span>
          </div>
          
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <a href="#" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }}>Về chúng tôi</a>
            <a href="#" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }}>Điều khoản</a>
            <a href="#" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }}>Chính sách</a>
            <a href="#" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }}>Liên hệ</a>
          </div>
          
          <div>
            © 2024 LibAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  
  // Initialize theme from localStorage or default to 'dark'
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("user-theme");
      return (savedTheme === "dark" || savedTheme === "light") ? savedTheme : "dark";
    }
    return "dark";
  });

  // Determine if the current page is an authentication page (login/signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Determine if the current page is the user's home page
  const isHomePage = location.pathname === '/' || location.pathname === '/user/home';

  // Apply the theme to the document and save it to localStorage
  useEffect(() => {
    localStorage.setItem("user-theme", mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  const handleToggleTheme = () => {
    setMode(prevMode => (prevMode === "dark" ? "light" : "dark"));
  };

  // Render nothing but the children for auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      {/* Top Bar */}
      <TopBar mode={mode} onToggleTheme={handleToggleTheme} />

      {/* Page Content */}
      <main className={`flex-1 ${isHomePage ? '' : 'p-4 sm:p-6 pt-[88px]'}`}>
        {children}
      </main>
    </div>
  );
}

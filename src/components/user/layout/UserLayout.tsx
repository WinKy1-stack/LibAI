import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  
  // Determine if the current page is an authentication page (login/signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Determine if the current page is the user's home page
  const isHomePage = location.pathname === '/' || location.pathname === '/user/home';
  
  // Determine if the current page is profile page
  const isProfilePage = location.pathname === '/profile';

  // Render nothing but the children for auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      {/* Top Bar */}
      <TopBar />

      {/* Page Content */}
      <main className={`flex-1 ${isHomePage || isProfilePage ? '' : 'p-4 sm:p-6 pt-[88px]'} ${isProfilePage ? 'pt-[88px]' : ''}`}>
        {children}
      </main>
    </div>
  );
}

import { HomeIcon, UserIcon, CogIcon, BellIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import './UserLayout.css';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="user-layout">
      {/* Header */}
      <header className="user-header">
        <div className="header-content">
          <h1 className="logo">
            <HeartIcon className="logo-icon" />
            Lib-AI
          </h1>
          
          <nav className="nav-menu">
            <a href="#" className="nav-item active">
              <HomeIcon className="nav-icon" />
              Trang chủ
            </a>
            <a href="#" className="nav-item">
              <UserIcon className="nav-icon" />
              Hồ sơ
            </a>
            <a href="#" className="nav-item">
              <BellIcon className="nav-icon" />
              Thông báo
            </a>
            <a href="#" className="nav-item">
              <CogIcon className="nav-icon" />
              Cài đặt
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="user-main">
        {children || (
          <div className="welcome-section">
            <h2>Chào mừng đến với Lib-AI</h2>
            <p>Giao diện user sử dụng Heroicons</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="user-footer">
        <p>© 2025 Lib-AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

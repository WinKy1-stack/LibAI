import { HomeIcon, UserIcon, CogIcon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { message } from 'antd';
import './UserLayout.css';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      message.success('Đăng xuất thành công!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

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
            <button onClick={handleLogout} className="nav-item logout-btn">
              <ArrowRightOnRectangleIcon className="nav-icon" />
              Đăng xuất
            </button>
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

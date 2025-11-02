import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useChatContext } from "../../../hooks/useChatContext";
import { authService } from "../../../services/authService";
import type { User } from "../../../types/auth";

interface TopBarProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

export default function TopBar({ mode, onToggleTheme }: TopBarProps) {
  const { setIsChatting } = useChatContext();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsChatting(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear localStorage anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsChatting(false);
      navigate('/');
    }
  };

  return (
    <header
      className={
        `h-16 fixed top-0 left-0 right-0 z-1000 flex items-center justify-between px-4 md:px-6 ` +
        (mode === 'dark'
          ? 'bg-transparent'
          : 'bg-transparent')
      }
      style={{ pointerEvents: 'none' }}
    >
      {/* Left Corner - Logo */}
      <div 
        className={`flex items-center gap-2 md:gap-3 rounded-2xl px-3 md:px-4 py-2 shadow-lg backdrop-blur-xl transition-all ${
          mode === 'dark'
            ? 'bg-black/80 border border-white/10'
            : 'bg-white/90 border border-black/10'
        }`}
        style={{ pointerEvents: 'auto' }}
      >
        <Link
          to="/"
          onClick={() => setIsChatting(false)}
          className="flex items-center gap-2 no-underline"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-pink-500 to-purple-600 shadow-[0_4px_12px_rgba(236,72,153,0.4)] flex items-center justify-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 topbar-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <span className={`text-lg md:text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>LibAI</span>
        </Link>
      </div>

      {/* Right Corner - Actions - Các nút riêng lẻ */}
      <div 
        className="flex items-center gap-2 md:gap-3"
        style={{ pointerEvents: 'auto' }}
      >
          {/* Chat History Button - CHỈ ADMIN */}
          {user && user.role === 'admin' && (
            <Link
              to="/user/chat"
              className={
                `inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border text-sm md:text-base font-semibold transition ` +
                (mode === 'dark'
                  ? 'text-white border-white/10 hover:bg-white/10 hover:border-purple-600'
                  : 'text-black border-black/10 hover:bg-black/5 hover:border-purple-600')
              }
              title="Lịch sử chat (Admin only)"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="hidden md:inline">Chat History</span>
            </Link>
          )}

          {/* Admin Button - Only show when not logged in */}
          {!user && (
            <Link
              to="/admin/dashboard"
              className={
                `inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg border text-sm md:text-base font-semibold transition ` +
                (mode === 'dark'
                  ? 'text-white border-white/10 hover:bg-white/10 hover:border-violet-600'
                  : 'text-black border-black/10 hover:bg-black/5 hover:border-violet-600')
              }
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <Switch
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={mode === 'light'}
            onChange={() => onToggleTheme()}
            size="default"
          />

          {/* User Avatar & Menu or Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-3 rounded-lg transition ${mode === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                style={{ padding: '4px 8px' }}
              >
                {/* User info text - aligned right */}
                <div style={{ textAlign: 'right', marginRight: 4 }} className="hidden md:block md:mr-2">
                  <span className={`block font-semibold ${mode === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    {user.name || user.email || 'User'}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm md:text-base shrink-0">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-99"
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    className={
                      `absolute right-0 mt-2 w-40 rounded-xl shadow-xl z-100 ` +
                      (mode === 'dark'
                        ? 'bg-[#1a1a1a] border border-white/10'
                        : 'bg-white border border-black/10')
                    }
                    style={{ padding: '6px' }}
                  >
                    <button
                      onClick={handleLogout}
                      className={
                        `w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium inline-flex items-center gap-2 transition ` +
                        (mode === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-black/5')
                      }
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-linear-to-br from-pink-500 to-purple-600 text-white text-xs md:text-sm font-bold no-underline inline-block transition shadow-[0_2px_8px_rgba(147,51,234,0.3)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(147,51,234,0.4)] topbar-login-btn"
              style={{ padding: '8px 12px', marginRight: '4px' }}
            >
              <span>Đăng nhập</span>
            </Link>
          )}
      </div>
    </header>
  );
}

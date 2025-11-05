import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SunIcon, MoonIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, Cog8ToothIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
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
    await authService.logout();
    setUser(null);
    setIsChatting(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4">
      {/* Left Corner - Logo */}
      <div className="flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2 shadow-md bg-background-primary/80 backdrop-blur-md border border-border-primary">
        <Link to="/" onClick={() => setIsChatting(false)} className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            {/* Replace with a proper SVG logo if available */}
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-text-primary">LibAI</span>
        </Link>
      </div>

      {/* Right Corner - Actions */}
      <div className="flex items-center gap-2 md:gap-3 p-2 rounded-lg shadow-md bg-background-primary/80 backdrop-blur-md border border-border-primary">
        {/* Chat History Button - ADMIN ONLY */}
        {user?.role === 'admin' && (
          <Link to="/user/chat" className="p-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors" title="Lịch sử chat (Admin)">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </Link>
        )}

        {/* Admin Dashboard Button - Not logged in */}
        {!user && (
          <Link to="/admin/dashboard" className="p-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors" title="Admin Dashboard">
            <Cog8ToothIcon className="w-5 h-5" />
          </Link>
        )}

        {/* Theme Toggle */}
        <button onClick={onToggleTheme} className="p-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors">
          {mode === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>

        {/* User Avatar & Menu or Login Button */}
        {user ? (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-background-primary border border-border-primary z-20 p-1">
                  <div className="px-3 py-2 border-b border-border-primary">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-500 hover:bg-background-hover rounded-md transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold transition-transform hover:scale-105">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChatContext } from "../../../contexts/ChatContext";
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
        `h-16 fixed top-0 left-0 right-0 z-1000 backdrop-blur-xl flex items-center justify-between ` +
        (mode === 'dark'
          ? 'border-b border-white/10 bg-black/90'
          : 'border-b border-black/10 bg-white/95')
      }
    >
      {/* Logo */}
      <Link
        to="/"
        onClick={() => setIsChatting(false)}
        className="flex items-center gap-3 no-underline px-6"
      >
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-pink-500 to-purple-600 shadow-[0_4px_12px_rgba(236,72,153,0.4)] flex items-center justify-center">
          <svg className="w-6 h-6" fill="white" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          </svg>
        </div>
        <span className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>LibAI</span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-3 pl-6 pr-16">
          {/* Admin Button - Only show when not logged in */}
          {!user && (
            <Link
              to="/admin/dashboard"
              className={
                `inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition ` +
                (mode === 'dark'
                  ? 'text-white border-white/10 hover:bg-white/10 hover:border-violet-600'
                  : 'text-black border-black/10 hover:bg-black/5 hover:border-violet-600')
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-lg transition ${mode === 'dark' ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
          >
            {mode === "dark" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* User Avatar & Menu or Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition ${mode === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  {user.name || user.email || 'User'}
                </span>
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
                      `absolute left-0 mt-2 w-36 rounded-xl shadow-xl p-1.5 z-100 ` +
                      (mode === 'dark'
                        ? 'bg-[#1a1a1a] border border-white/10'
                        : 'bg-white border border-black/10')
                    }
                  >
                    <button
                      onClick={handleLogout}
                      className={
                        `w-full px-2.5 py-2 rounded-lg text-left text-[13px] font-medium inline-flex items-center gap-1.5 transition ` +
                        (mode === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-black/5')
                      }
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="px-4 py-2.5 rounded-lg bg-linear-to-br from-pink-500 to-purple-600 text-white text-sm font-semibold no-underline inline-block transition shadow-[0_2px_8px_rgba(147,51,234,0.3)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(147,51,234,0.4)]"
            >
              Đăng nhập
            </Link>
          )}
      </div>
    </header>
  );
}

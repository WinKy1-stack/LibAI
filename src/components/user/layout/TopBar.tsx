import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  Cog8ToothIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useChatContext } from "../../../hooks/useChatContext";
import { useUserTheme } from "../../../hooks/useUserTheme";
import { authService } from "../../../services/authService";
import type { User } from "../../../types/auth";

export default function TopBar() {
  const { setIsChatting } = useChatContext();
  const { mode, toggleMode } = useUserTheme();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getStoredUser());

    const handleUserUpdate = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'object' && event.detail.id) {
        setUser(event.detail);
      }
    };

    window.addEventListener('user-updated', handleUserUpdate as EventListener);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsChatting(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background-primary/95 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsChatting(false)}
            className="flex items-center gap-2.5 no-underline group flex-shrink-0"
          >
            <div className="relative">
              <img
                src={mode === "light" ? "/logo.png" : "/logo_darkmode.png"}
                alt="LibAI Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                LibAI
              </span>
              <span className="hidden sm:block text-[10px] text-text-secondary font-medium -mt-0.5">
                AI Library Assistant
              </span>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleMode}
              className="p-2.5 rounded-xl text-text-secondary hover:bg-background-hover hover:text-text-primary transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
              title={mode === "light" ? "Chế độ tối" : "Chế độ sáng"}
              aria-label={mode === "light" ? "Chế độ tối" : "Chế độ sáng"}
            >
              {mode === "light" ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Center Actions */}
            <div className="flex sm:hidden items-center gap-1">
              {user?.role === "admin" && (
                <Link
                  to="/"
                  className="p-2 rounded-xl text-text-secondary hover:bg-background-hover hover:text-text-primary transition-all duration-200"
                  title="Lịch sử chat"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </Link>
              )}

              {!user && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 rounded-xl text-text-secondary hover:bg-background-hover hover:text-text-primary transition-all duration-200"
                  title="Quản trị viên"
                >
                  <Cog8ToothIcon className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-border-primary hover:ring-primary/80 transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-primary focus:outline-none"
                  aria-label="User menu"
                >
                  <img
                    src={`https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(
                      user.name || user.email || "user"
                    )}`}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div
                      className={`absolute right-0 mt-2 w-56 rounded-lg bg-background-primary shadow-lg z-20 overflow-hidden transition-all duration-150 ${
                        showMenu
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-border-primary/30">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-text-secondary truncate mt-1">
                          {user.email}
                        </p>
                        {user.role && (
                          <p className="text-xs font-medium text-primary mt-2">
                            {user.role === "admin" ? "Quản trị viên" : "Độc giả"}
                          </p>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            navigate("/profile");
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background-hover transition-colors duration-150"
                        >
                          <UserCircleIcon className="w-4 h-4" />
                          <span>Hồ sơ cá nhân</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-background-hover transition-colors duration-150"
                        >
                          <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-button-primary text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
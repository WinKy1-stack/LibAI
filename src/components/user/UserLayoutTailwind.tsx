import { HomeIcon, UserIcon, CogIcon, BellIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header với Tailwind CSS */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <HeartIcon className="w-8 h-8" />
              Lib-AI
            </h1>
            
            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Trang chủ</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Hồ sơ</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Thông báo</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <CogIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Cài đặt</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children || (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Chào mừng đến với Lib-AI
            </h2>
            <p className="text-xl text-gray-600">
              Giao diện user sử dụng <strong>Heroicons</strong> + <strong>Tailwind CSS</strong>
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <HomeIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trang chủ</h3>
                <p className="text-gray-600">Khám phá các tính năng mới nhất</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <UserIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Hồ sơ</h3>
                <p className="text-gray-600">Quản lý thông tin cá nhân</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <CogIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cài đặt</h3>
                <p className="text-gray-600">Tùy chỉnh theo ý thích</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2025 Lib-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

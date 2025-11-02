import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../../services/authService';
import type { LoginData } from '../../../types/auth';
import { useUserTheme } from '../../../hooks/useUserTheme';

export default function LoginPage() {
  // Ensure theme is applied consistently
  useUserTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
    remember: false,
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
      });

      // Lưu tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Chuẩn hóa dữ liệu user theo types/auth.User
      const responseUser = response.user as any;
      const userData = {
        id: responseUser.id || responseUser.user_id || '',
        email: responseUser.email || '',
        name: responseUser.name || responseUser.full_name || formData.username || '',
        role: (responseUser.role as 'admin' | 'librarian' | 'reader') || 'reader',
        student_id: responseUser.student_id,
        major: responseUser.major,
        status: responseUser.status,
        created_at: responseUser.created_at,
        last_login: responseUser.last_login,
      } as const;

      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect dựa vào role
      if (userData.role === 'admin' || userData.role === 'librarian') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        errorMessage = axiosError.response?.data?.error || 
                      axiosError.response?.data?.message || 
                      errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen max-h-screen overflow-hidden bg-black dark:bg-white">
      {/* Home link (top-left) */}
      <Link to="/" className="absolute top-6 left-10 z-50 hidden md:inline-flex items-center gap-2 no-underline transition">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/40 flex items-center justify-center">
          <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          </svg>
        </div>
        <span className="text-lg font-bold text-white">LibAI</span>
      </Link>

      {/* Left panel - Gradient background với decorations */}
      <div className="flex-1 relative overflow-hidden flex-col items-center justify-center p-10 text-center bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hidden md:flex">
        {/* Wave decoration */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)"/>
          <path d="M0,70 Q30,50 60,70 T100,70 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)"/>
        </svg>
        
        {/* Blur bubbles decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[280px] h-[280px] -left-[60px] top-20 bg-white opacity-15 rounded-full blur-[60px]" />
          <div className="absolute w-[220px] h-[220px] -right-10 top-[120px] bg-white opacity-12 rounded-full blur-[50px]" />
          <div className="absolute w-[260px] h-[260px] left-20 bottom-[60px] bg-white opacity-10 rounded-full blur-[55px]" />
        </div>

        <div className="text-center relative z-10 w-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_4px_12px_rgba(236,72,153,0.4)] flex items-center justify-center">
            <svg className="w-10 h-10" fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <h2 className="text-[34px] font-bold text-white leading-tight mb-3 text-center">
            Khám phá tri thức<br/>cùng LibAI
          </h2>
          <p className="text-base text-white/80 max-w-[380px] mx-auto mb-6 text-center">
            Trợ lý ảo thông minh giúp bạn tìm kiếm và quản lý tài liệu thư viện một cách dễ dàng
          </p>
        </div>
        
        {/* Decorative bars near bottom */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-10">
          <div className="w-12 h-1.5 bg-white rounded-full" />
          <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          <div className="w-12 h-1.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black dark:from-gray-50 dark:to-gray-100 p-6 md:p-12">
        <div className="w-full max-w-[420px] px-5">
          <h1 className="text-[30px] font-extrabold text-white dark:text-gray-900 mb-3">Đăng nhập</h1>
          <p className="text-base text-gray-400 dark:text-gray-500 mb-8">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-purple-500 dark:text-purple-600 font-semibold hover:text-purple-400 dark:hover:text-purple-700 transition-colors">Đăng ký ngay</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Email hoặc Mã sinh viên"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
              className="w-full px-4 py-3.5 text-[15px] rounded-xl border border-white/10 dark:border-black/10 bg-white/5 dark:bg-white text-white dark:text-gray-900 outline-none transition-all duration-200 focus:border-purple-600 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.1)] placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="w-full px-4 py-3.5 pr-12 text-[15px] rounded-xl border border-white/10 dark:border-black/10 bg-white/5 dark:bg-white text-white dark:text-gray-900 outline-none transition-all duration-200 focus:border-purple-600 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.1)] placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 dark:text-gray-600 text-sm">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-purple-600"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-purple-400 dark:text-purple-600 text-sm hover:text-purple-300 dark:hover:text-purple-700 transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 text-base font-semibold rounded-xl border-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white dark:text-gray-900 cursor-pointer shadow-[0_4px_12px_rgba(147,51,234,0.4)] transition-all duration-300 hover:shadow-[0_6px_16px_rgba(147,51,234,0.5)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            {/* Divider */}
            <div className="relative text-center my-4">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 dark:bg-black/10" />
              <span className="relative bg-gray-900 dark:bg-gray-50 px-4 text-gray-400 dark:text-gray-500 text-sm">Hoặc đăng nhập với</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="px-4 py-3 rounded-xl border border-white/10 dark:border-black/10 bg-white/5 dark:bg-white text-white dark:text-gray-900 cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white/10 dark:hover:bg-gray-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                className="px-4 py-3 rounded-xl border border-white/10 dark:border-black/10 bg-white/5 dark:bg-white text-white dark:text-gray-900 cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white/10 dark:hover:bg-gray-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.99-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.23 2.72M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-sm font-medium">Apple</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

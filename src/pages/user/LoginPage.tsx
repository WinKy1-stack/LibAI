import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { LoginData } from '../../types/auth';
import '../../index.css';
import { useUserTheme } from '../../hooks/useUserTheme';
import { InputField, PasswordInput, LeftPanel, SocialButtons, ThemeToggle } from '../../components/user/auth';

export default function LoginPage() {
  // Ensure theme is applied consistently
  const { mode, toggleMode } = useUserTheme();

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
      const responseUser = response.user;
      const userData = {
        id: responseUser.id || responseUser.user_id || '',
        email: responseUser.email || '',
        name: responseUser.name || '',
        role: responseUser.role || 'reader',
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
      // Log error for debugging (only in dev mode)
      if (import.meta.env.DEV) {
        console.error('Login error:', err);
      }
      
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string }; status?: number } };
        // Only show user-friendly error messages
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'Tài khoản đã bị vô hiệu hóa';
        }
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      mode === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50'
    }`}>
      {/* Theme Toggle Button */}
      <ThemeToggle mode={mode} onToggle={toggleMode} />
      
      {/* Left Panel Component */}
      <LeftPanel />

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className={`max-w-md w-full p-6 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn ${
          mode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <h2 className={`text-2xl md:text-3xl font-semibold mb-2 animate-slideDown ${
            mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Chào mừng trở lại với LibAI
          </h2>
          <p className={`mb-6 animate-slideDown ${
            mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} style={{ animationDelay: '0.1s' }}>
            Hệ thống quản lý thư viện thông minh giúp bạn tìm kiếm và quản lý tài liệu dễ dàng.
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className={`px-4 py-3 rounded-lg border text-sm ${
                mode === 'dark' 
                  ? 'bg-red-900/20 border-red-800 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                {error}
              </div>
            )}

            {/* Email/Username Input */}
            <InputField
              id="username"
              type="text"
              label="Email"
              placeholder="example@gmail.com"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
              mode={mode}
            />

            {/* Password Input */}
            <div>
              <PasswordInput
                id="password"
                label="Mật khẩu"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                mode={mode}
              />
              <div className="text-right mt-2">
                <a href="#" className={`text-sm hover:underline ${
                  mode === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                disabled={isLoading}
                className="w-4 h-4 rounded text-purple-600"
              />
              <label htmlFor="remember" className={`text-sm ${
                mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ghi nhớ thông tin đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] text-white font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Log in'}
            </button>

            {/* Social Login Buttons */}
            <SocialButtons mode={mode} />

            {/* Sign Up Link */}
            <p className={`text-center text-sm mt-6 ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Chưa có tài khoản?{' '}
              <Link to="/signup" className={`hover:underline ${
                mode === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

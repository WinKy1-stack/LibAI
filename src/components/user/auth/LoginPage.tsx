import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../../services/authService';
import type { LoginData } from '../../../types/auth';
import '../../user/color.css';
import '../../../index.css';

export default function LoginPage() {
  // Get theme from localStorage and sync to document
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme');
    const theme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

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

      // Map dữ liệu từ API vào User interface
      // Sử dụng type assertion để xử lý các field có thể không tồn tại
      const responseUser = response.user as any;
      const userData = {
        id: responseUser.id || responseUser.user_id || '',
        username: responseUser.username || formData.username,
        email: responseUser.email || '',
        full_name: responseUser.full_name || responseUser.name || '',
        name: responseUser.name || responseUser.full_name || '',
        role: responseUser.role || 'reader',
        student_id: responseUser.student_id,
        major: responseUser.major,
        status: responseUser.status,
        created_at: responseUser.created_at,
        last_login: responseUser.last_login,
      };

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
    <div className="flex min-h-screen bg-black relative" style={{ maxHeight: '100vh', overflow: 'hidden', display: 'flex' }}>
      {/* Home link (top-left) */}
      <Link to="/" className="absolute top-6 left-10 z-50 inline-flex items-center gap-2 no-underline transition">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/40 flex items-center justify-center">
          <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          </svg>
        </div>
        <span className="text-lg font-bold text-white">LibAI</span>
      </Link>

      {/* Left panel */}
      <div className="flex-1 auth-left-gradient relative overflow-hidden flex flex-col items-center justify-center p-10 text-center" style={{ flex: '1 1 0' }}>
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)"/>
          <path d="M0,70 Q30,50 60,70 T100,70 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)"/>
        </svg>
        <div className="auth-left-decor">
          <div className="bubble b1" />
          <div className="bubble b2" />
          <div className="bubble b3" />
        </div>

        <div className="text-center relative z-10" style={{ width: '100%' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: '40px', height: '40px' }} fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <h2 className="text-[34px] font-bold text-white leading-tight mb-3" style={{ textAlign: 'center' }}>
            Khám phá tri thức<br/>cùng LibAI
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '380px',
            margin: '0 auto 24px',
            textAlign: 'center'
          }}>
            Trợ lý ảo thông minh giúp bạn tìm kiếm và quản lý tài liệu thư viện một cách dễ dàng
          </p>
          <div className="flex justify-center gap-2" style={{ marginTop: '32px' }}>
            <div className="w-12 h-1.5 bg-white rounded-full" />
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 auth-right-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 0' }}>
        <div className="auth-form-shell" style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
          <h1 className="auth-title" style={{ marginBottom: 8 }}>Đăng nhập</h1>
          <p className="auth-subtitle">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-purple-500 font-semibold">Đăng ký ngay</Link>
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
              className="auth-input"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="auth-input auth-input-with-icon"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 text-sm">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className="auth-divider" style={{ margin: '12px 0' }}><span>Hoặc đăng nhập với</span></div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="auth-social-btn"
              >
                <span>G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="auth-social-btn"
              >
                <span>🍎</span>
                <span>Apple</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

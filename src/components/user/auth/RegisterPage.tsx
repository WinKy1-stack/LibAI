import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../../services/authService';
import type { RegisterData } from '../../../types/auth';
import '../../user/color.css';
import '../../../index.css';
import { useUserTheme } from '../../../hooks/useUserTheme';

export default function RegisterPage() {
  // Ensure theme is applied consistently
  useUserTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Vui lòng đồng ý với Điều khoản & Điều kiện');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });

      // Đăng ký thành công, chuyển đến trang đăng nhập
      navigate('/login', { 
        state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } 
      });
    } catch (err: unknown) {
      console.error('Register error:', err);
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
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
    <div className="relative flex min-h-screen max-h-screen overflow-hidden bg-black">
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
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-10 text-center auth-left-gradient">
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)"/>
          <path d="M0,70 Q30,50 60,70 T100,70 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)"/>
        </svg>
        <div className="auth-left-decor">
          <div className="bubble b1" />
          <div className="bubble b2" />
          <div className="bubble b3" />
        </div>

        <div className="text-center relative z-10 w-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-linear-to-br from-pink-500 to-purple-600 shadow-[0_4px_12px_rgba(236,72,153,0.4)] flex items-center justify-center">
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
          <div className="flex justify-center gap-2 mt-12">
            <div className="w-12 h-1.5 bg-white rounded-full" />
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center auth-right-panel">
        <div className="auth-form-shell w-full max-w-[420px] px-5">
          <h1 className="auth-title mb-2">Tạo tài khoản</h1>
          <p className="auth-subtitle">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-purple-500 font-semibold">Đăng nhập</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Họ và tên"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              disabled={isLoading}
              className="auth-input"
            />

            <input
              type="text"
              placeholder="Mã sinh viên"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
              className="auth-input"
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="auth-input auth-input-with-icon"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="auth-password-toggle"
              >
                {showConfirm ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-gray-400 text-sm">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 cursor-pointer"
              />
              <span>
                Tôi đồng ý với{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Điều khoản & Điều kiện
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>

            <div className="auth-divider my-3"><span>Hoặc đăng ký với</span></div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="auth-social-btn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="auth-social-btn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.99-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.23 2.72M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

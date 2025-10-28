import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../../services/authService';
import type { RegisterData } from '../../../types/auth';
import '../../user/color.css';
import '../../../index.css';

export default function RegisterPage() {
  // Get theme from localStorage and sync to document
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme');
    const theme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
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
          <h1 className="auth-title" style={{ marginBottom: 8 }}>Tạo tài khoản</h1>
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

            <div className="auth-divider" style={{ margin: '12px 0' }}><span>Hoặc đăng ký với</span></div>

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

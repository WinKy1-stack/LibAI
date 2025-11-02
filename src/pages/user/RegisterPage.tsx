import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { RegisterData } from '../../types/auth';
import '../../index.css';
import { useUserTheme } from '../../hooks/useUserTheme';
import { InputField, PasswordInput, LeftPanel, SocialButtons, ThemeToggle } from '../../components/user/auth';

export default function RegisterPage() {
  // Ensure theme is applied consistently
  const { mode, toggleMode } = useUserTheme();

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
    <div className={`flex min-h-screen transition-colors duration-300 ${
      mode === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50'
    }`}>
      {/* Theme Toggle Button */}
      <ThemeToggle mode={mode} onToggle={toggleMode} />
      
      {/* Left Panel Component */}
      <LeftPanel />

      {/* Right Panel - Register Form */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className={`max-w-md w-full p-6 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn ${
          mode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <h2 className={`text-2xl md:text-3xl font-semibold mb-2 animate-slideDown ${
            mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Tạo tài khoản LibAI
          </h2>
          <p className={`mb-6 animate-slideDown ${
            mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} style={{ animationDelay: '0.1s' }}>
            Bắt đầu hành trình khám phá tri thức cùng chúng tôi.
          </p>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Full Name Input */}
            <InputField
              id="fullname"
              type="text"
              label="Full Name"
              placeholder="Nguyen Van A"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              disabled={isLoading}
              mode={mode}
            />

            {/* Username Input */}
            <InputField
              id="username"
              type="text"
              label="Mã số sinh viên"
              placeholder="SV001234"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
              mode={mode}
            />

            {/* Email Input */}
            <InputField
              id="email"
              type="email"
              label="Email"
              placeholder="student@nttu.edu.vn"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              mode={mode}
            />

            {/* Password Input */}
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

            {/* Confirm Password Input */}
            <PasswordInput
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              mode={mode}
            />

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 mt-0.5 rounded text-purple-600"
              />
              <label htmlFor="terms" className={`text-sm ${
                mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tôi đồng ý với{' '}
                <a href="#" className={`hover:underline ${
                  mode === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Điều khoản & Điều kiện
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] text-white font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>

            {/* Social Login Buttons */}
            <SocialButtons mode={mode} />

            {/* Login Link */}
            <p className={`text-center text-sm mt-6 ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Đã có tài khoản?{' '}
              <Link to="/login" className={`hover:underline ${
                mode === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

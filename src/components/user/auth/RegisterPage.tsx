import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../../services/authService';
import type { RegisterData } from '../../../types/auth';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
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
        const axiosError = err as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#0a0a0a",
      position: "relative",
    }}>
      {/* Logo in top left corner */}
      <Link to="/" style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        zIndex: 100,
        transition: "all 0.2s ease",
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
          boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg style={{ width: 24, height: 24 }} fill="white" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          </svg>
        </div>
        <span style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#fff",
        }}>
          LibAI
        </span>
      </Link>

      {/* Left Panel - Visual */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #a78bfa 0%, #f9a8d4 40%, #93c5fd 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 48,
      }}>
        {/* Decorative Pattern */}
        <svg style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
        }} viewBox="0 0 100 100">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)"/>
          <path d="M0,70 Q30,50 60,70 T100,70 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)"/>
        </svg>

        <div style={{ height: 48 }}></div>

        <div style={{
          textAlign: "center",
          zIndex: 10,
        }}>
          <div style={{
            width: 80,
            height: 80,
            margin: "0 auto 32px",
            borderRadius: 20,
            background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
            boxShadow: "0 8px 32px rgba(236, 72, 153, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg style={{ width: 48, height: 48 }} fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.2,
          }}>
            Khám phá tri thức<br />cùng LibAI
          </h2>
          <p style={{
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.8)",
            maxWidth: 400,
            margin: "0 auto 32px",
          }}>
            Trợ lý ảo thông minh giúp bạn tìm kiếm và quản lý tài liệu thư viện một cách dễ dàng
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}>
            <div style={{ width: 48, height: 6, background: "#fff", borderRadius: 999 }}></div>
            <div style={{ width: 48, height: 6, background: "rgba(255, 255, 255, 0.3)", borderRadius: 999 }}></div>
            <div style={{ width: 48, height: 6, background: "rgba(255, 255, 255, 0.3)", borderRadius: 999 }}></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: 1,
        background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
          }}>
            Tạo tài khoản
          </h1>
          
          <p style={{
            fontSize: 16,
            color: "#9ca3af",
            marginBottom: 32,
          }}>
            Đã có tài khoản?{' '}
            <Link 
              to="/login"
              style={{
                color: "#a855f7",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Đăng nhập
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Error Message */}
            {error && (
              <div style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {/* Full Name */}
            <input
              type="text"
              placeholder="Họ và tên"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              disabled={isLoading}
              style={{
                padding: "14px 16px",
                fontSize: 15,
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#9333ea";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147, 51, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            {/* Username */}
            <input
              type="text"
              placeholder="Mã sinh viên"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
              style={{
                padding: "14px 16px",
                fontSize: 15,
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#9333ea";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147, 51, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              style={{
                padding: "14px 16px",
                fontSize: 15,
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#9333ea";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147, 51, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            {/* Password */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  fontSize: 15,
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#9333ea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147, 51, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <EyeSlashIcon style={{ width: 20, height: 20 }} />
                ) : (
                  <EyeIcon style={{ width: 20, height: 20 }} />
                )}
              </button>
            </div>

            {/* Terms Checkbox */}
            <label style={{
              display: "flex",
              alignItems: "start",
              gap: 8,
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 14,
            }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  marginTop: 2,
                  cursor: "pointer",
                }}
              />
              <span>
                Tôi đồng ý với{' '}
                <a href="#" style={{ color: "#a855f7", textDecoration: "none" }}>
                  Điều khoản & Điều kiện
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "14px 24px",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                border: "none",
                background: isLoading 
                  ? "rgba(147, 51, 234, 0.5)" 
                  : "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
                color: "#fff",
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(147, 51, 234, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(147, 51, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(147, 51, 234, 0.4)";
                }
              }}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>

            {/* Divider */}
            <div style={{
              position: "relative",
              textAlign: "center",
              margin: "16px 0",
            }}>
              <div style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1,
                background: "rgba(255, 255, 255, 0.1)",
              }}></div>
              <span style={{
                position: "relative",
                background: "#1a1a1a",
                padding: "0 16px",
                color: "#9ca3af",
                fontSize: 14,
              }}>
                Hoặc đăng ký với
              </span>
            </div>

            {/* Social Login */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
              >
                <span>G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
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

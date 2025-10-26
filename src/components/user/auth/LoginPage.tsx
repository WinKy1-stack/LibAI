import { useState } from 'react';
import { Form, Input, Button, Typography, message, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import type { LoginData } from '../../../types/auth';

const { Title, Text } = Typography;

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Handle login submission
  const onFinish = async (values: LoginData) => {
    setLoading(true);
    setError(''); // Clear previous error
    try {
      const response = await authService.login(values);
      message.success('Đăng nhập thành công!');

      // Lưu thông tin user và token
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Điều hướng theo role
      if (response.user.role === 'admin' || response.user.role === 'librarian') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/home');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number } };
      let errorMessage = 'Đã xảy ra lỗi, vui lòng thử lại';
      
      // Xử lý lỗi chi tiết
      if (err.response?.status === 401) {
        errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
      } else if (err.response?.status === 403) {
        errorMessage = 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#1b133f',
        color: '#ffffff',
      }}
    >
      {/* Left visual panel */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(180deg, rgba(57,39,95,1) 0%, rgba(27,19,63,1) 100%)',
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600 }}>LibAI</div>
        <div style={{ marginTop: 'auto', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 28, lineHeight: 1.4, color: '#ffffff' }}>
            Capturing Moments,
            <br />
            Creating Memories
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span
            style={{
              width: 30,
              height: 4,
              backgroundColor: '#4a3b82',
              borderRadius: 4,
            }}
          ></span>
          <span
            style={{
              width: 30,
              height: 4,
              backgroundColor: '#4a3b82',
              borderRadius: 4,
            }}
          ></span>
          <span
            style={{
              width: 30,
              height: 4,
              backgroundColor: '#764ba2',
              borderRadius: 4,
            }}
          ></span>
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#241a47',
          borderTopRightRadius: '16px',
          borderBottomRightRadius: '16px',
        }}
      >
        <div style={{ maxWidth: 450, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <Title level={2} style={{ color: '#ffffff', marginBottom: 8 }}>
              Đăng nhập
            </Title>
            <Text style={{ color: '#b5b3cd' }}>
              Chào mừng bạn quay trở lại!
            </Text>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Đăng nhập thất bại"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{
                marginBottom: 24,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderColor: 'rgba(244, 67, 54, 0.3)',
              }}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="username"
              label={<span style={{ color: '#ffffff' }}>Tên đăng nhập hoặc Email</span>}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên đăng nhập hoặc email!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#b5b3cd' }} />}
                placeholder="Tên đăng nhập hoặc email"
                style={{
                  backgroundColor: '#32275e',
                  borderColor: '#43356c',
                  color: '#ffffff',
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: '#ffffff' }}>Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#b5b3cd' }} />}
                placeholder="Mật khẩu"
                style={{
                  backgroundColor: '#32275e',
                  borderColor: '#43356c',
                  color: '#ffffff',
                }}
              />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: '#ffffff' }}>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link
                  to="/forgot-password"
                  style={{ color: '#b5b3cd', textDecoration: 'underline' }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  backgroundColor: '#764ba2',
                  borderColor: '#764ba2',
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            {/* Divider */}
            <div style={{ 
              textAlign: 'center', 
              margin: '20px 0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#43356c'
              }}></div>
              <span style={{
                position: 'relative',
                padding: '0 16px',
                backgroundColor: '#241a47',
                color: '#b5b3cd',
                fontSize: 13
              }}>
                hoặc
              </span>
            </div>

            {/* Button chuyển đăng ký */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button
                  block
                  size="large"
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    borderColor: '#764ba2',
                    color: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(118, 75, 162, 0.1)';
                    e.currentTarget.style.color = '#9d7bd4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  Chưa có tài khoản? Đăng ký ngay
                </Button>
              </Link>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
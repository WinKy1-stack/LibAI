import { useState } from 'react';
import { Form, Input, Button, Typography, message, Checkbox, Row, Col } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import type { RegisterData } from '../../../types/auth';

const { Title, Text } = Typography;

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterData) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      message.success(response.message || 'Đăng ký thành công!');
      navigate('/login');
    } catch (error: unknown) {
      const fallback = 'Đăng ký thất bại';
      let errMsg = fallback;
      if (typeof error === 'object' && error !== null) {
        const e = error as {
          message?: string;
          response?: { data?: { error?: string } };
        };
        errMsg = e.response?.data?.error || e.message || fallback;
      } else if (typeof error === 'string') {
        errMsg = error;
      }
      message.error(errMsg);
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
      {/* Left panel with branding and tagline */}
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

      {/* Right panel with registration form */}
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
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 32 }}>
            <Title level={2} style={{ color: '#ffffff', marginBottom: 8 }}>
              Đăng ký tài khoản
            </Title>
            <Text style={{ color: '#b5b3cd' }}>
              Tạo tài khoản mới để sử dụng thư viện
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            {/* Row 1: Tên đăng nhập và Email */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label={<span style={{ color: '#ffffff' }}>Tên đăng nhập</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
                    { max: 20, message: 'Tên đăng nhập không được vượt quá 20 ký tự' },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: 'Chỉ được chứa chữ, số và dấu gạch dưới',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#b5b3cd' }} />}
                    placeholder="Tên đăng nhập"
                    style={{
                      backgroundColor: '#32275e',
                      borderColor: '#43356c',
                      color: '#ffffff',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={<span style={{ color: '#ffffff' }}>Email</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#b5b3cd' }} />}
                    placeholder="Email của bạn"
                    style={{
                      backgroundColor: '#32275e',
                      borderColor: '#43356c',
                      color: '#ffffff',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 2: Họ tên và Số điện thoại */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label={<span style={{ color: '#ffffff' }}>Họ và tên</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#b5b3cd' }} />}
                    placeholder="Họ và tên đầy đủ"
                    style={{
                      backgroundColor: '#32275e',
                      borderColor: '#43356c',
                      color: '#ffffff',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label={<span style={{ color: '#ffffff' }}>Số điện thoại</span>}>
                  <Input
                    prefix={<PhoneOutlined style={{ color: '#b5b3cd' }} />}
                    placeholder="Số điện thoại (tùy chọn)"
                    style={{
                      backgroundColor: '#32275e',
                      borderColor: '#43356c',
                      color: '#ffffff',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 3: Mật khẩu và Xác nhận mật khẩu */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label={<span style={{ color: '#ffffff' }}>Mật khẩu</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
                    },
                  ]}
                  hasFeedback
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
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirm_password"
                  label={<span style={{ color: '#ffffff' }}>Xác nhận mật khẩu</span>}
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#b5b3cd' }} />}
                    placeholder="Nhập lại mật khẩu"
                    style={{
                      backgroundColor: '#32275e',
                      borderColor: '#43356c',
                      color: '#ffffff',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Agreement checkbox */}
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error('Bạn phải chấp nhận điều khoản & điều kiện')), 
                },
              ]}
            >
              <Checkbox style={{ color: '#ffffff' }}>
                Tôi đồng ý với{' '}
                <a href="#" style={{ color: '#9d7bd4' }}>
                  Điều khoản & Điều kiện
                </a>
              </Checkbox>
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
                Đăng ký
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

            {/* Button chuyển đăng nhập */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
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
                  Đã có tài khoản? Đăng nhập ngay
                </Button>
              </Link>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
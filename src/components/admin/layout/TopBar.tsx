import { useMemo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Button, Input, Badge, Row, Col, Switch, Space, Avatar, Typography, Dropdown, Grid, App as AntdApp, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { authService } from '../../../services/authService';
import type { User } from '../../../types/auth';

const { useBreakpoint } = Grid;
const { Text } = Typography;
const { useToken } = theme;

interface TopBarProps {
  collapsed: boolean;
  onToggle: () => void;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  user?: User | null;
}

// userMenuItems - sẽ được tạo động trong component để có thể navigate
const createUserMenuItems = (navigate: (path: string) => void, handleLogout: () => void): MenuProps['items'] => [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Hồ sơ',
    onClick: () => navigate('/admin/librarian'),
  },
  { type: 'divider' },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Đăng xuất',
    danger: true,
    onClick: handleLogout,
  },
];

export default function TopBar({ collapsed, onToggle, mode, setMode, user }: TopBarProps) {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { token } = useToken();
  const { notification } = AntdApp.useApp();

  // Logout handler - wrapped in useCallback
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      notification.success({
        message: 'Đăng xuất thành công!',
        placement: 'topRight',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate, notification]);

  // Logic responsive cho các kích thước màn hình
  const isMobile = !screens.md; // < 768px
  const isSmallTablet = screens.md && !screens.lg; // 768px - 992px
  const showUserInfo = !!screens.lg; // >= 992px

  // Tạo menu items với navigate function
  const userMenuItems = useMemo(() => createUserMenuItems(navigate, handleLogout), [navigate, handleLogout]);

  // Dùng useMemo để cache style object, sử dụng Ant Design tokens
  const inputStyle = useMemo(() => ({
    borderRadius: 999,
    maxWidth: isMobile ? 200 : isSmallTablet ? 250 : 400,
    background: token.colorBgContainer,
    color: token.colorText,
    border: `1px solid ${token.colorBorder}`,
  } as CSSProperties), [token, isMobile, isSmallTablet]);

  const headerStyle = useMemo(() => ({
    padding: '0 16px',
    position: 'fixed' as const,
    top: 0,
    left: screens.md ? 80 : 0,
    right: 0,
    zIndex: 100,
    background: token.colorBgContainer,
    backdropFilter: 'saturate(1.2) blur(6px)',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: token.boxShadowTertiary,
  } as CSSProperties), [token, screens.md]);

  return (
    <header style={headerStyle}>
      <Row align="middle" justify="space-between" style={{ width: '100%' }} gutter={isMobile ? 8 : 12}>
        {/* Left Section: Logo and Toggle */}
        <Col flex="none">
          <Space align="center" size={isMobile ? 4 : 8}>
            <Button
              aria-label="toggle menu"
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onToggle}
            />
            {/* Ẩn Dashboard text trên mobile */}
            {!isMobile && <Text strong style={{ fontSize: 14 }}>Dashboard</Text>}
          </Space>
        </Col>

        {/* Middle Section: Centered Search - Hidden on mobile */}
        {!isMobile && (
          <Col flex="auto" style={{ display: 'flex', justifyContent: 'center' }}>
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder={isSmallTablet ? "Tìm..." : "Tìm kiếm..."}
              style={inputStyle}
            />
          </Col>
        )}

        {/* Right Section: Notification, Switch, User Info */}
        <Col flex="none">
          {/* Tăng/giảm khoảng cách các icon tùy màn hình */}
          <Space size={showUserInfo ? 32 : 24} align="center">
            {/* Logic hiện Badge: màn lớn hiện số, màn nhỏ/tablet hiện dot */}
            <Badge count={showUserInfo ? 12 : 0} dot={!showUserInfo} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            {/* Dark mode switch */}
            <Switch
              checkedChildren={isMobile ? undefined : <SunOutlined />}
              unCheckedChildren={isMobile ? undefined : <MoonOutlined />}
              checked={mode === 'light'}
              onChange={(v) => setMode(v ? 'light' : 'dark')}
              size={isMobile ? 'small' : 'default'}
            />

            {/* User dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space align="center" size={showUserInfo ? 12 : 0} style={{ cursor: 'pointer' }}>
                {/* User info text - Chỉ hiện từ 992px trở lên */}
                {showUserInfo && user && (
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <Text strong style={{ color: token.colorText, fontSize: 14 }}>
                      {user.name || 'User'}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {user.role === 'admin' ? 'Quản trị viên' : user.role === 'librarian' ? 'Thủ thư' : 'Người dùng'}
                    </Text>
                  </div>
                )}

                {/* Avatar - Responsive size */}
                <Avatar
                  size={isMobile ? 32 : isSmallTablet ? 34 : 40}
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.email || 'user'}`}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </header>
  );
}


import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Button, Input, Badge, Row, Col, Switch, Space, Avatar, Typography, Dropdown, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface TopBarProps {
  collapsed: boolean;
  onToggle: () => void;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
}

// userMenuItems là hằng số, để ngoài component để tránh render lại
const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Profile',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
  { type: 'divider' },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    danger: true,
  },
];

export default function TopBar({ collapsed, onToggle, mode, setMode }: TopBarProps) {
  const screens = useBreakpoint();

  // Logic responsive cho các kích thước màn hình
  const isMobile = !screens.md; // < 768px
  const isSmallTablet = screens.md && !screens.lg; // 768px - 992px
  const showUserInfo = !!screens.lg; // >= 992px

  // Dùng useMemo để cache style object, chỉ tính toán lại khi dependencies thay đổi
  const inputStyle = useMemo(() => ({
    borderRadius: 999,
    maxWidth: isMobile ? 200 : isSmallTablet ? 250 : 400,
    background: mode === 'dark' ? '#1f1f1f' : '#f7f7f7',
    color: mode === 'dark' ? '#fff' : '#000',
    border: mode === 'dark' ? '1px solid #434343' : '1px solid #d9d9d9',
  } as CSSProperties), [mode, isMobile, isSmallTablet]);

  const headerStyle = useMemo(() => ({
    padding: '0 16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: mode === 'dark' ? 'rgba(0, 21, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'saturate(1.2) blur(6px)',
    borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0',
    height: 64,
    display: 'flex',
    alignItems: 'center',
  } as CSSProperties), [mode]);

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
              prefix={<SearchOutlined style={{ color: mode === 'dark' ? '#aaa' : undefined }} />}
              placeholder={isSmallTablet ? "Tìm..." : "Tìm kiếm..."}
              style={inputStyle}
            />
          </Col>
        )}

        {/* Right Section: Notification, Switch, User Info */}
        <Col flex="none">
          {/* Tăng/giảm khoảng cách các icon tùy màn hình */}
          <Space size={showUserInfo ? 16 : 8} align="center">
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
                {showUserInfo && (
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <Text strong style={{ color: mode === 'dark' ? '#fff' : '#000', fontSize: 14 }}>
                      La Thanh Toàn
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Thủ Thư đẹp trai
                    </Text>
                  </div>
                )}

                {/* Avatar - Responsive size */}
                <Avatar
                  size={isMobile ? 32 : isSmallTablet ? 34 : 40}
                  icon={<UserOutlined />}
                  src="https://images-ext-1.discordapp.net/external/YgsUjW8zZkTOwywiLBV9ZNyntjC2SUDbt3N7_WH0ijA/https/lh3.googleusercontent.com/pw/AP1GczOxJur9COUK_irJFEBCrMcfGqg_Bds-0B02bbBv55ZJyOpY1eP4RwuXgDlSN6NRiJR_k1BS2Z6ph1pVIZJF9utI1frbOKamY75lGDJT-0L3EFyb6c-ovGbGVBxznEAxukuba7euzaLObdTk2C9aDrG0qQ?format=webp"
                />
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </header>
  );
}


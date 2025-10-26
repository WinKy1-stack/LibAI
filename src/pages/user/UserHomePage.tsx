import { Typography, Card, Row, Col, Button } from 'antd';
import { BookOutlined, SearchOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function UserHomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        padding: '24px', 
        marginBottom: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Chào mừng, {user.fullName || user.username}!
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              Email: {user.email} | Role: {user.role}
            </Paragraph>
          </div>
          <Button type="primary" danger onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Title level={3} style={{ marginBottom: '16px' }}>Chức năng nhanh</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
            onClick={() => navigate('/user/search')}
          >
            <SearchOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <Title level={4} style={{ marginTop: '16px' }}>Tìm sách</Title>
            <Paragraph>Tìm kiếm sách trong thư viện</Paragraph>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
            onClick={() => navigate('/user/borrowed')}
          >
            <BookOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            <Title level={4} style={{ marginTop: '16px' }}>Sách đang mượn</Title>
            <Paragraph>Xem danh sách sách đã mượn</Paragraph>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
            onClick={() => navigate('/user/history')}
          >
            <HistoryOutlined style={{ fontSize: '48px', color: '#faad14' }} />
            <Title level={4} style={{ marginTop: '16px' }}>Lịch sử</Title>
            <Paragraph>Xem lịch sử mượn/trả sách</Paragraph>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
            onClick={() => navigate('/user/profile')}
          >
            <UserOutlined style={{ fontSize: '48px', color: '#722ed1' }} />
            <Title level={4} style={{ marginTop: '16px' }}>Hồ sơ</Title>
            <Paragraph>Quản lý thông tin cá nhân</Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Stats */}
      <Title level={3} style={{ marginTop: '32px', marginBottom: '16px' }}>
        Thống kê của bạn
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>0</Title>
              <Paragraph style={{ margin: '8px 0 0 0' }}>Sách đang mượn</Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>0</Title>
              <Paragraph style={{ margin: '8px 0 0 0' }}>Tổng sách đã mượn</Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#faad14', margin: 0 }}>0</Title>
              <Paragraph style={{ margin: '8px 0 0 0' }}>Sách quá hạn</Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

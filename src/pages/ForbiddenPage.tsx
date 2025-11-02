import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const user = authService.getStoredUser();

  const handleGoBack = () => {
    if (user?.role === 'admin' || user?.role === 'librarian') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/home');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: 24
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={handleGoBack}>
            Quay lại trang chủ
          </Button>
        }
      />
    </div>
  );
}

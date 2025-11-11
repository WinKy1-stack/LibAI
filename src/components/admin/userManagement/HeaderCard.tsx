import { Button, Card, Col, Row, Space, Typography } from "antd";
import {
  DownloadOutlined,
  FilterOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface HeaderCardProps {
  isMobile: boolean;
  onAddUser?: () => void;
}

export function HeaderCard({ isMobile, onAddUser }: HeaderCardProps) {
  return (
    <Card
      style={{ background: "transparent", boxShadow: "none" }}
      variant="borderless"
      styles={{ 
        body: { 
          padding: isMobile ? 16 : 20,
        },
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, fontSize: isMobile ? 24 : 32 }}>
              Quản lý người dùng
            </Title>
            <Text type="secondary">
              Theo dõi hoạt động, thống kê hiệu suất và quản trị vòng đời người dùng.
            </Text>
          </Space>
        </Col>
        <Col
          xs={24}
          md={12} 
          style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end" }}
        >
          <Space wrap>
            <Button icon={<FilterOutlined />} size={isMobile ? "middle" : "large"}>
              Bộ lọc nâng cao
            </Button>
            <Button icon={<DownloadOutlined />} size={isMobile ? "middle" : "large"}>
              Xuất báo cáo
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ borderRadius: 10 }}
              onClick={onAddUser}
            >
              Thêm người dùng
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

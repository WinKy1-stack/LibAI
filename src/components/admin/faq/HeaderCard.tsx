import { Button, Card, Col, Row, Space, Typography } from "antd";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface HeaderCardProps {
  isMobile: boolean;
  onAddFaq: () => void;
}

export function HeaderCard({ isMobile, onAddFaq }: HeaderCardProps) {
  return (
    <Card
      style={{ background: "transparent", boxShadow: "none" }}
      variant="borderless"
      styles={{ body: { padding: isMobile ? 16 : 20 } }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, fontSize: isMobile ? 24 : 32 }}>
              Quản lý FAQ
            </Title>
            <Text type="secondary">Quản lý câu hỏi thường gặp và hỗ trợ người dùng tìm thông tin nhanh chóng.</Text>
          </Space>
        </Col>
        <Col
          xs={24}
          md={12}
          style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end" }}
        >
          <Space wrap>
            <Button icon={<DownloadOutlined />} size={isMobile ? "middle" : "large"}>
              Xuất báo cáo
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ borderRadius: 10 }}
              onClick={onAddFaq}
            >
              Thêm câu hỏi
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}


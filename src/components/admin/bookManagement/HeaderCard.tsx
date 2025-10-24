import { Button, Card, Col, Row, Space, Typography } from "antd";
import { DownloadOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface HeaderCardProps {
  isMobile: boolean;
}

export function HeaderCard({ isMobile }: HeaderCardProps) {
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
              Quản lý sách
            </Title>
            <Text type="secondary">Kiểm soát kho sách, lượt mượn và tình trạng tồn kho theo thời gian thực.</Text>
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
              icon={<PlusOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ borderRadius: 10 }}
            >
              Thêm đầu sách
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

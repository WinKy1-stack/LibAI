import { Card, Button, Space, Typography, Row, Col, Grid } from "antd";
import {
  FilterOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export const HeaderCard = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      variant="borderless"
      style={{
        background: "transparent",
        boxShadow: "none",
      }}
      styles={{
        body: {
          padding: isMobile ? 16 : 20,
        },
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12}>
          <Space direction="vertical" size={4}>
            <Title
              level={3}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: isMobile ? 24 : 32,
              }}
            >
              Quản lý sách mượn
            </Title>
            <Text type="secondary">
              Theo dõi hoạt động mượn trả, quản lý quá hạn và thống kê xu hướng.
            </Text>
          </Space>
        </Col>
        <Col
          xs={24}
          md={12}
          style={{
            display: "flex",
            justifyContent: isMobile ? "flex-start" : "flex-end",
          }}
        >
          <Space wrap>
            <Button
              icon={<FilterOutlined />}
              size={isMobile ? "middle" : "large"}
            >
              Bộ lọc nâng cao
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              size={isMobile ? "middle" : "large"}
            >
              Xuất báo cáo
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ borderRadius: 10 }}
            >
              Tạo phiếu mượn
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

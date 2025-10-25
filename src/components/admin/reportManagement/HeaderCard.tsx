import { Button, Card, Col, Row, Space, Typography } from "antd";
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, ScheduleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface HeaderCardProps {
  isMobile: boolean;
}

export function HeaderCard({ isMobile }: HeaderCardProps) {
  const handleExportPDF = () => {
    console.log("Export PDF");
    // Logic xuất PDF
  };

  const handleExportExcel = () => {
    console.log("Export Excel");
    // Logic xuất Excel
  };

  const handleScheduleReport = () => {
    console.log("Schedule Report");
    // Logic lên lịch báo cáo
  };

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
              Báo cáo & Thống kê
            </Title>
            <Text type="secondary">
              Xem và tải xuống các báo cáo chi tiết về hoạt động thư viện
            </Text>
          </Space>
        </Col>
        <Col
          xs={24}
          md={12}
          style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end" }}
        >
          <Space wrap>
            <Button 
              icon={<FilePdfOutlined />} 
              size={isMobile ? "middle" : "large"}
              onClick={handleExportPDF}
            >
              Xuất PDF
            </Button>
            <Button 
              icon={<FileExcelOutlined />} 
              size={isMobile ? "middle" : "large"}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button
              type="primary"
              icon={<ScheduleOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{ borderRadius: 10 }}
              onClick={handleScheduleReport}
            >
              Lên lịch báo cáo
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}


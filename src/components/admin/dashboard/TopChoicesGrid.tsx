import { Card, Row, Col, Space, Typography, Image, theme } from "antd";
import { topChoices } from "../../../data";

const { Text } = Typography;
const { useToken } = theme;

export default function TopChoicesGrid() {
  const { token } = useToken();

  return (
    <Card
      title={<Text strong style={{ fontSize: 24, fontWeight: 700 }}>Sách hàng đầu</Text>}
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Row gutter={[16, 16]}>
        {topChoices.map((b, i) => (
          <Col xs={12} sm={8} md={6} lg={4} key={i}>
            <Card
              hoverable
              styles={{ body: { padding: 12 } }}
              style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorder}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Image
                src={b.image}
                alt={b.title}
                preview={{
                  mask: "Xem ảnh",
                }}
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  borderRadius: 8,
                  objectFit: "cover",
                  boxShadow: token.boxShadow,
                  transition: "transform 0.3s ease",
                }}
              />
              <Space direction="vertical" size={4} style={{ marginTop: 12, width: "100%" }}>
                <Text 
                  strong 
                  ellipsis={{ tooltip: b.title }}
                  style={{ fontSize: 13 }}
                >
                  {b.title}
                </Text>
                <Text 
                  type="secondary" 
                  ellipsis={{ tooltip: b.author }}
                  style={{ fontSize: 12 }}
                >
                  {b.author}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

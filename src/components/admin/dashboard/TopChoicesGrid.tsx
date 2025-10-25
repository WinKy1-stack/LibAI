import { Card, Row, Col, Space, Typography, theme } from "antd";
import { topChoices } from "../../../data";

const { Text } = Typography;
const { useToken } = theme;

export default function TopChoicesGrid() {
  const { token } = useToken();

  return (
    <Card 
      title={<Text strong style={{ fontSize: 24, fontWeight: 700 }}>Sách hàng đầu</Text>}
      variant="borderless"
      style={{ borderRadius: 16 }}
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
              }}
            >
              <div style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <img 
                  src={b.image}
                  alt={b.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
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

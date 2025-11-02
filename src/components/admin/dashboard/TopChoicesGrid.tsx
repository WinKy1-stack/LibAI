import { Card, Row, Col, Space, Typography, Image, theme, Skeleton } from "antd";
import { topChoices } from "../../../data";
import { useState, useEffect } from "react";

const { Text } = Typography;
const { useToken } = theme;

export default function TopChoicesGrid() {
  const { token } = useToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

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
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Col xs={12} sm={8} md={6} lg={4} key={i}>
              <Card
                styles={{ body: { padding: 12 } }}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${token.colorBorder}`,
                }}
              >
                <Skeleton.Image
                  active
                  style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "3/4",
                    borderRadius: 8,
                  }}
                />
                <Space direction="vertical" size={4} style={{ marginTop: 12, width: "100%" }}>
                  <Skeleton.Input active size="small" style={{ width: "100%" }} />
                  <Skeleton.Input active size="small" style={{ width: "80%" }} />
                </Space>
              </Card>
            </Col>
          ))
        ) : (
          topChoices.map((b, i) => (
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
          ))
        )}
      </Row>
    </Card>
  );
}

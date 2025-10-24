import { Card, Row, Col, Space, Typography, theme } from "antd";

const { Text } = Typography;
const { useToken } = theme;

const topChoices = [
  { title: "The Critique of Pure Reason", author: "Immanuel Kant" , image: "https://m.media-amazon.com/images/I/91z55teNfbL._UF1000,1000_QL80_.jpg"},
  { title: "Stroller", author: "Amanda Parrish Morgan" , image: "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_568,c_scale,dpr_1.5/jackets/9781501386664.jpg"},
  { title: "The Design of Everyday Things", author: "Don Norman", image: "https://minh.la/wp-content/uploads/2020/06/Design-of-Everyday-Things.jpg.webp" },
  { title: "LEAN UX", author: "Jeff Gothelf", image: "https://m.media-amazon.com/images/I/81qJb1LmkBL.jpg" },
  { title: "The Republic", author: "Plato", image: "https://bookowlsbd.com/cdn/shop/files/TheRepublicBookbyPlato.jpg?v=1754895313" },
  { title: "Ancestor Trouble", author: "Maud Newton", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5i7sOhjLwQz9ZT_t_cgjCS0t_zROqx2aa1g&s" },
];

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

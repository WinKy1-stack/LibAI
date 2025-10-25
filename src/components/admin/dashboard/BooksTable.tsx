import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Typography, theme } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { dashboardBooks, type BookRecord } from "../../../data";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { useToken } = theme;

export default function BooksTable() {
  const { token } = useToken();
  const navigate = useNavigate();

  const columns: ColumnsType<BookRecord> = [
    { 
      title: "Book ID", 
      dataIndex: "bid", 
      width: 140,
      responsive: ["sm"],
    },
    { 
      title: "Title", 
      dataIndex: "title",
      ellipsis: true,
      render: (t: string) => <Text strong ellipsis={{ tooltip: t }}>{t}</Text>,
    },
    { 
      title: "Author", 
      dataIndex: "author", 
      responsive: ["md"],
      ellipsis: { showTitle: true },
    },
    {
      title: "Available",
      dataIndex: "stock",
      align: "center",
      width: 100,
      render: (n: number) => <Text strong>{n}</Text>,
    },
    { 
      title: "Action", 
      width: 80, 
      align: "center", 
      render: () => <Button type="text" icon={<MoreOutlined />} /> 
    },
  ];

  return (
    <Card 
      title={<Text strong style={{ fontSize: 24, fontWeight: 700 }}>Danh sách sách</Text>}
      extra={
        <Button 
          size="middle"
          style={{ borderRadius: 8 }}
        >
          Thêm sách
        </Button>
      } 
      variant="borderless"
      style={{ borderRadius: 16 }}
    >
      <Table
        size="middle"
        rowKey="key"
        dataSource={dashboardBooks}
        columns={columns}
        pagination={false}
        scroll={{ x: 560 }}
      />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button type="link" style={{ color: token.colorPrimary }} onClick={() => navigate('/admin/books')}>Xem thêm</Button>
      </div>
    </Card>
  );
}

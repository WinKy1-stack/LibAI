import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Typography, theme } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useDashboardBooks } from "../../../hooks/useAdminQueries";
import type { BookRecord } from "../../../data/mockDashboard";

const { Text } = Typography;
const { useToken } = theme;

export default function BooksTable() {
  const { token } = useToken();
  const navigate = useNavigate();
  const { data: books = [], isLoading } = useDashboardBooks();

  // Sort by title and get last 5 (or just use the 5 from API)
  const dashboardBooks: BookRecord[] = useMemo(() => {
    return books;
  }, [books]);

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
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Table
        size="middle"
        rowKey="bid"
        dataSource={dashboardBooks}
        columns={columns}
        loading={isLoading}
        pagination={false}
        scroll={{ x: 560 }}
      />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button type="link" style={{ color: token.colorPrimary }} onClick={() => navigate('/admin/books')}>Xem thêm</Button>
      </div>
    </Card>
  );
}

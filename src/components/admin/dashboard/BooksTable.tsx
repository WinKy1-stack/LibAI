import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Typography } from "antd";
import { MoreOutlined } from "@ant-design/icons";

const { Text } = Typography;

type BookRecord = {
  key: number;
  bid: string;
  title: string;
  author: string;
  stock: number;
};

const books: BookRecord[] = [
  { key: 1, bid: "#B-10021-30", title: "Ancestor Trouble", author: "Maud Newton", stock: 30 },
  { key: 2, bid: "#B-39521-31", title: "Life is Everywhere", author: "Lucy Ives", stock: 23 },
  { key: 3, bid: "#G-95501-51", title: "Stroller", author: "Amanda Parrish", stock: 90 },
  { key: 4, bid: "#R-773521-67", title: "The Secret Syllabus", author: "Burnham", stock: 6 },
];

export default function BooksTable() {
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
        dataSource={books}
        columns={columns}
        pagination={false}
        scroll={{ x: 560 }}
      />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button type="link" style={{ color: "var(--primary)" }}>See All</Button>
      </div>
    </Card>
  );
}

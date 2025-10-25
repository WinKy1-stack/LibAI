import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Typography, Image } from "antd";
import { bookIssuedData, type BookIssuedRecord } from "../../../data";

const { Text, Link } = Typography;

export default function BooksIssuedTable() {
  const columns: ColumnsType<BookIssuedRecord> = [
    {
      title: "User ID",
      dataIndex: "userId",
      width: 100,
      responsive: ["sm"],
    },
    {
      title: "Book",
      dataIndex: "bookTitle",
      render: (_: string, record: BookIssuedRecord) => (
        <Space size={12}>
          <Image
            src={record.bookCover}
            alt={record.bookTitle}
            width={50}
            height={70}
            style={{ 
              borderRadius: 8, 
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
            preview={false}
          />
          <div>
            <div>
              <Text strong style={{ fontSize: 14 }}>
                {record.bookTitle}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {record.author}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      width: 130,
      responsive: ["md"],
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      width: 130,
      responsive: ["md"],
    },
    {
      title: "Details",
      key: "details",
      width: 120,
      align: "center",
      render: () => (
        <Link style={{ color: "#ff4757", fontWeight: 500 }}>
          View Details
        </Link>
      ),
    },
  ];

  return (
    <Card
      title={
        <Text strong style={{ fontSize: 24, fontWeight: 700 }}>
          Sách đã mượn
        </Text>
      }
      extra={
        <Button
          size="middle"
          style={{
            borderRadius: 8,
            border: "1px solid #d9d9d9",
            fontWeight: 500,
          }}
        >
          Mượn sách
        </Button>
      }
      variant="borderless"
      style={{ 
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02)"
      }}
    >
      <Table
        size="middle"
        rowKey="key"
        dataSource={bookIssuedData}
        columns={columns}
        pagination={false}
        scroll={{ x: 600 }}
      />
    </Card>
  );
}


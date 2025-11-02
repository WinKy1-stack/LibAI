import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Typography, Image, theme } from "antd";
import { bookIssuedData, type BookIssuedRecord } from "../../../data";
import { useState, useEffect } from "react";

const { Text, Link } = Typography;

export default function BooksIssuedTable() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);
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
              boxShadow: token.boxShadowTertiary,
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
        <Link style={{ color: token.colorPrimary, fontWeight: 500 }}>
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
            border: `1px solid ${token.colorBorder}`,
            fontWeight: 500,
          }}
        >
          Mượn sách
        </Button>
      }
      variant="borderless"
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowTertiary,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Table
        size="middle"
        rowKey="key"
        dataSource={bookIssuedData}
        columns={columns}
        loading={{
          spinning: loading,
          indicator: <></>,
        }}
        pagination={false}
        scroll={{ x: 600 }}
      />
    </Card>
  );
}


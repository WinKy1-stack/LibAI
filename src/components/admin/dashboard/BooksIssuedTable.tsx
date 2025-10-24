import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Typography, Image } from "antd";

const { Text, Link } = Typography;

type BookIssuedRecord = {
  key: number;
  userId: string;
  bookCover: string;
  bookTitle: string;
  author: string;
  issueDate: string;
  returnDate: string;
};

const bookIssuedData: BookIssuedRecord[] = [
  {
    key: 1,
    userId: "10021",
    bookCover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1627096766i/58558175.jpg",
    bookTitle: "Ancestor Trouble",
    author: "Maud Newton",
    issueDate: "20 Dec, 2022",
    returnDate: "21 Dec, 2022",
  },
  {
    key: 2,
    userId: "12034",
    bookCover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUPLsGYHER1uwmPfcCejQBE-fOQ9rHe_chXA&s",
    bookTitle: "Life is Everywhere",
    author: "Lucy Ives",
    issueDate: "23 Dec, 2022",
    returnDate: "26 Dec, 2022",
  },
  {
    key: 3,
    userId: "22987",
    bookCover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1443812562i/6402775.jpg",
    bookTitle: "Stroller",
    author: "Amanda Parrish",
    issueDate: "23 Dec, 2022",
    returnDate: "28 Dec, 2022",
  },
  {
    key: 4,
    userId: "53272",
    bookCover: "https://images.booksense.com/images/404/224/9780691224404.jpg",
    bookTitle: "The Secret Syllabus",
    author: "Terence C. Burnham",
    issueDate: "31 Dec, 2022",
    returnDate: "3 Jan, 2023",
  },
  {
    key: 5,
    userId: "06787",
    bookCover: "https://assets.isu.pub/document-structure/240321203246-57949da22f7fc411000b78023af3891a/v1/47ba45a04af1aa43b238949805004625.jpeg",
    bookTitle: "A Brief History of Time",
    author: "Stephen Hawking",
    issueDate: "1 Jan, 2023",
    returnDate: "6 Jan, 2023",
  },
];

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


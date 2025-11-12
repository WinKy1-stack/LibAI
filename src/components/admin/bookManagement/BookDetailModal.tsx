import { Modal, Space, Avatar, Typography, Divider, Row, Col, Tag, Progress, Image } from "antd";
import { BookOutlined, UserOutlined, CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import type { AdminBook } from "../../../data";
import { formatLabels, statusLabels } from "./constants";
import { getStatusMeta, formatDate } from "./utils";

const { Text, Title } = Typography;

interface BookDetailModalProps {
  visible: boolean;
  book: AdminBook | null;
  onClose: () => void;
}

export function BookDetailModal({ visible, book, onClose }: BookDetailModalProps) {
  if (!book) return null;

  const statusMeta = getStatusMeta(book.status);
  const availabilityPercent =
    book.totalCopies === 0 ? 0 : Math.round((book.availableCopies / book.totalCopies) * 100);

  return (
    <Modal
      title={
        <Space>
          <Avatar
            src={book.cover}
            icon={<BookOutlined />}
            size={48}
            shape="square"
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {book.title}
            </Title>
            <Text type="secondary">{book.author}</Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* Book Cover & Basic Info */}
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 300,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOutlined style={{ fontSize: 64, color: "#999" }} />
              </div>
            )}
          </Col>
          <Col xs={24} sm={16}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Title level={5}>Thông tin chi tiết</Title>
                <Divider style={{ margin: "12px 0" }} />
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text>
                      <UserOutlined /> Tác giả:
                    </Text>
                    <Text strong>{book.author}</Text>
                  </Space>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text>
                      <CalendarOutlined /> Năm xuất bản:
                    </Text>
                    <Text strong>{book.publishedYear}</Text>
                  </Space>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text>
                      <FileTextOutlined /> ISBN:
                    </Text>
                    <Text strong>{book.isbn}</Text>
                  </Space>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text>Định dạng:</Text>
                    <Text strong>{formatLabels[book.format]}</Text>
                  </Space>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text>Chuyên mục:</Text>
                    <Text strong>{book.category}</Text>
                  </Space>
                </Space>
              </div>

              <div>
                <Title level={5}>Phân loại</Title>
                <Divider style={{ margin: "12px 0" }} />
                <Space wrap>
                  <Tag color="blue">{book.category}</Tag>
                  <Tag color="purple">{formatLabels[book.format]}</Tag>
                  <Tag color={statusMeta.color} icon={statusMeta.icon}>
                    {statusLabels[book.status]}
                  </Tag>
                  {book.tags?.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            </Space>
          </Col>
        </Row>

        {/* Inventory & Statistics */}
        <div>
          <Title level={5}>Tình trạng tồn kho</Title>
          <Divider style={{ margin: "12px 0" }} />
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Tổng số bản:</Text>
              <Text strong>{book.totalCopies} bản</Text>
            </Space>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Khả dụng:</Text>
              <Text strong style={{ color: "#52c41a" }}>
                {book.availableCopies} bản
              </Text>
            </Space>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Đang mượn:</Text>
              <Text strong style={{ color: "#1890ff" }}>
                {book.totalCopies - book.availableCopies} bản
              </Text>
            </Space>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Đặt chỗ:</Text>
              <Text strong style={{ color: "#faad14" }}>
                {book.reservedCount} yêu cầu
              </Text>
            </Space>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Quá hạn:</Text>
              <Text strong type={book.overdueCount > 0 ? "danger" : undefined}>
                {book.overdueCount} bản
              </Text>
            </Space>
            <div style={{ width: "100%" }}>
              <Text type="secondary">Tỷ lệ khả dụng:</Text>
              <Progress
                percent={availabilityPercent}
                size="small"
                status={availabilityPercent <= 20 ? "exception" : "active"}
              />
            </div>
          </Space>
        </div>

        {/* Borrowing Statistics */}
        <div>
          <Title level={5}>Thống kê mượn sách</Title>
          <Divider style={{ margin: "12px 0" }} />
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Tổng lượt mượn:</Text>
              <Text strong>{book.borrowedCount} lượt</Text>
            </Space>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text>Cập nhật lần cuối:</Text>
              <Text strong>{formatDate(book.lastActivity)}</Text>
            </Space>
          </Space>
        </div>
      </Space>
    </Modal>
  );
}

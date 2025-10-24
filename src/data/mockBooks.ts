export type BookStatus = "available" | "loaned" | "reserved" | "archived";

export type BookFormat = "hardcover" | "paperback" | "ebook" | "audiobook";

export interface AdminBook {
  id: string;
  title: string;
  isbn: string;
  author: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCount: number;
  reservedCount: number;
  overdueCount: number;
  status: BookStatus;
  lastActivity: string;
  format: BookFormat;
  tags?: string[];
  cover?: string;
}

export const adminBooks: AdminBook[] = [
  {
    id: "B-2001",
    title: "Kỹ Năng Lãnh Đạo Trong Thời Đại Số",
    isbn: "978-6043456789",
    author: "Trần Minh Tâm",
    category: "Kinh tế",
    publishedYear: 2023,
    totalCopies: 32,
    availableCopies: 18,
    borrowedCount: 210,
    reservedCount: 6,
    overdueCount: 1,
    status: "available",
    lastActivity: "2025-10-24T04:12:00Z",
    format: "hardcover",
    tags: ["Best Seller", "Tái bản"],
  },
  {
    id: "B-2002",
    title: "Trí Tuệ Nhân Tạo Ứng Dụng",
    isbn: "978-6041122334",
    author: "Nguyễn Lan Vy",
    category: "Công nghệ",
    publishedYear: 2022,
    totalCopies: 24,
    availableCopies: 4,
    borrowedCount: 365,
    reservedCount: 12,
    overdueCount: 3,
    status: "loaned",
    lastActivity: "2025-10-23T15:05:00Z",
    format: "paperback",
    tags: ["Chuyên ngành", "Hot"],
  },
  {
    id: "B-2003",
    title: "Dược Lý Lâm Sàng Cơ Bản",
    isbn: "978-6049988776",
    author: "Lê Quốc Phúc",
    category: "Y dược",
    publishedYear: 2021,
    totalCopies: 18,
    availableCopies: 9,
    borrowedCount: 120,
    reservedCount: 3,
    overdueCount: 0,
    status: "available",
    lastActivity: "2025-10-22T08:40:00Z",
    format: "hardcover",
  },
  {
    id: "B-2004",
    title: "Thiết Kế Kiến Trúc Bền Vững",
    isbn: "978-6045566778",
    author: "Phạm Gia Huy",
    category: "Kiến trúc",
    publishedYear: 2020,
    totalCopies: 15,
    availableCopies: 0,
    borrowedCount: 188,
    reservedCount: 5,
    overdueCount: 2,
    status: "reserved",
    lastActivity: "2025-10-24T00:20:00Z",
    format: "paperback",
  },
  {
    id: "B-2005",
    title: "Phân Tích Dữ Liệu Chuyên Sâu",
    isbn: "978-6043344556",
    author: "Đặng Thảo Nhi",
    category: "Công nghệ",
    publishedYear: 2024,
    totalCopies: 20,
    availableCopies: 2,
    borrowedCount: 146,
    reservedCount: 7,
    overdueCount: 4,
    status: "loaned",
    lastActivity: "2025-10-23T20:10:00Z",
    format: "ebook",
    tags: ["Analytics"],
  },
  {
    id: "B-2006",
    title: "Marketing Trải Nghiệm Người Dùng",
    isbn: "978-6042233445",
    author: "Phùng Ánh Hồng",
    category: "Marketing",
    publishedYear: 2019,
    totalCopies: 25,
    availableCopies: 14,
    borrowedCount: 98,
    reservedCount: 2,
    overdueCount: 0,
    status: "available",
    lastActivity: "2025-10-21T09:55:00Z",
    format: "paperback",
    tags: ["Cơ bản"],
  },
  {
    id: "B-2007",
    title: "Cơ Sở Dữ Liệu Oracle 19c",
    isbn: "978-6044455667",
    author: "Vũ Quốc Huy",
    category: "Công nghệ",
    publishedYear: 2020,
    totalCopies: 12,
    availableCopies: 1,
    borrowedCount: 172,
    reservedCount: 9,
    overdueCount: 1,
    status: "loaned",
    lastActivity: "2025-10-22T17:05:00Z",
    format: "hardcover",
  },
  {
    id: "B-2008",
    title: "Quy Trình Điều Dưỡng Hiện Đại",
    isbn: "978-6046677889",
    author: "Đỗ Nhật Khoa",
    category: "Y dược",
    publishedYear: 2023,
    totalCopies: 28,
    availableCopies: 8,
    borrowedCount: 134,
    reservedCount: 4,
    overdueCount: 0,
    status: "available",
    lastActivity: "2025-10-23T11:32:00Z",
    format: "hardcover",
  },
  {
    id: "B-2009",
    title: "Tư Duy Thiết Kế Sản Phẩm",
    isbn: "978-6047788990",
    author: "Tạ Ngọc Khánh",
    category: "Thiết kế",
    publishedYear: 2021,
    totalCopies: 19,
    availableCopies: 5,
    borrowedCount: 158,
    reservedCount: 6,
    overdueCount: 1,
    status: "available",
    lastActivity: "2025-10-22T13:15:00Z",
    format: "paperback",
    tags: ["Workshop"],
  },
  {
    id: "B-2010",
    title: "Âm Nhạc Trong Điều Trị Tâm Lý",
    isbn: "978-6048899001",
    author: "Đinh Gia Hân",
    category: "Tâm lý",
    publishedYear: 2018,
    totalCopies: 14,
    availableCopies: 0,
    borrowedCount: 110,
    reservedCount: 2,
    overdueCount: 2,
    status: "archived",
    lastActivity: "2025-10-18T05:12:00Z",
    format: "audiobook",
  },
];

export const categoryDistribution: Array<{ category: string; count: number }> = [
  { category: "Công nghệ", count: 245 },
  { category: "Kinh tế", count: 180 },
  { category: "Y dược", count: 142 },
  { category: "Thiết kế", count: 96 },
  { category: "Kiến trúc", count: 74 },
  { category: "Tâm lý", count: 58 },
];

export const monthlyBorrowTrend: Array<{ month: string; borrowed: number; returned: number }> = [
  { month: "05/2025", borrowed: 540, returned: 488 },
  { month: "06/2025", borrowed: 578, returned: 510 },
  { month: "07/2025", borrowed: 602, returned: 530 },
  { month: "08/2025", borrowed: 630, returned: 560 },
  { month: "09/2025", borrowed: 662, returned: 588 },
  { month: "10/2025", borrowed: 688, returned: 612 },
];

export const latestBookActivities: Array<{ id: string; title: string; action: string; timestamp: string }> = [
  { id: "B-2012", title: "Ứng Dụng Blockchain", action: "Nhập kho phiên bản mới", timestamp: "15 phút trước" },
  { id: "B-2002", title: "Trí Tuệ Nhân Tạo Ứng Dụng", action: "Gia hạn mượn bởi U-1003", timestamp: "1 giờ trước" },
  { id: "B-2005", title: "Phân Tích Dữ Liệu Chuyên Sâu", action: "Hoàn trả từ U-1010", timestamp: "3 giờ trước" },
  { id: "B-2001", title: "Kỹ Năng Lãnh Đạo Trong Thời Đại Số", action: "Đặt giữ chỗ mới từ U-1007", timestamp: "5 giờ trước" },
  { id: "B-2010", title: "Âm Nhạc Trong Điều Trị Tâm Lý", action: "Chuyển vào kho lưu trữ", timestamp: "Hôm qua" },
];


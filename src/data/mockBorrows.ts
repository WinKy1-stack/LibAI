export type BorrowStatus = "borrowed" | "returned" | "overdue" | "lost";

export interface BorrowRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  renewalCount: number;
  fineAmount: number;
  notes?: string;
}

export const borrowRecords: BorrowRecord[] = [
  {
    id: "BR-1001",
    userId: "U-1003",
    userName: "Nguyễn Lan Vy",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    userEmail: "vy.nguyen@student.edu.vn",
    bookId: "B-001",
    bookTitle: "Lập trình Python nâng cao",
    bookAuthor: "Nguyễn Văn A",
    bookCover: "https://picsum.photos/seed/book1/200/300",
    borrowDate: "2025-10-15",
    dueDate: "2025-10-29",
    status: "borrowed",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1002",
    userId: "U-1004",
    userName: "Trần Quốc Bảo",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    userEmail: "bao.tran@student.edu.vn",
    bookId: "B-002",
    bookTitle: "Cấu trúc dữ liệu và giải thuật",
    bookAuthor: "Phạm Thị B",
    bookCover: "https://picsum.photos/seed/book2/200/300",
    borrowDate: "2025-10-01",
    dueDate: "2025-10-15",
    status: "overdue",
    renewalCount: 1,
    fineAmount: 50000,
    notes: "Đã nhắc nhở qua email 3 lần",
  },
  {
    id: "BR-1003",
    userId: "U-1005",
    userName: "Hoàng Minh Tuấn",
    userAvatar: "https://i.pravatar.cc/150?img=33",
    userEmail: "tuan.hoang@teacher.edu.vn",
    bookId: "B-003",
    bookTitle: "Machine Learning cơ bản",
    bookAuthor: "Lê Văn C",
    bookCover: "https://picsum.photos/seed/book3/200/300",
    borrowDate: "2025-10-10",
    dueDate: "2025-10-24",
    returnDate: "2025-10-23",
    status: "returned",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1004",
    userId: "U-1006",
    userName: "Vũ Thanh Hương",
    userAvatar: "https://i.pravatar.cc/150?img=20",
    userEmail: "huong.vu@student.edu.vn",
    bookId: "B-004",
    bookTitle: "Trí tuệ nhân tạo và ứng dụng",
    bookAuthor: "Trần Thị D",
    bookCover: "https://picsum.photos/seed/book4/200/300",
    borrowDate: "2025-10-20",
    dueDate: "2025-11-03",
    status: "borrowed",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1005",
    userId: "U-1007",
    userName: "Ngô Đức Anh",
    userAvatar: "https://i.pravatar.cc/150?img=52",
    userEmail: "anh.ngo@student.edu.vn",
    bookId: "B-005",
    bookTitle: "Database Management Systems",
    bookAuthor: "Nguyễn Văn E",
    bookCover: "https://picsum.photos/seed/book5/200/300",
    borrowDate: "2025-09-20",
    dueDate: "2025-10-04",
    status: "overdue",
    renewalCount: 2,
    fineAmount: 125000,
    notes: "Liên hệ không được, cần xử lý",
  },
  {
    id: "BR-1006",
    userId: "U-1008",
    userName: "Đặng Thị Mai",
    userAvatar: "https://i.pravatar.cc/150?img=26",
    userEmail: "mai.dang@student.edu.vn",
    bookId: "B-006",
    bookTitle: "Web Development với React",
    bookAuthor: "Phạm Văn F",
    bookCover: "https://picsum.photos/seed/book6/200/300",
    borrowDate: "2025-10-12",
    dueDate: "2025-10-26",
    returnDate: "2025-10-25",
    status: "returned",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1007",
    userId: "U-1009",
    userName: "Bùi Văn Hải",
    userAvatar: "https://i.pravatar.cc/150?img=15",
    userEmail: "hai.bui@student.edu.vn",
    bookId: "B-007",
    bookTitle: "DevOps và CI/CD",
    bookAuthor: "Lê Thị G",
    bookCover: "https://picsum.photos/seed/book7/200/300",
    borrowDate: "2025-10-18",
    dueDate: "2025-11-01",
    status: "borrowed",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1008",
    userId: "U-1010",
    userName: "Phan Thị Lan",
    userAvatar: "https://i.pravatar.cc/150?img=29",
    userEmail: "lan.phan@teacher.edu.vn",
    bookId: "B-008",
    bookTitle: "Cloud Computing Fundamentals",
    bookAuthor: "Trần Văn H",
    bookCover: "https://picsum.photos/seed/book8/200/300",
    borrowDate: "2025-08-15",
    dueDate: "2025-08-29",
    status: "lost",
    renewalCount: 0,
    fineAmount: 500000,
    notes: "Người dùng báo mất sách",
  },
  {
    id: "BR-1009",
    userId: "U-1003",
    userName: "Nguyễn Lan Vy",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    userEmail: "vy.nguyen@student.edu.vn",
    bookId: "B-009",
    bookTitle: "Mobile App Development",
    bookAuthor: "Nguyễn Thị I",
    bookCover: "https://picsum.photos/seed/book9/200/300",
    borrowDate: "2025-10-05",
    dueDate: "2025-10-19",
    returnDate: "2025-10-18",
    status: "returned",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1010",
    userId: "U-1004",
    userName: "Trần Quốc Bảo",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    userEmail: "bao.tran@student.edu.vn",
    bookId: "B-010",
    bookTitle: "Blockchain và Cryptocurrency",
    bookAuthor: "Phạm Văn K",
    bookCover: "https://picsum.photos/seed/book10/200/300",
    borrowDate: "2025-10-22",
    dueDate: "2025-11-05",
    status: "borrowed",
    renewalCount: 0,
    fineAmount: 0,
  },
  {
    id: "BR-1011",
    userId: "U-1005",
    userName: "Hoàng Minh Tuấn",
    userAvatar: "https://i.pravatar.cc/150?img=33",
    userEmail: "tuan.hoang@teacher.edu.vn",
    bookId: "B-011",
    bookTitle: "Network Security",
    bookAuthor: "Lê Văn L",
    bookCover: "https://picsum.photos/seed/book11/200/300",
    borrowDate: "2025-09-28",
    dueDate: "2025-10-12",
    status: "overdue",
    renewalCount: 1,
    fineAmount: 85000,
  },
  {
    id: "BR-1012",
    userId: "U-1006",
    userName: "Vũ Thanh Hương",
    userAvatar: "https://i.pravatar.cc/150?img=20",
    userEmail: "huong.vu@student.edu.vn",
    bookId: "B-012",
    bookTitle: "Software Engineering Principles",
    bookAuthor: "Trần Thị M",
    bookCover: "https://picsum.photos/seed/book12/200/300",
    borrowDate: "2025-10-08",
    dueDate: "2025-10-22",
    returnDate: "2025-10-21",
    status: "returned",
    renewalCount: 0,
    fineAmount: 0,
  },
];

// Dữ liệu thống kê xu hướng mượn sách theo tháng
export const borrowTrendData = [
  { month: "T4", borrows: 245, returns: 230, overdue: 15 },
  { month: "T5", borrows: 289, returns: 275, overdue: 14 },
  { month: "T6", borrows: 312, returns: 295, overdue: 17 },
  { month: "T7", borrows: 198, returns: 185, overdue: 13 },
  { month: "T8", borrows: 356, returns: 340, overdue: 16 },
  { month: "T9", borrows: 398, returns: 380, overdue: 18 },
  { month: "T10", borrows: 425, returns: 395, overdue: 30 },
];

// Phân bố trạng thái sách mượn
export const statusDistribution = [
  { status: "Đang mượn", count: 425, percentage: 45.2, color: "#1890ff" },
  { status: "Đã trả", count: 398, percentage: 42.3, color: "#52c41a" },
  { status: "Quá hạn", count: 98, percentage: 10.4, color: "#ff4d4f" },
  { status: "Mất sách", count: 20, percentage: 2.1, color: "#8c8c8c" },
];

// Hoạt động mới nhất
export interface BorrowActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: "borrow" | "return" | "renew" | "overdue" | "lost";
  bookTitle: string;
  timestamp: string;
  timeAgo: string;
}

export const latestBorrowActivities: BorrowActivity[] = [
  {
    id: "A-1",
    userId: "U-1003",
    userName: "Nguyễn Lan Vy",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    action: "borrow",
    bookTitle: "Lập trình Python nâng cao",
    timestamp: "2025-10-29T09:30:00",
    timeAgo: "10 phút trước",
  },
  {
    id: "A-2",
    userId: "U-1006",
    userName: "Vũ Thanh Hương",
    userAvatar: "https://i.pravatar.cc/150?img=20",
    action: "return",
    bookTitle: "Software Engineering Principles",
    timestamp: "2025-10-29T08:45:00",
    timeAgo: "55 phút trước",
  },
  {
    id: "A-3",
    userId: "U-1004",
    userName: "Trần Quốc Bảo",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    action: "renew",
    bookTitle: "Cấu trúc dữ liệu và giải thuật",
    timestamp: "2025-10-29T07:20:00",
    timeAgo: "2 giờ trước",
  },
  {
    id: "A-4",
    userId: "U-1007",
    userName: "Ngô Đức Anh",
    userAvatar: "https://i.pravatar.cc/150?img=52",
    action: "overdue",
    bookTitle: "Database Management Systems",
    timestamp: "2025-10-29T00:00:00",
    timeAgo: "Hôm nay",
  },
  {
    id: "A-5",
    userId: "U-1005",
    userName: "Hoàng Minh Tuấn",
    userAvatar: "https://i.pravatar.cc/150?img=33",
    action: "return",
    bookTitle: "Machine Learning cơ bản",
    timestamp: "2025-10-28T16:30:00",
    timeAgo: "Hôm qua",
  },
];

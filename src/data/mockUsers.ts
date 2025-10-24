export type UserStatus = "active" | "pending" | "inactive" | "banned";

export type UserRole = "student" | "teacher" | "librarian" | "administrator";

export interface AdminUser {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: UserRole;
  department: string;
  joinDate: string;
  lastLogin: string;
  status: UserStatus;
  totalBorrowed: number;
  overdueBooks: number;
  completionRate: number;
  phone?: string;
  city?: string;
  tags?: string[];
}

export const adminUsers: AdminUser[] = [
  {
    id: "U-1001",
    name: "La Thanh Toàn",
    avatar:
      "https://images-ext-1.discordapp.net/external/YgsUjW8zZkTOwywiLBV9ZNyntjC2SUDbt3N7_WH0ijA/https/lh3.googleusercontent.com/pw/AP1GczOxJur9COUK_irJFEBCrMcfGqg_Bds-0B02bbBv55ZJyOpY1eP4RwuXgDlSN6NRiJR_k1BS2Z6ph1pVIZJF9utI1frbOKamY75lGDJT-0L3EFyb6c-ovGbGVBxznEAxukuba7euzaLObdTk2C9aDrG0qQ?format=webp",
    email: "thanhtoan@example.com",
    role: "administrator",
    department: "Quản trị hệ thống",
    joinDate: "2021-04-18",
    lastLogin: "2025-10-24T06:15:00Z",
    status: "active",
    totalBorrowed: 48,
    overdueBooks: 0,
    completionRate: 96,
    phone: "0981 234 567",
    city: "Hà Nội",
    tags: ["Core Team", "Owner"],
  },
  {
    id: "U-1002",
    name: "Phạm Minh Hà",
    email: "minhha@unilib.vn",
    role: "librarian",
    department: "Thủ thư",
    joinDate: "2022-08-11",
    lastLogin: "2025-10-24T03:30:00Z",
    status: "active",
    totalBorrowed: 32,
    overdueBooks: 1,
    completionRate: 82,
    phone: "0903 555 210",
    city: "Đà Nẵng",
    tags: ["Trực quầy"],
  },
  {
    id: "U-1003",
    name: "Nguyễn Lan Vy",
    email: "lanny@student.vn",
    role: "student",
    department: "Công nghệ thông tin",
    joinDate: "2023-02-02",
    lastLogin: "2025-10-23T15:20:00Z",
    status: "active",
    totalBorrowed: 21,
    overdueBooks: 0,
    completionRate: 88,
    phone: "0912 441 220",
    city: "TP. Hồ Chí Minh",
    tags: ["Hội sách"],
  },
  {
    id: "U-1004",
    name: "Vũ Quốc Huy",
    email: "quoctran@faculty.vn",
    role: "teacher",
    department: "Kinh tế",
    joinDate: "2020-10-01",
    lastLogin: "2025-10-22T08:50:00Z",
    status: "pending",
    totalBorrowed: 17,
    overdueBooks: 2,
    completionRate: 63,
    phone: "0888 777 665",
    city: "Hải Phòng",
  },
  {
    id: "U-1005",
    name: "Đỗ Nhật Khoa",
    email: "nhatkhoa@student.vn",
    role: "student",
    department: "Y dược",
    joinDate: "2023-09-12",
    lastLogin: "2025-10-24T08:10:00Z",
    status: "active",
    totalBorrowed: 11,
    overdueBooks: 0,
    completionRate: 71,
    phone: "0973 448 110",
    city: "Huế",
  },
  {
    id: "U-1006",
    name: "Trần Minh Phúc",
    email: "phuc.tran@faculty.vn",
    role: "teacher",
    department: "Ngôn ngữ & Văn hóa",
    joinDate: "2019-05-27",
    lastLogin: "2025-10-20T04:12:00Z",
    status: "inactive",
    totalBorrowed: 29,
    overdueBooks: 4,
    completionRate: 45,
    phone: "0908 165 903",
    city: "Cần Thơ",
  },
  {
    id: "U-1007",
    name: "Đinh Gia Hân",
    email: "giahana@student.vn",
    role: "student",
    department: "Kiến trúc",
    joinDate: "2023-12-22",
    lastLogin: "2025-10-23T09:05:00Z",
    status: "pending",
    totalBorrowed: 5,
    overdueBooks: 0,
    completionRate: 54,
    phone: "0905 420 876",
    city: "Bình Dương",
  },
  {
    id: "U-1008",
    name: "Tạ Ngọc Khánh",
    email: "ngockhanh@student.vn",
    role: "student",
    department: "Thiết kế đồ họa",
    joinDate: "2022-01-30",
    lastLogin: "2025-10-21T21:45:00Z",
    status: "active",
    totalBorrowed: 42,
    overdueBooks: 3,
    completionRate: 77,
    phone: "0932 708 564",
    city: "Quảng Ninh",
  },
  {
    id: "U-1009",
    name: "Phùng Ánh Hồng",
    email: "hongphung@unilib.vn",
    role: "librarian",
    department: "Hỗ trợ bạn đọc",
    joinDate: "2021-07-14",
    lastLogin: "2025-10-24T02:40:00Z",
    status: "active",
    totalBorrowed: 8,
    overdueBooks: 0,
    completionRate: 89,
    phone: "0914 662 102",
    city: "Hà Nội",
  },
  {
    id: "U-1010",
    name: "Phan Hồ Khôi",
    email: "hoikhoi@student.vn",
    role: "student",
    department: "Marketing",
    joinDate: "2024-05-03",
    lastLogin: "2025-10-18T19:05:00Z",
    status: "banned",
    totalBorrowed: 3,
    overdueBooks: 3,
    completionRate: 12,
    phone: "0901 333 586",
    city: "TP. Thủ Đức",
    tags: ["Vi phạm"],
  },
];

export const userRetentionTrend: Array<{ month: string; active: number; churned: number }> = [
  { month: "05/2025", active: 82, churned: 6 },
  { month: "06/2025", active: 85, churned: 5 },
  { month: "07/2025", active: 87, churned: 7 },
  { month: "08/2025", active: 90, churned: 5 },
  { month: "09/2025", active: 92, churned: 4 },
  { month: "10/2025", active: 94, churned: 4 },
];

export const userRoleDistribution: Array<{ role: UserRole; count: number }> = [
  { role: "student", count: 720 },
  { role: "teacher", count: 165 },
  { role: "librarian", count: 48 },
  { role: "administrator", count: 12 },
];

export const latestUserActivities: Array<{ id: string; name: string; action: string; timestamp: string }> = [
  { id: "U-1011", name: "Trần Thảo Nhi", action: "Đăng ký tài khoản mới", timestamp: "10 phút trước" },
  { id: "U-1002", name: "Phạm Minh Hà", action: "Cập nhật hồ sơ cá nhân", timestamp: "30 phút trước" },
  { id: "U-1007", name: "Đinh Gia Hân", action: "Đang chờ phê duyệt truy cập", timestamp: "1 giờ trước" },
  { id: "U-1005", name: "Đỗ Nhật Khoa", action: "Gia hạn sách: Kỹ năng mềm", timestamp: "3 giờ trước" },
  { id: "U-1008", name: "Tạ Ngọc Khánh", action: "Thanh toán phí trễ hạn", timestamp: "6 giờ trước" },
];


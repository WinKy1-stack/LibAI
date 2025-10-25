export type ReportType = "daily" | "weekly" | "monthly" | "yearly";
export type ReportStatus = "generated" | "processing" | "scheduled";
export type ReportCategory = "books" | "users" | "financial" | "activity" | "overdue";

export interface ReportItem {
  id: string;
  name: string;
  category: ReportCategory;
  type: ReportType;
  generatedDate: string;
  period: string;
  status: ReportStatus;
  downloads: number;
  fileSize: string;
  createdBy: string;
}

export const adminReports: ReportItem[] = [
  {
    id: "RPT-2001",
    name: "Báo cáo mượn sách tháng 10",
    category: "books",
    type: "monthly",
    generatedDate: "2025-10-24T08:30:00Z",
    period: "10/2025",
    status: "generated",
    downloads: 45,
    fileSize: "2.4 MB",
    createdBy: "Thanh Toàn",
  },
  {
    id: "RPT-2002",
    name: "Báo cáo tài chính quý 4",
    category: "financial",
    type: "monthly",
    generatedDate: "2025-10-23T14:20:00Z",
    period: "Q4 2025",
    status: "generated",
    downloads: 128,
    fileSize: "3.8 MB",
    createdBy: "Admin",
  },
  {
    id: "RPT-2003",
    name: "Hoạt động người dùng tuần này",
    category: "activity",
    type: "weekly",
    generatedDate: "2025-10-22T10:15:00Z",
    period: "W42 2025",
    status: "generated",
    downloads: 32,
    fileSize: "1.2 MB",
    createdBy: "Thanh Toàn",
  },
  {
    id: "RPT-2004",
    name: "Sách quá hạn tháng 10",
    category: "overdue",
    type: "monthly",
    generatedDate: "2025-10-21T16:45:00Z",
    period: "10/2025",
    status: "generated",
    downloads: 67,
    fileSize: "890 KB",
    createdBy: "Admin",
  },
  {
    id: "RPT-2005",
    name: "Thống kê người dùng mới",
    category: "users",
    type: "monthly",
    generatedDate: "2025-10-20T09:30:00Z",
    period: "10/2025",
    status: "generated",
    downloads: 54,
    fileSize: "1.6 MB",
    createdBy: "Thanh Toàn",
  },
  {
    id: "RPT-2006",
    name: "Báo cáo hoạt động hàng ngày",
    category: "activity",
    type: "daily",
    generatedDate: "2025-10-24T23:00:00Z",
    period: "24/10/2025",
    status: "processing",
    downloads: 0,
    fileSize: "—",
    createdBy: "System",
  },
  {
    id: "RPT-2007",
    name: "Tổng kết năm 2025",
    category: "books",
    type: "yearly",
    generatedDate: "2025-12-31T23:59:00Z",
    period: "2025",
    status: "scheduled",
    downloads: 0,
    fileSize: "—",
    createdBy: "System",
  },
];

export interface RevenueData {
  month: string;
  fines: number;
  subscriptions: number;
  lateReturns: number;
}

export const monthlyRevenue: RevenueData[] = [
  { month: "05/2025", fines: 2400, subscriptions: 4800, lateReturns: 1200 },
  { month: "06/2025", fines: 2100, subscriptions: 5200, lateReturns: 980 },
  { month: "07/2025", fines: 2800, subscriptions: 5600, lateReturns: 1400 },
  { month: "08/2025", fines: 3200, subscriptions: 6100, lateReturns: 1680 },
  { month: "09/2025", fines: 2900, subscriptions: 6400, lateReturns: 1520 },
  { month: "10/2025", fines: 3400, subscriptions: 6800, lateReturns: 1800 },
];

export interface ActivityMetrics {
  date: string;
  checkouts: number;
  returns: number;
  visitors: number;
}

export const weeklyActivity: ActivityMetrics[] = [
  { date: "T2", checkouts: 120, returns: 98, visitors: 245 },
  { date: "T3", checkouts: 145, returns: 112, visitors: 280 },
  { date: "T4", checkouts: 132, returns: 108, visitors: 268 },
  { date: "T5", checkouts: 156, returns: 125, visitors: 310 },
  { date: "T6", checkouts: 178, returns: 142, visitors: 355 },
  { date: "T7", checkouts: 98, returns: 165, visitors: 198 },
  { date: "CN", checkouts: 76, returns: 134, visitors: 156 },
];

export const categoryPerformance: Array<{ category: string; borrowed: number; revenue: number }> = [
  { category: "Công nghệ", borrowed: 365, revenue: 12400 },
  { category: "Kinh tế", borrowed: 298, revenue: 10200 },
  { category: "Y dược", borrowed: 245, revenue: 8900 },
  { category: "Thiết kế", borrowed: 178, revenue: 6500 },
  { category: "Kiến trúc", borrowed: 156, revenue: 5800 },
  { category: "Tâm lý", borrowed: 134, revenue: 4900 },
  { category: "Marketing", borrowed: 112, revenue: 4200 },
  { category: "Khác", borrowed: 89, revenue: 3100 },
];

export interface TopMetrics {
  topBooks: Array<{ title: string; borrows: number; author: string }>;
  topUsers: Array<{ name: string; borrows: number; membership: string }>;
  topCategories: Array<{ category: string; percentage: number }>;
}

export const topMetrics: TopMetrics = {
  topBooks: [
    { title: "Trí Tuệ Nhân Tạo Ứng Dụng", borrows: 365, author: "Nguyễn Lan Vy" },
    { title: "Kỹ Năng Lãnh Đạo Trong Thời Đại Số", borrows: 210, author: "Trần Minh Tâm" },
    { title: "Thiết Kế Kiến Trúc Bền Vững", borrows: 188, author: "Phạm Gia Huy" },
    { title: "Cơ Sở Dữ Liệu Oracle 19c", borrows: 172, author: "Vũ Quốc Huy" },
    { title: "Tư Duy Thiết Kế Sản Phẩm", borrows: 158, author: "Tạ Ngọc Khánh" },
  ],
  topUsers: [
    { name: "Nguyễn Văn A", borrows: 48, membership: "Premium" },
    { name: "Trần Thị B", borrows: 42, membership: "Premium" },
    { name: "Lê Văn C", borrows: 38, membership: "Standard" },
    { name: "Phạm Thị D", borrows: 35, membership: "Premium" },
    { name: "Hoàng Văn E", borrows: 32, membership: "Standard" },
  ],
  topCategories: [
    { category: "Công nghệ", percentage: 32.5 },
    { category: "Kinh tế", percentage: 24.8 },
    { category: "Y dược", percentage: 18.2 },
    { category: "Thiết kế", percentage: 12.4 },
    { category: "Khác", percentage: 12.1 },
  ],
};

export interface OverviewMetrics {
  totalReports: number;
  generatedThisMonth: number;
  totalDownloads: number;
  scheduledReports: number;
  avgGenerationTime: string;
  storageUsed: string;
}

export const overviewMetrics: OverviewMetrics = {
  totalReports: 247,
  generatedThisMonth: 18,
  totalDownloads: 1456,
  scheduledReports: 12,
  avgGenerationTime: "2.3 phút",
  storageUsed: "45.8 GB",
};


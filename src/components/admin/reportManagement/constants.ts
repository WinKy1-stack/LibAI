import type { ReportType, ReportStatus, ReportCategory } from "../../../data";

export const REPORT_TYPE_OPTIONS: Array<{ label: string; value: "all" | ReportType }> = [
  { label: "Tất cả chu kỳ", value: "all" },
  { label: "Hàng ngày", value: "daily" },
  { label: "Hàng tuần", value: "weekly" },
  { label: "Hàng tháng", value: "monthly" },
  { label: "Hàng năm", value: "yearly" },
];

export const REPORT_STATUS_OPTIONS: Array<{ label: string; value: "all" | ReportStatus }> = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đã tạo", value: "generated" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Đã lên lịch", value: "scheduled" },
];

export const REPORT_CATEGORY_OPTIONS: Array<{ label: string; value: "all" | ReportCategory }> = [
  { label: "Tất cả loại", value: "all" },
  { label: "Sách", value: "books" },
  { label: "Người dùng", value: "users" },
  { label: "Tài chính", value: "financial" },
  { label: "Hoạt động", value: "activity" },
  { label: "Quá hạn", value: "overdue" },
];

// Chart colors using theme tokens
export const getChartColors = (token: any) => ({
  // Activity chart colors
  checkouts: token.colorInfo,
  returns: token.colorSuccess,
  visitors: token.colorPrimary,
  
  // Revenue chart colors
  fines: token.colorError,
  subscriptions: token.colorSuccess,
  lateReturns: token.colorWarning,
  
  // Trophy colors for rankings
  trophy: {
    gold: '#ffd700',
    silver: '#c0c0c0',
    bronze: '#cd7f32',
  },
  
  // Stats overview colors
  stats: {
    primary: token.colorPrimary,
    success: token.colorSuccess,
    info: token.colorInfo,
    warning: token.colorWarning,
    purple: '#722ed1',
    pink: '#eb2f96',
  },
});


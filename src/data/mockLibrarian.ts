// Mock data for Librarian Settings

export interface LibrarianProfile {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  bio: string;
  avatar: string;
}

export interface LibrarianPreferences {
  theme: "light" | "dark" | "auto";
  language: "vi" | "en" | "ja" | "ko";
  fontSize: number;
  compactMode: boolean;
  showAvatars: boolean;
  tablePageSize: number;
  dashboardLayout: "default" | "compact" | "detailed";
}

export interface LibrarianNotificationSettings {
  emailNotifications: boolean;
  newBorrowRequest: boolean;
  bookOverdue: boolean;
  bookReturned: boolean;
  newUserRegistration: boolean;
  systemMaintenance: boolean;
  browserNotifications: boolean;
  soundNotifications: boolean;
  notificationFrequency: "realtime" | "hourly" | "daily" | "weekly";
}

// Default Librarian Profile
export const defaultLibrarianProfile: LibrarianProfile = {
  fullName: "La Thanh Toàn",
  email: "thanhtoan@library.vn",
  phone: "0981 234 567",
  department: "Quản lý mượn trả",
  position: "Thủ thư chính",
  bio: "Tôi yêu thích sách và đam mê giúp đỡ độc giả tìm kiếm tri thức.",
  avatar: "https://images-ext-1.discordapp.net/external/YgsUjW8zZkTOwywiLBV9ZNyntjC2SUDbt3N7_WH0ijA/https/lh3.googleusercontent.com/pw/AP1GczOxJur9COUK_irJFEBCrMcfGqg_Bds-0B02bbBv55ZJyOpY1eP4RwuXgDlSN6NRiJR_k1BS2Z6ph1pVIZJF9utI1frbOKamY75lGDJT-0L3EFyb6c-ovGbGVBxznEAxukuba7euzaLObdTk2C9aDrG0qQ?format=webp",
};

// Default Preferences
export const defaultLibrarianPreferences: LibrarianPreferences = {
  theme: "light",
  language: "vi",
  fontSize: 14,
  compactMode: false,
  showAvatars: true,
  tablePageSize: 10,
  dashboardLayout: "default",
};

// Default Notification Settings
export const defaultLibrarianNotifications: LibrarianNotificationSettings = {
  emailNotifications: true,
  newBorrowRequest: true,
  bookOverdue: true,
  bookReturned: true,
  newUserRegistration: false,
  systemMaintenance: true,
  browserNotifications: true,
  soundNotifications: false,
  notificationFrequency: "realtime",
};

// Language Options
export const languageOptions = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
  { label: "한국어", value: "ko" },
];

// Notification Frequency Options  
export const notificationFrequencyOptions = [
  { label: "Thời gian thực", value: "realtime" },
  { label: "Tổng hợp mỗi giờ", value: "hourly" },
  { label: "Tổng hợp mỗi ngày", value: "daily" },
  { label: "Tổng hợp mỗi tuần", value: "weekly" },
];


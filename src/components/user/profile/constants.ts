/**
 * Profile Components Constants
 * Centralized configuration for profile page components
 */

// Role display mapping
export const ROLE_LABELS = {
  admin: "Quản trị viên",
  librarian: "Thủ thư",
  reader: "Độc giả",
} as const;

// Role badge styles
export const ROLE_BADGE_STYLES = {
  admin: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  librarian: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  reader: "bg-green-500/10 text-green-600 dark:text-green-400",
} as const;

// Status display mapping
export const STATUS_LABELS = {
  active: "Hoạt động",
  blocked: "Bị khóa",
  inactive: "Không hoạt động",
} as const;

// Status color styles
export const STATUS_COLORS = {
  active: "text-green-500",
  blocked: "text-red-500",
  inactive: "text-gray-500",
} as const;

// Form validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp",
  PASSWORD_TOO_SHORT: `Mật khẩu mới phải có ít nhất ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự`,
  UPDATE_FAILED: "Cập nhật thất bại",
  CHANGE_PASSWORD_FAILED: "Đổi mật khẩu thất bại",
} as const;

// Security tips for password section
export const SECURITY_TIPS = [
  "Sử dụng mật khẩu mạnh với ít nhất 8 ký tự",
  "Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt",
  "Không sử dụng thông tin cá nhân dễ đoán",
  "Thay đổi mật khẩu định kỳ",
] as const;

// Avatar service URL
export const AVATAR_SERVICE_URL = "https://avatar.iran.liara.run/public/boy?username=";

// Section types
export type ProfileSection = "info" | "password";


import type { UserRole, UserStatus } from "../../../data";

export const statusLabels: Record<UserStatus, string> = {
  active: "Đang hoạt động",
  pending: "Chờ duyệt",
  inactive: "Ngừng hoạt động",
  banned: "Tạm khóa",
};

export const roleLabels: Record<UserRole, string> = {
  student: "Sinh viên",
  teacher: "Giảng viên",
  librarian: "Thủ thư",
  administrator: "Quản trị viên",
};

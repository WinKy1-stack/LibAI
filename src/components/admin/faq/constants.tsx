import type { ReactNode } from "react";
import {
  BookOutlined,
  RollbackOutlined,
  IdcardOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
} from "@ant-design/icons";

// Category Icon Mapping
export const categoryIcons: Record<string, ReactNode> = {
  borrowing: <BookOutlined />,
  returning: <RollbackOutlined />,
  membership: <IdcardOutlined />,
  fines: <DollarOutlined />,
  services: <CustomerServiceOutlined />,
  technical: <SettingOutlined />,
};

// Category Labels
export const categoryLabels: Record<string, string> = {
  borrowing: "Mượn sách",
  returning: "Trả sách",
  membership: "Thẻ thành viên",
  fines: "Phí & Phạt",
  services: "Dịch vụ",
  technical: "Kỹ thuật",
};

// Status Labels
export const statusLabels: Record<string, string> = {
  published: "Xuất bản",
  draft: "Nháp",
  archived: "Lưu trữ",
};


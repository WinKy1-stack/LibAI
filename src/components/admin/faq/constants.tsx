import type { ReactNode } from "react";
import type { GlobalToken } from "antd";
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

// FAQ colors using theme tokens
export const getFaqColors = (token: GlobalToken) => ({
  // Category colors
  categories: {
    borrowing: token.colorInfo,
    returning: token.colorSuccess,
    membership: token.colorPrimary,
    fines: token.colorError,
    services: token.colorWarning,
    technical: '#722ed1', // Purple for technical
  } as Record<string, string>,
  
  // Status colors
  status: {
    published: token.colorSuccess,
    draft: token.colorWarning,
    archived: token.colorTextSecondary,
  },
  
  // Action colors
  actions: {
    like: token.colorSuccess,
    dislike: token.colorError,
    view: token.colorTextSecondary,
    edit: token.colorPrimary,
    delete: token.colorError,
  },
  
  // Tag colors for categories
  tagColors: {
    borrowing: 'blue',
    returning: 'green', 
    membership: 'purple',
    fines: 'red',
    services: 'cyan',
    technical: 'orange',
  } as Record<string, string>,
});


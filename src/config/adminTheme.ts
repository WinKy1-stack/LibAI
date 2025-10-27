import type { ThemeConfig } from 'antd';

// Theme cho Admin Dashboard với Ant Design
export const adminTheme: ThemeConfig = {
  token: {
    // Colors - Sử dụng CSS variables để dễ quản lý
    colorPrimary: '#ff4757',
    colorSuccess: '#2ed573',
    colorWarning: '#ffa502',
    colorError: '#ff6348',
    colorInfo: '#1e90ff',

    // Background colors
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',

    // Border
    borderRadius: 12,

    // Typography
    fontFamily: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 40,
    fontSizeHeading2: 32,
    fontSizeHeading3: 28,
  },
  components: {
    Layout: {
      bodyBg: '#f5f5f5',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 8,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
  },
};

// Theme tối cho Admin Dashboard
export const adminDarkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#ff4757',
    colorSuccess: '#2ed573',
    colorWarning: '#ffa502',
    colorError: '#ff6348',
    colorInfo: '#1e90ff',

    // Dark mode colors
    colorBgContainer: '#1f1f1f',
    colorBgLayout: '#141414',
    colorBgElevated: '#262626',
    colorText: '#e8e8e8',
    colorTextSecondary: '#a8a8a8',

    borderRadius: 12,

    fontFamily: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 40,
    fontSizeHeading2: 32,
    fontSizeHeading3: 28,
  },
  components: {
    Layout: {
      bodyBg: '#141414',
      headerBg: '#1f1f1f',
      siderBg: '#1f1f1f',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 8,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
  },
};

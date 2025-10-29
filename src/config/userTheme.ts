import type { ThemeConfig } from 'antd';

// Theme cho User trải nghiệm chung (không bắt buộc AntD nhưng giữ cấu trúc đồng nhất)
export const userTheme: ThemeConfig = {
  token: {
    colorPrimary: '#9333ea',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',

    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8f9fa',
    colorWhite: '#ffffff',

    borderRadius: 12,

    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 28,
    fontSizeHeading3: 22,
  },
};

export const userDarkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#a855f7',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#60a5fa',

    colorBgContainer: '#0f0f10',
    colorBgLayout: '#0a0a0a',
    colorBgElevated: '#171717',
    colorText: '#e5e7eb',
    colorTextSecondary: '#9ca3af',
    colorWhite: '#ffffff',

    borderRadius: 12,

    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 28,
    fontSizeHeading3: 22,
  },
};




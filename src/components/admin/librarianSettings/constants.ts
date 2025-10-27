import type { GlobalToken } from "antd";

// LibrarianSettings colors using theme tokens
export const getLibrarianSettingsColors = (token: GlobalToken) => ({
  // Card backgrounds
  backgrounds: {
    card: token.colorBgContainer,
    layout: token.colorBgLayout,
    elevated: token.colorBgElevated,
  },
  
  // Status colors
  status: {
    success: token.colorSuccess,
    warning: token.colorWarning,
    error: token.colorError,
    info: token.colorInfo,
  },
  
  // Text colors
  text: {
    primary: token.colorText,
    secondary: token.colorTextSecondary,
    disabled: token.colorTextDisabled,
  },
  
  // Border colors
  borders: {
    default: token.colorBorder,
    secondary: token.colorBorderSecondary,
  },
  
  // Icon colors for different sections
  icons: {
    profile: token.colorPrimary,
    preferences: token.colorInfo,
    notifications: token.colorWarning,
    password: token.colorError,
  },
});

// Password strength colors
export const getPasswordStrengthColor = (strength: number, colors: ReturnType<typeof getLibrarianSettingsColors>) => {
  if (strength < 30) return colors.status.error;
  if (strength < 60) return colors.status.warning;
  if (strength < 80) return colors.status.info;
  return colors.status.success;
};

// Password strength text
export const getPasswordStrengthText = (strength: number) => {
  if (strength < 30) return "Yếu";
  if (strength < 60) return "Trung bình";
  if (strength < 80) return "Mạnh";
  return "Rất mạnh";
};

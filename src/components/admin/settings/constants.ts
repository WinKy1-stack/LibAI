import type { GlobalToken } from "antd";

// Settings colors using theme tokens
export const getSettingsColors = (token: GlobalToken) => ({
  // Card icon colors
  icons: {
    ai: token.colorInfo,           // Blue for AI/Robot
    system: token.colorSuccess,    // Green for System
    security: token.colorError,    // Red for Security
    notification: token.colorWarning, // Yellow for Notifications
  },
  
  // Status colors
  status: {
    enabled: token.colorSuccess,
    disabled: token.colorTextSecondary,
    warning: token.colorWarning,
    danger: token.colorError,
  },
  
  // Background colors (theme-aware)
  backgrounds: {
    card: token.colorBgContainer,
    layout: token.colorBgLayout,
    elevated: token.colorBgElevated,
  },
  
  // Border colors
  borders: {
    default: token.colorBorder,
    secondary: token.colorBorderSecondary,
  },
  
  // Text colors
  text: {
    primary: token.colorText,
    secondary: token.colorTextSecondary,
    disabled: token.colorTextDisabled,
  },
});

// Settings card types
export type SettingsCardType = 'ai' | 'system' | 'security' | 'notification';

// Get icon color by card type
export const getIconColorByType = (type: SettingsCardType, colors: ReturnType<typeof getSettingsColors>) => {
  return colors.icons[type];
};

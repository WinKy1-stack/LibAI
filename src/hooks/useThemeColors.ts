import { useUserTheme } from './useUserTheme';

interface ThemeColors {
  // Background colors
  cardBg: string;
  inputBg: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  placeholderText: string;
  
  // Border colors
  border: string;
  
  // Helper
  isDark: boolean;
  mode: 'light' | 'dark';
}

/**
 * Custom hook để quản lý tất cả màu sắc theme
 * Centralized theme colors - tránh duplicate code
 */
export function useThemeColors(): ThemeColors {
  const { mode } = useUserTheme();
  const isDark = mode === 'dark';

  return {
    // Background colors
    cardBg: isDark ? '#2D2D33' : 'rgba(255, 255, 255, 0.9)',
    inputBg: isDark ? '#2D2D33' : 'rgba(255, 255, 255, 0.95)',
    
    // Text colors
    primaryText: isDark ? '#f3f4f6' : '#111827',
    secondaryText: isDark ? '#d1d5db' : '#374151',
    placeholderText: isDark ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)',
    
    // Border colors
    border: isDark ? 'rgba(75, 85, 99, 0.8)' : 'rgba(209, 213, 219, 1)',
    
    // Helper
    isDark,
    mode,
  };
}


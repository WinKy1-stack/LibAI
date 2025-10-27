import { useState, useEffect, useMemo } from 'react';
import { theme as antdTheme } from 'antd';
import { adminTheme, adminDarkTheme } from '../config/adminTheme';
import type { ThemeConfig } from 'antd';

type ThemeMode = 'light' | 'dark';

interface UseAdminThemeReturn {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  themeConfig: ThemeConfig;
}

/**
 * Custom hook để quản lý theme cho Admin Dashboard
 * - Lưu theme vào localStorage
 * - Cập nhật data-theme attribute cho document
 * - Trả về theme config phù hợp với Ant Design
 */
export function useAdminTheme(): UseAdminThemeReturn {
  // Load theme từ localStorage hoặc mặc định là light
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  // Lưu theme vào localStorage và cập nhật data-theme attribute
  useEffect(() => {
    localStorage.setItem('admin-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Tạo theme config cho Ant Design ConfigProvider
  const themeConfig = useMemo(() => {
    const baseTheme = mode === 'dark' ? adminDarkTheme : adminTheme;
    return {
      ...baseTheme,
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    };
  }, [mode]);

  // Function để toggle giữa light và dark mode
  const toggleMode = () => {
    setModeState((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Function để set mode trực tiếp
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return {
    mode,
    setMode,
    toggleMode,
    themeConfig,
  };
}

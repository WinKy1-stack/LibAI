import { useState, useEffect, useMemo } from 'react';
import { theme as antdTheme } from 'antd';
import { userTheme, userDarkTheme } from '../config/userTheme';
import type { ThemeConfig } from 'antd';

type ThemeMode = 'light' | 'dark';

interface UseUserThemeReturn {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  themeConfig: ThemeConfig;
}

export function useUserTheme(): UseUserThemeReturn {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('user-theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('user-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const themeConfig = useMemo(() => {
    const baseTheme = mode === 'dark' ? userDarkTheme : userTheme;
    return {
      ...baseTheme,
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    } as ThemeConfig;
  }, [mode]);

  const toggleMode = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return { mode, setMode, toggleMode, themeConfig };
}




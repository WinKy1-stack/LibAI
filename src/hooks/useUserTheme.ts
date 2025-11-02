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

  // Lắng nghe thay đổi từ các component khác (như TopBar)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-theme' && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        if (newMode === 'dark' || newMode === 'light') {
          setModeState(newMode);
        }
      }
    };

    // Lắng nghe custom event cho same-window changes
    const handleCustomThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail === 'dark' || customEvent.detail === 'light') {
        setModeState(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-change', handleCustomThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-change', handleCustomThemeChange);
    };
  }, []);

  const themeConfig = useMemo(() => {
    const baseTheme = mode === 'dark' ? userDarkTheme : userTheme;
    return {
      ...baseTheme,
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    } as ThemeConfig;
  }, [mode]);

  const toggleMode = () => {
    setModeState((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      // Dispatch event
      const event = new CustomEvent('theme-change', { detail: newMode });
      window.dispatchEvent(event);
      return newMode;
    });
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    // Dispatch event
    const event = new CustomEvent('theme-change', { detail: newMode });
    window.dispatchEvent(event);
  };

  return { mode, setMode, toggleMode, themeConfig };
}




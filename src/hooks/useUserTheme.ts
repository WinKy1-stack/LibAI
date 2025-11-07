import { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../config/userTheme';

type ThemeMode = 'light' | 'dark';

interface UseUserThemeReturn {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export function useUserTheme(): UseUserThemeReturn {
  // --- INIT: Lấy theme từ localStorage hoặc mặc định ---
  const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('user-theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  };

  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  // --- Apply theme ngay khi init ---
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.classList.toggle('dark', mode === 'dark');
    
    // Apply CSS variables on initial load
    const themeVars = mode === 'dark' ? darkTheme : lightTheme;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }, [mode]);

  // --- Function áp dụng và đồng bộ theme ---
  const applyTheme = (newMode: ThemeMode) => {
    const root = document.documentElement;
    localStorage.setItem('user-theme', newMode);
    root.setAttribute('data-theme', newMode);
    root.classList.toggle('dark', newMode === 'dark');

    // Apply CSS variables to root
    const themeVars = newMode === 'dark' ? darkTheme : lightTheme;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    const event = new CustomEvent('theme-change', { detail: newMode });
    window.dispatchEvent(event);
  };

  // --- Update khi user chuyển mode ---
  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  // --- Lắng nghe thay đổi giữa tab hoặc component ---
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user-theme' && e.newValue) {
        const val = e.newValue as ThemeMode;
        if (val === 'light' || val === 'dark') setModeState(val);
      }
    };

    const handleCustom = (e: Event) => {
      const val = (e as CustomEvent<ThemeMode>).detail;
      if (val === 'light' || val === 'dark') setModeState(val);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-change', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-change', handleCustom);
    };
  }, []);

  // --- Toggle & Set mode ---
  const toggleMode = () =>
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  const setMode = (val: ThemeMode) => setModeState(val);

  return { mode, setMode, toggleMode };
}

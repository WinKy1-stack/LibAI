import { useEffect } from 'react';
import { useUserTheme } from '../hooks/useUserTheme';
import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component - Applies theme to the entire app from root level
 * This ensures CSS variables and dark class are applied immediately on page load
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode } = useUserTheme();

  // Apply theme variables on mount and whenever mode changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Ensure dark class is properly set
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return <>{children}</>;
}

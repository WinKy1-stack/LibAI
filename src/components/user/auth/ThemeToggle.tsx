import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
        mode === 'dark'
          ? 'bg-gray-800/80 border border-gray-700 text-yellow-400 hover:bg-gray-700'
          : 'bg-white/90 border border-gray-200 text-purple-600 hover:bg-gray-50'
      }`}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={mode === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {mode === 'dark' ? (
        <SunIcon className="w-5 h-5 transition-transform duration-300" />
      ) : (
        <MoonIcon className="w-5 h-5 transition-transform duration-300" />
      )}
    </button>
  );
};

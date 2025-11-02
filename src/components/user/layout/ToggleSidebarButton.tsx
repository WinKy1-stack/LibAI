import { Bars3Icon } from '@heroicons/react/24/outline';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface ToggleSidebarButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  sidebarWidth: number;
  isResizing: boolean;
}

export default function ToggleSidebarButton({ 
  isOpen, 
  onToggle, 
  sidebarWidth, 
  isResizing 
}: ToggleSidebarButtonProps) {
  const colors = useThemeColors();

  return (
    <div 
      className="fixed z-50"
      style={{
        top: 'calc(64px + 16px)',
        left: isOpen ? `${sidebarWidth + 16}px` : '16px',
        transition: isResizing ? 'none' : 'left 0.3s ease-in-out',
      }}
    >
      <button
        onClick={onToggle}
        className="rounded-xl px-2 py-2 shadow-md backdrop-blur-xl border transition-all hover:scale-105"
        style={{
          background: colors.isDark ? 'rgba(30, 35, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          color: colors.primaryText,
        }}
        title={isOpen ? 'Ẩn lịch sử' : 'Hiện lịch sử'}
      >
        <Bars3Icon className="w-4 h-4" />
      </button>
    </div>
  );
}


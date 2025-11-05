import { Bars3Icon } from '@heroicons/react/24/outline';

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
        className="rounded-lg p-2 shadow-md backdrop-blur-lg border transition-all hover:scale-105
                   bg-background-secondary/80 border-border-primary text-text-primary"
        title={isOpen ? 'Ẩn lịch sử' : 'Hiện lịch sử'}
      >
        <Bars3Icon className="w-5 h-5" />
      </button>
    </div>
  );
}
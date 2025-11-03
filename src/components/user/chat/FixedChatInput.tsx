import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface FixedChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  sidebarWidth: number;
  isSidebarOpen: boolean;
  isAuthenticated: boolean;
  isResizing: boolean;
}

export default function FixedChatInput({
  value,
  onChange,
  onSubmit,
  loading,
  sidebarWidth,
  isSidebarOpen,
  isAuthenticated,
  isResizing,
}: FixedChatInputProps) {
  const colors = useThemeColors();

  return (
    <div 
      className="fixed bottom-4"
      style={{
        left: isAuthenticated && isSidebarOpen ? `calc(${sidebarWidth / 2}px + 50%)` : '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '800px',
        zIndex: 50,
        transition: isResizing ? 'none' : 'left 0.3s ease-in-out',
      }}
    >
      <div 
        className="rounded-2xl shadow-2xl backdrop-blur-xl border transition-all"
        style={{
          background: colors.isDark ? 'rgba(100, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          padding: '12px 16px',
        }}
      >
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <span className="text-xl">💬</span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tiếp tục hỏi thêm câu hỏi..."
            className="flex-1 bg-transparent outline-none text-base placeholder:text-gray-500"
            style={{
              color: colors.primaryText,
            }}
            disabled={loading}
          />
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: colors.isDark ? '#ffffff' : '#111827',
              opacity: !value.trim() || loading ? 0.5 : 1,
              cursor: !value.trim() || loading ? 'not-allowed' : 'pointer',
            }}
            disabled={!value.trim() || loading}
          >
            <span className="text-sm">{loading ? 'Đang gửi...' : 'Gửi'}</span>
            <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
          </button>
        </form>
      </div>
    </div>
  );
}


import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

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
      <div className="rounded-2xl shadow-lg bg-background-primary/80 backdrop-blur-md border border-border-primary p-3">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tiếp tục hỏi thêm câu hỏi..."
            className="flex-1 bg-transparent outline-none text-base text-text-primary placeholder:text-text-placeholder"
            disabled={loading}
          />
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-purple-600 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 active:scale-95"
            disabled={!value.trim() || loading}
          >
            <span className="text-sm">{loading ? 'Đang gửi...' : 'Gửi'}</span>
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
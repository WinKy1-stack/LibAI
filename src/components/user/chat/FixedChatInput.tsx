import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

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
        left:
          isAuthenticated && isSidebarOpen
            ? `calc(${sidebarWidth / 2}px + 50%)`
            : "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "800px",
        zIndex: 50,
        transition: isResizing ? "none" : "left 0.3s ease-in-out",
      }}
    >
      <div
        className="rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] 
                   dark:shadow-[0_4px_28px_rgba(255,255,255,0.06)]
                   bg-background-primary/70 backdrop-blur-xl p-3 transition-all duration-300"
      >
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nhập câu hỏi hoặc yêu cầu của bạn..."
            className="flex-1 bg-transparent outline-none text-base text-text-primary placeholder:text-text-placeholder"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!value.trim() || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm 
                        transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] 
                        shadow-[0_2px_10px_rgba(217,70,239,0.25)]
                        active:scale-95 ${
                          !value.trim() || loading
                            ? "opacity-50 cursor-not-allowed bg-gradient-primary"
                            : "bg-gradient-primary hover:brightness-110 hover:shadow-[0_0_14px_rgba(217,70,239,0.4)]"
                        }`}
          >
            <span>{loading ? "Đang gửi..." : "Gửi"}</span>
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

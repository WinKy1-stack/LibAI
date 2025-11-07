import { useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SparklesIcon,
  FireIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useChatHistory } from "../../../hooks/useChatHistory";
import type { Conversation } from "../../../services/chatService";

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const { conversations, loadConversations, loading } = useChatHistory();

  useEffect(() => {
    loadConversations(50, 0);
  }, [loadConversations]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const min = Math.floor(diff / 60000);
    const hour = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);

    if (min < 1) return "Vừa xong";
    if (min < 60) return `${min} phút trước`;
    if (hour < 24) return `${hour} giờ trước`;
    if (day < 7) return `${day} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <aside
      className="flex flex-col h-full bg-background-secondary 
                 shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.4)]
                 transition-all duration-300"
    >
      {/* Header */}
      <div className="px-4 py-4">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-button-primary text-button-text font-semibold shadow-md
                     transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Cuộc trò chuyện mới</span>
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-full text-text-secondary">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-color-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-text-secondary text-center px-4">
            <ChatBubbleLeftRightIcon className="w-10 h-10 opacity-40 mb-3" />
            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          conversations.map((c: Conversation) => {
            const active = c.conversation_id === currentConversationId;
            return (
              <button
                key={c.conversation_id}
                onClick={() => onSelectConversation(c.conversation_id)}
                className={`group w-full text-left p-3 rounded-xl transition-all duration-200 relative overflow-hidden
                  ${
                    active
                      ? "bg-button-primary shadow-[0_0_0_2px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]"
                      : "bg-background-primary/60 hover:bg-background-hover hover:shadow-sm"
                  }`}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-button-primary rounded-l-xl shadow-[0_0_6px_rgba(0,0,0,0.1)]" />
                )}

                <div className="flex items-center justify-between mb-1.5 relative z-[1]">
                  <p
                    className={`text-sm font-semibold truncate ${
                      active
                        ? "text-color-primary brightness-110"
                        : "text-text-primary group-hover:text-color-primary"
                    }`}
                  >
                    Cuộc trò chuyện
                  </p>
                  <span className="text-xs text-text-secondary/80">
                    {formatDate(c.started_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary/90 relative z-[1]">
                  <FireIcon
                    className={`w-3.5 h-3.5 ${
                      active
                        ? "text-color-primary/95 drop-shadow-sm"
                        : "text-text-secondary/70"
                    }`}
                  />
                  <span className={active ? "text-text-primary/90" : ""}>
                    {c.message_count || 0} tin
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 mt-auto bg-background-tertiary/40 shadow-[0_-2px_6px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                        bg-background-secondary/70 backdrop-blur-sm">
          <SparklesIcon className="w-4 h-4 text-color-primary" />
          <p className="text-sm font-medium text-text-primary">
            {conversations.length} cuộc trò chuyện
          </p>
        </div>
      </footer>
    </aside>
  );
}

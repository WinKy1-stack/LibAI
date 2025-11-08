import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SparklesIcon,
  FireIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useChatHistory } from "../../../hooks/useChatHistory";
import type { Conversation } from "../../../services/chatService";

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onConversationDeleted?: (conversationId: string) => void;
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onConversationDeleted,
}: ConversationSidebarProps) {
  const { conversations, loadConversations, loading } = useChatHistory();

  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  const [softDeletedIds, setSoftDeletedIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Record<string, number>>({});
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);
  const [isUndoVisible, setIsUndoVisible] = useState(false);

  // Load conversations khi mount
  useEffect(() => {
    loadConversations(50, 0);
  }, [loadConversations]);

  // ✅ Cleanup timers khi component unmount → tránh memory leak
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timer => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, []);

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

  const visibleConversations = useMemo(() => {
    if (!softDeletedIds.size) return conversations;
    return conversations.filter((c: Conversation) => !softDeletedIds.has(c.conversation_id));
  }, [conversations, softDeletedIds]);

  // ✅ Xóa thật ngay lập tức, không đợi 5s
  const finalizeDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
      });
      
      // ✅ Validate response trước khi xử lý
      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }

      // ✅ Check content-type nếu có body response
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        await res.json(); // Parse nếu là JSON
      }
      
      // ✅ Callback để clear messages ở parent
      if (onConversationDeleted) {
        onConversationDeleted(id);
      }
      
      // ✅ Refresh list ngay
      loadConversations(50, 0);
    } catch (err) {
      console.error("❌ Lỗi xóa conversation:", err);
      undoDelete(id, { silent: true });
    } finally {
      if (timersRef.current[id]) {
        window.clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
      if (lastDeletedId === id) {
        setIsUndoVisible(false);
        setLastDeletedId(null);
      }
    }
  };

  // ✅ Xóa ngay không đợi animation
  const handleDeleteClick = (id: string) => {
    // Fade out nhanh
    setFadingIds((prev) => new Set(prev).add(id));
    
    setTimeout(() => {
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      
      // Ẩn khỏi UI
      setSoftDeletedIds((prev) => new Set(prev).add(id));
      
      // ✅ XÓA NGAY, KHÔNG ĐỢI 5s
      finalizeDelete(id);
      
      // Snackbar undo 3s
      setLastDeletedId(id);
      setIsUndoVisible(true);
      const t = window.setTimeout(() => {
        setIsUndoVisible(false);
        setLastDeletedId(null);
      }, 3000);
      timersRef.current[id] = t;
    }, 180);
  };

  // ✅ Undo delete với check existence
  const undoDelete = async (id: string, opts?: { silent?: boolean }) => {
    // Cleanup timer trước
    if (timersRef.current[id]) {
      window.clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }

    // ✅ CRITICAL: Check conversation có tồn tại không trước khi undo
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "GET",
        credentials: "include",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (res.ok) {
        // ✅ Conversation vẫn tồn tại → có thể undo
        setSoftDeletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        
        if (!opts?.silent) {
          if (lastDeletedId === id) {
            setIsUndoVisible(false);
            setLastDeletedId(null);
          }
        }
        
        // Reload để khôi phục
        loadConversations(50, 0);
        console.log(`✅ Undo successful: conversation ${id} restored`);
      } else {
        // ❌ Conversation đã bị xóa → không thể undo
        console.warn(`⚠️ Cannot undo: conversation ${id} no longer exists (status: ${res.status})`);
        
        if (!opts?.silent) {
          if (lastDeletedId === id) {
            setIsUndoVisible(false);
            setLastDeletedId(null);
          }
        }
        
        // Vẫn reload để sync state
        loadConversations(50, 0);
      }
    } catch (err) {
      console.error("❌ Error checking conversation existence:", err);
      
      // Fallback: vẫn thử undo để đảm bảo UX
      setSoftDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      
      if (!opts?.silent) {
        if (lastDeletedId === id) {
          setIsUndoVisible(false);
          setLastDeletedId(null);
        }
      }
      
      loadConversations(50, 0);
    }
  };

  return (
    <aside
      className="relative flex flex-col h-full bg-background-secondary 
                 shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.4)]
                 transition-all duration-300"
    >
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

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-full text-text-secondary">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-color-primary" />
          </div>
        ) : visibleConversations.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-text-secondary text-center px-4">
            <ChatBubbleLeftRightIcon className="w-10 h-10 opacity-40 mb-3" />
            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          visibleConversations.map((c: Conversation) => {
            const active = c.conversation_id === currentConversationId;
            const isFading = fadingIds.has(c.conversation_id);

            return (
              <button
                key={c.conversation_id}
                onClick={() => onSelectConversation(c.conversation_id)}
                className={[
                  "group w-full text-left p-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  active
                    ? "bg-button-primary shadow-[0_0_0_2px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]"
                    : "bg-background-primary/60 hover:bg-background-hover hover:shadow-sm",
                  "transform transition duration-200 ease-out",
                  isFading ? "opacity-0 translate-y-1 scale-[0.98] pointer-events-none" : "opacity-100",
                ].join(" ")}
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

                  <div className="flex items-center gap-2">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(c.conversation_id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(c.conversation_id);
                        }
                      }}
                      className="p-1 rounded-md opacity-70 transition cursor-pointer
                                 hover:opacity-100 hover:text-red-500 focus:outline-none
                                 focus:ring-2 focus:ring-red-500/40"
                      title="Xóa cuộc trò chuyện"
                      role="button"
                      tabIndex={0}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </div>

                    <span className="text-xs text-text-secondary/80">
                      {formatDate(c.started_at)}
                    </span>
                  </div>
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

      <footer className="p-4 mt-auto bg-background-tertiary/40 shadow-[0_-2px_6px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                        bg-background-secondary/70 backdrop-blur-sm">
          <SparklesIcon className="w-4 h-4 text-color-primary" />
          <p className="text-sm font-medium text-text-primary">
            {visibleConversations.length} cuộc trò chuyện
          </p>
        </div>
      </footer>

      {isUndoVisible && lastDeletedId && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-4 z-50
                     rounded-lg px-4 py-2 shadow-md
                     bg-background-primary text-text-primary
                     border border-black/5 dark:border-white/10
                     animate-[fadeIn_150ms_ease-out]"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">Đã xóa</span>
            <button
              onClick={() => undoDelete(lastDeletedId)}
              className="text-sm font-semibold underline-offset-2 hover:underline hover:text-color-primary transition"
            >
              Hoàn tác
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </aside>
  );
}
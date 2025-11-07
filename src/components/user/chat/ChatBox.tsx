import { useState, useRef, useEffect } from "react";
import { useChatContext } from "../../../hooks/useChatContext";
import ChatMessages from "./ChatMessages";
import type { ChatMessage as LocalChatMessage } from "./ChatMessages";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

interface ChatBoxProps {
  onClose?: () => void;
  context?: string;
}

export default function ChatBox({ onClose, context }: ChatBoxProps) {
  const {
    messages: historyMessages,
    conversationId,
    loading,
    error,
    sendMessage,
    startNewConversation,
    endConversation,
  } = useChatContext();

  const [inputMessage, setInputMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const localMessages: LocalChatMessage[] = historyMessages.map((msg, index) => ({
    id: `${msg.timestamp || Date.now()}-${index}`,
    type: msg.role === "user" ? "user" : "bot",
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  }));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    const messageToSend = inputMessage.trim();
    setInputMessage("");
    try {
      await sendMessage(messageToSend, context);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = async () => {
    if (conversationId) {
      try {
        await endConversation();
      } catch (err) {
        console.error("Failed to end conversation:", err);
      }
    }
    startNewConversation();
  };

  return (
    <div className="flex flex-col h-full bg-background-primary rounded-2xl shadow-2xl overflow-hidden border border-border-primary/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-background-secondary/90 to-background-primary/80 border-b border-border-primary/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-inner">
            <ClockIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Trợ lý AI
            </h3>
            {conversationId && (
              <p className="text-xs text-text-secondary">
                {localMessages.length} tin nhắn
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg text-text-secondary hover:bg-background-hover transition-all active:scale-95 disabled:opacity-50"
            onClick={handleNewConversation}
            title="Cuộc trò chuyện mới"
            disabled={loading}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              className="p-2 rounded-lg text-text-secondary hover:bg-background-hover transition-all active:scale-95"
              onClick={onClose}
              title="Đóng"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto p-4 bg-background-primary scrollbar-thin scrollbar-thumb-border-primary/30 scrollbar-thumb-rounded-md">
        {localMessages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary animate-fadeIn">
            <ChatBubbleLeftEllipsisIcon className="w-12 h-12 opacity-50" />
            <p className="mt-3 text-sm">Bắt đầu cuộc trò chuyện</p>
          </div>
        )}
        <ChatMessages messages={localMessages} isTyping={loading} />

        {/* subtle top/bottom gradient */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background-primary to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background-primary to-transparent" />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-3 p-3 bg-background-secondary/80 border-t border-border-primary/60 backdrop-blur-md">
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn của bạn..."
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-2.5 bg-input-background border border-border-primary rounded-xl text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     transition-all duration-200 disabled:bg-background-tertiary"
          rows={1}
          disabled={loading}
        />
        <button
          className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center
                     shadow-md hover:shadow-lg active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
          title="Gửi"
        >
          <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
        </button>
      </div>
    </div>
  );
}

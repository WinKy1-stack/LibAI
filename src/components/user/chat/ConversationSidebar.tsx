import { useEffect } from 'react';
import { ChatBubbleLeftRightIcon, PlusIcon, SparklesIcon, ClockIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useChatHistory } from '../../../hooks/useChatHistory';
import type { Conversation } from '../../../services/chatService';

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
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex flex-col h-full bg-background-secondary border-r border-border-primary">
      {/* Header - New Conversation Button */}
      <div className="px-4 py-4 border-b border-border-primary">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-button-primary-bg text-button-primary-text font-semibold transition-transform duration-200 hover:scale-105 active:scale-100"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Cuộc trò chuyện mới</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-text-secondary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-4 text-text-secondary">
            <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation: Conversation) => {
              const isActive = currentConversationId === conversation.conversation_id;
              return (
                <button
                  key={conversation.conversation_id}
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-900/50'
                      : 'hover:bg-background-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-semibold truncate ${
                      isActive ? 'text-purple-700 dark:text-purple-300' : 'text-text-primary'
                    }`}>
                      Cuộc trò chuyện
                    </p>
                    <span className="text-xs text-text-secondary">
                      {formatDate(conversation.started_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <FireIcon className="w-3 h-3" />
                    <span>{conversation.message_count || 0} tin</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-primary">
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background-tertiary">
          <SparklesIcon className="w-4 h-4 text-purple-500" />
          <p className="text-sm font-semibold text-text-primary">{conversations.length} cuộc trò chuyện</p>
        </div>
      </div>
    </div>
  );
}
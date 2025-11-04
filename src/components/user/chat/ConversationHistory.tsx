import { useEffect, useState } from 'react';
import { useChatContext } from '../../../hooks/useChatContext';
import type { Conversation } from '../../../services/chatService';
import { ClockIcon, CheckCircleIcon, ArrowPathIcon, ServerIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ConversationHistory() {
  const { conversations, loading, error, loadConversations, loadHistory } = useChatContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleLoadConversation = async (conversation: Conversation) => {
    setSelectedId(conversation.conversation_id);
    try {
      await loadHistory(conversation.conversation_id);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleRefresh = () => {
    loadConversations();
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-text-secondary">
        <ArrowPathIcon className="w-6 h-6 animate-spin" />
        <p className="mt-3 text-sm">Đang tải cuộc trò chuyện...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-primary rounded-xl shadow-lg overflow-hidden border border-border-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background-secondary border-b border-border-primary">
        <h3 className="flex items-center text-base font-semibold text-text-primary gap-2">
          <ClockIcon className="w-5 h-5" />
          Lịch sử cuộc trò chuyện
        </h3>
        <button
          className="p-2 rounded-lg text-text-secondary hover:bg-background-hover transition-colors disabled:opacity-50"
          onClick={handleRefresh}
          disabled={loading}
          title="Tải lại"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center h-full p-10 text-red-600 dark:text-red-400">
          <ServerIcon className="w-12 h-12 opacity-50" />
          <p className="mt-3 text-sm font-semibold">Không thể tải lịch sử</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full p-10 text-text-secondary text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 opacity-50" />
          <p className="mt-3 text-sm font-semibold">Chưa có cuộc trò chuyện nào</p>
          <p className="mt-1 text-xs">Bắt đầu trò chuyện để xem lịch sử của bạn tại đây.</p>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv.conversation_id}
            className={`rounded-lg p-3 cursor-pointer transition-all duration-200 border
              ${selectedId === conv.conversation_id
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                : 'bg-background-primary border-border-primary hover:bg-background-hover hover:border-gray-300 dark:hover:border-gray-600'
              }`
            }
            onClick={() => handleLoadConversation(conv)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                  {conv.meta.model || 'default'}
                </span>
                <span className="text-xs text-text-secondary uppercase">
                  {conv.meta.channel}
                </span>
              </div>
              <div>
                {conv.ended_at ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" title="Đã kết thúc" />
                ) : (
                  <ClockIcon className="w-4 h-4 text-amber-500" title="Đang hoạt động" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-primary font-medium">
                {conv.message_count || 0} tin nhắn
              </span>
              <span className="text-text-secondary text-xs">
                {formatDate(conv.started_at)}
              </span>
            </div>

            {conv.ended_at && (
              <div className="pt-2 mt-2 border-t border-border-primary">
                <small className="text-xs text-text-secondary">
                  Kết thúc: {formatDate(conv.ended_at)}
                </small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
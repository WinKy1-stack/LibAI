import { useEffect, useState } from 'react';
import { useChatContext } from '../../../hooks/useChatContext';
import type { Conversation } from '../../../services/chatService';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400">
        <ArrowPathIcon className="w-6 h-6 animate-spin" />
        <p className="mt-3 text-sm">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <h3 className="flex items-center text-base font-semibold text-gray-800">
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
          Conversation History
        </h3>
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 text-gray-400 text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 opacity-30" />
          <p className="mt-3 text-sm">No conversations yet</p>
          <small className="mt-1 text-xs text-gray-300">Start chatting to see your history</small>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.conversation_id}
            className={`bg-white border rounded-xl p-4 mb-3 cursor-pointer transition-all ${
              selectedId === conversation.conversation_id
                ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100'
                : 'border-gray-200 hover:border-purple-600 hover:shadow-md'
            }`}
            onClick={() => handleLoadConversation(conversation)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
                  {conversation.meta.model}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {conversation.meta.channel}
                </span>
              </div>
              <div>
                {conversation.ended_at ? (
                  <CheckCircleIcon
                    className="w-4 h-4 text-green-500"
                    title="Completed"
                  />
                ) : (
                  <ClockIcon
                    className="w-4 h-4 text-amber-500"
                    title="Active"
                  />
                )}
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">
                  {conversation.message_count || 0} messages
                </span>
                <span className="text-gray-400 text-xs">
                  {formatDate(conversation.started_at)}
                </span>
              </div>
            </div>

            {conversation.ended_at && (
              <div className="pt-2 border-t border-gray-100">
                <small className="text-xs text-gray-400">
                  Ended: {formatDate(conversation.ended_at)}
                </small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

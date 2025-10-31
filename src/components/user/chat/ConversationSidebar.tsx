import { useEffect } from 'react';
import { ChatBubbleLeftIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useChatHistory } from '../../../hooks/useChatHistory';
import type { Conversation } from '../../../services/chatService';

type ThemeMode = 'light' | 'dark';

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  themeMode: ThemeMode;
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  themeMode,
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

  const isDark = themeMode === 'dark';

  return (
    <div 
      className={`flex flex-col h-full border-r shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Premium Header with Gradient Accent */}
      <div className={`p-4 border-b relative overflow-hidden ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-50" />
        
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md relative group border-2 font-semibold ${
            isDark 
              ? 'bg-slate-800 border-slate-600 text-gray-100 hover:bg-slate-700 hover:border-slate-500' 
              : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          {/* Gradient icon */}
          <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-110 transition-transform duration-200">
            <PlusIcon className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span>Cuộc trò chuyện mới</span>
          <SparklesIcon className={`w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        </button>
      </div>

      {/* Conversations List - Premium Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/50">
        {loading ? (
          <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="mt-2 text-sm animate-pulse">Đang tải...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <ChatBubbleLeftIcon className="w-8 h-8 opacity-30" />
            </div>
            <p className="text-sm font-medium mb-1">Chưa có cuộc trò chuyện</p>
            <p className="text-xs opacity-70">Bắt đầu chat để lưu lịch sử</p>
          </div>
        ) : (
          <div className="py-2 animate-fadeIn">
            {conversations.map((conversation: Conversation) => {
              const isActive = currentConversationId === conversation.conversation_id;
              
              return (
                <button
                  key={conversation.conversation_id}
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  className={`w-full p-3 mx-2 my-1 rounded-xl text-left transition-all duration-200 group relative hover:translate-x-1 ${
                    isActive 
                      ? `border-l-4 border-purple-500 ${isDark ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-r from-purple-50 to-blue-50'}` 
                      : `border-l-4 border-transparent ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`
                  } ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    {/* Premium Icon with gradient */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div 
                        className={`p-2 rounded-xl transition-all duration-200 shadow-sm group-hover:scale-105 ${
                          isActive 
                            ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                            : isDark ? 'bg-slate-700' : 'bg-gray-100'
                        }`}
                      >
                        <ChatBubbleLeftIcon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Title and time */}
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold truncate">
                          Cuộc trò chuyện
                        </p>
                        <span className={`text-xs flex-shrink-0 opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(conversation.started_at)}
                        </span>
                      </div>
                      
                      {/* Metadata with premium badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : isDark ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          {conversation.message_count || 0} tin
                        </span>
                        
                        <span className={`text-xs opacity-60 truncate max-w-[100px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conversation.meta.model}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium Footer with Stats */}
      <div 
        className={`p-4 border-t relative overflow-hidden ${
          isDark 
            ? 'border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900' 
            : 'border-gray-100 bg-gradient-to-b from-white to-gray-50'
        }`}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-2 h-2 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
          <span className={`text-xs font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {conversations.length}
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            cuộc trò chuyện
          </span>
          <SparklesIcon className="w-3.5 h-3.5 ml-1 opacity-40 text-purple-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

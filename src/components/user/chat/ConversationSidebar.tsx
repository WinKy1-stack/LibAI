import { useEffect } from 'react';
import { ChatBubbleLeftIcon, PlusIcon, SparklesIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
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
      className={`flex flex-col h-full border-r transition-all duration-300 relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-700/50' 
          : 'bg-gradient-to-b from-white via-gray-50 to-white border-gray-200'
      }`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-1/3 bg-gradient-to-br ${
          isDark 
            ? 'from-purple-500/20 via-transparent to-transparent' 
            : 'from-purple-200/40 via-transparent to-transparent'
        } blur-3xl animate-pulse`} style={{ animationDuration: '3s' }} />
        <div className={`absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-tl ${
          isDark 
            ? 'from-blue-500/20 via-transparent to-transparent' 
            : 'from-blue-200/40 via-transparent to-transparent'
        } blur-3xl animate-pulse`} style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      {/* Ultra Premium Header */}
      <div className={`p-4 border-b relative z-10 backdrop-blur-sm ${
        isDark ? 'border-slate-700/50 bg-slate-900/50' : 'border-gray-200/50 bg-white/50'
      }`}>
        {/* Glowing top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <button
          onClick={onNewConversation}
          className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
            isDark 
              ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500' 
              : 'bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500 hover:from-purple-400 hover:via-purple-300 hover:to-blue-400'
          } shadow-lg hover:shadow-2xl hover:shadow-purple-500/50`}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          
          <div className="relative flex items-center justify-center gap-3 px-4 py-3.5">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl group-hover:rotate-90 transition-transform duration-300">
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">Cuộc trò chuyện mới</span>
            <SparklesIcon className="w-4 h-4 text-white/80 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </button>
      </div>

      {/* Conversations List với premium scrollbar */}
      <div className={`flex-1 overflow-y-auto relative z-10 custom-scrollbar ${
        isDark ? 'scrollbar-dark' : 'scrollbar-light'
      }`}>
        {loading ? (
          <div className="p-6 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-purple-500 animate-spin" style={{ animationDuration: '1.5s' }} />
              <div className={`absolute inset-2 rounded-full ${isDark ? 'bg-slate-900' : 'bg-white'}`} />
              <SparklesIcon className="absolute inset-0 m-auto w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            <p className={`text-sm font-medium animate-pulse ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Đang tải lịch sử...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center relative overflow-hidden ${
              isDark ? 'bg-slate-800' : 'bg-gray-100'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse" />
              <ChatBubbleLeftIcon className={`w-10 h-10 relative z-10 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Chưa có cuộc trò chuyện
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Bắt đầu chat để lưu lịch sử
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2 px-2 space-y-1.5">
            {conversations.map((conversation: Conversation, index: number) => {
              const isActive = currentConversationId === conversation.conversation_id;
              
              return (
                <button
                  key={conversation.conversation_id}
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  className={`w-full group relative overflow-hidden rounded-xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    isActive 
                      ? `shadow-lg ${
                          isDark 
                            ? 'bg-gradient-to-r from-purple-600/30 via-purple-500/30 to-blue-600/30 shadow-purple-500/20' 
                            : 'bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 shadow-purple-200/50'
                        }` 
                      : `${
                          isDark 
                            ? 'hover:bg-slate-800/80 bg-slate-900/30' 
                            : 'hover:bg-white hover:shadow-md bg-transparent'
                        }`
                  }`}
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animation: 'slideInFromLeft 0.3s ease-out forwards'
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 rounded-r-full shadow-lg shadow-purple-500/50 animate-pulse" />
                  )}
                  
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-500/5 to-blue-500/5' 
                      : 'bg-gradient-to-r from-purple-100/50 to-blue-100/50'
                  }`} />
                  
                  <div className="relative p-3 flex items-start gap-3">
                    {/* Premium Icon với animated gradient */}
                    <div className="flex-shrink-0 mt-1">
                      <div 
                        className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden ${
                          isActive 
                            ? 'bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/50' 
                            : isDark 
                              ? 'bg-slate-700/80 group-hover:bg-slate-600' 
                              : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                        )}
                        <ChatBubbleLeftIcon
                          className={`w-4 h-4 relative z-10 ${
                            isActive ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Title và time */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className={`text-sm font-bold truncate ${
                          isActive 
                            ? isDark ? 'text-white' : 'text-gray-900' 
                            : isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          Cuộc trò chuyện
                        </p>
                        <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${
                          isActive 
                            ? isDark ? 'text-purple-300' : 'text-purple-600' 
                            : isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatDate(conversation.started_at)}</span>
                        </div>
                      </div>
                      
                      {/* Metadata với premium badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30' 
                              : isDark 
                                ? 'bg-slate-700/50 text-gray-400 border border-slate-600/30' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                          } ${isActive ? 'shadow-lg shadow-purple-500/20' : ''}`}
                        >
                          <FireIcon className="w-3 h-3" />
                          {conversation.message_count || 0} tin
                        </span>
                        
                        <span className={`text-xs font-medium truncate max-w-[100px] px-2 py-1 rounded-full ${
                          isDark ? 'bg-slate-800/50 text-gray-400' : 'bg-gray-50 text-gray-600'
                        }`}>
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

      {/* Ultra Premium Footer */}
      <div 
        className={`p-4 border-t relative z-10 backdrop-blur-sm ${
          isDark 
            ? 'border-slate-700/50 bg-gradient-to-t from-slate-950/80 to-slate-900/50' 
            : 'border-gray-200/50 bg-gradient-to-t from-white to-gray-50/50'
        }`}
      >
        {/* Top glowing border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        
        <div className={`flex items-center justify-center gap-3 p-3 rounded-xl relative overflow-hidden ${
          isDark ? 'bg-slate-800/50' : 'bg-white/80'
        } border ${isDark ? 'border-slate-700/50' : 'border-gray-200'} shadow-lg`}>
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient" />
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse shadow-lg shadow-purple-500/50" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-ping" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent`}>
                {conversations.length}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                cuộc trò chuyện
              </span>
            </div>
            
            <SparklesIcon className="w-4 h-4 text-purple-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Custom CSS cho animations */}
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          to {
            transform: translateX(100%);
          }
        }

        @keyframes gradient {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-dark::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }

        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7 0%, #3b82f6 100%);
          border-radius: 10px;
        }

        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9333ea 0%, #2563eb 100%);
        }

        .scrollbar-light::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
        }

        .scrollbar-light::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7 0%, #3b82f6 100%);
          border-radius: 10px;
        }

        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9333ea 0%, #2563eb 100%);
        }
      `}</style>
    </div>
  );
}
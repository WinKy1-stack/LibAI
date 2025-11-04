import { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../../../hooks/useChatContext';
import ChatMessages from './ChatMessages';
import type { ChatMessage as LocalChatMessage } from './ChatMessages';
import { PaperAirplaneIcon, XMarkIcon, ArrowPathIcon, ClockIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

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

  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const localMessages: LocalChatMessage[] = historyMessages.map((msg, index) => ({
    id: `${msg.timestamp || Date.now()}-${index}`,
    type: msg.role === 'user' ? 'user' : 'bot',
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  }));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    try {
      await sendMessage(messageToSend, context);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = async () => {
    if (conversationId) {
      try {
        await endConversation();
      } catch (err) {
        console.error('Failed to end conversation:', err);
      }
    }
    startNewConversation();
  };

  return (
    <div className="flex flex-col h-full bg-background-primary rounded-xl shadow-lg overflow-hidden border border-border-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background-secondary border-b border-border-primary">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Trợ lý AI</h3>
            {conversationId && (
              <p className="text-xs text-text-secondary">
                {localMessages.length} tin nhắn
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg text-text-secondary hover:bg-background-hover transition-colors disabled:opacity-50"
            onClick={handleNewConversation}
            title="Cuộc trò chuyện mới"
            disabled={loading}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button 
              className="p-2 rounded-lg text-text-secondary hover:bg-background-hover transition-colors"
              onClick={onClose} 
              title="Đóng"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-background-primary">
        {localMessages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <ChatBubbleLeftEllipsisIcon className="w-12 h-12 opacity-50" />
            <p className="mt-3 text-sm">Bắt đầu cuộc trò chuyện</p>
          </div>
        )}
        <ChatMessages messages={localMessages} isTyping={loading} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-3 p-3 bg-background-secondary border-t border-border-primary">
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn của bạn..."
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-2.5 bg-input-background border border-border-primary rounded-xl text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                     transition-all disabled:bg-background-tertiary"
          rows={1}
          disabled={loading}
        />
        <button
          className="w-11 h-11 rounded-xl bg-button-primary-bg text-button-primary-text flex items-center justify-center
                     transition-all hover:bg-purple-700 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
          title="Gửi"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
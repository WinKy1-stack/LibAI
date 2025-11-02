import { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../../../hooks/useChatContext';
import ChatMessages from './ChatMessages';
import type { ChatMessage as LocalChatMessage } from './ChatMessages';
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

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
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Convert history messages to local format
  const localMessages: LocalChatMessage[] = historyMessages.map((msg, index) => ({
    id: `${msg.timestamp || Date.now()}-${index}`,
    type: msg.role === 'user' ? 'user' : 'bot',
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  }));

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      await sendMessage(messageToSend, context);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle new conversation
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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white border-b border-purple-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold">Chat Assistant</h3>
            {conversationId && (
              <p className="text-xs opacity-90 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                <span>{localMessages.length} messages</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* New Conversation Button */}
          <button
            className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNewConversation}
            title="New conversation"
            disabled={loading}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          
          {/* Close Button */}
          {onClose && (
            <button 
              className="p-2 rounded-lg hover:bg-white/20 transition-colors" 
              onClick={onClose} 
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
        {localMessages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
            <p className="mt-3 text-sm">Start a conversation</p>
          </div>
        )}
        <ChatMessages messages={localMessages} isTyping={isTyping} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-5 py-3 bg-red-50 border-t border-b border-red-200 text-red-600 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-3 p-4 bg-white border-t border-gray-200">
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-600 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={1}
          disabled={loading}
        />
        <button
          className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

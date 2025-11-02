import { useRef, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { formatTime } from '../utils';
import { useThemeColors } from '../../../hooks/useThemeColors';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const colors = useThemeColors();

  // Auto scroll to bottom khi có message mới
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="w-full mb-6 py-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex gap-2 mb-2 animate-[fadeIn_0.3s_ease-out] ${
            message.type === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            message.type === 'bot' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_2px_8px_rgba(236,72,153,0.25)]' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_2px_8px_rgba(59,130,246,0.25)]'
          }`}>
            {message.type === 'bot' ? (
              <SparklesIcon className="w-4 h-4 text-white" />
            ) : (
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1 max-w-[80%]">
            <div 
              className={`py-2 px-3 rounded-2xl leading-relaxed text-base break-words shadow-sm ${
                message.type === 'bot'
                  ? 'rounded-bl-sm'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 rounded-br-sm shadow-[0_1px_4px_rgba(147,51,234,0.25)]'
              }`}
              style={message.type === 'bot' ? {
                backgroundColor: colors.isDark ? '#3B3B40' : '#ffffff',
                color: colors.isDark ? '#ffffff' : '#111827',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(209, 213, 219, 1)',
              } : {
                color: colors.isDark ? '#ffffff' : '#111827',
              }}
            >
              {message.content}
            </div>
            <span className={`text-xs text-gray-500/50 px-0.5 ${
              message.type === 'user' ? 'text-right' : ''
            }`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex gap-2 mb-2 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_2px_8px_rgba(236,72,153,0.25)] flex items-center justify-center shrink-0">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-1 max-w-[80%]">
            <div 
              className="flex gap-1 py-2 px-3 rounded-2xl rounded-bl-sm w-fit shadow-sm"
              style={{
                backgroundColor: colors.isDark ? '#3B3B40' : '#ffffff',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(209, 213, 219, 1)',
              }}
            >
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[typingDot_1.4s_infinite]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[typingDot_1.4s_infinite]" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[typingDot_1.4s_infinite]" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={chatMessagesEndRef} />
    </div>
  );
}


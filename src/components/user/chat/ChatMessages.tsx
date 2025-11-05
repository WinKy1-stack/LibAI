import { useRef, useEffect } from 'react';
import { SparklesIcon, UserIcon } from '@heroicons/react/24/solid';
import { formatTime } from '../utils';

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

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="w-full mb-6 py-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex gap-3 animate-[fadeIn_0.3s_ease-out] ${
            message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${message.type === 'bot'
              ? 'bg-purple-600'
              : 'bg-gray-300 dark:bg-gray-600'
            }`
          }>
            {message.type === 'bot'
              ? <SparklesIcon className="w-5 h-5 text-white" />
              : <UserIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            }
          </div>

          {/* Message Bubble */}
          <div className={`flex-1 flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${
            message.type === 'user' ? 'items-end' : 'items-start'
          }`}>
            <div 
              className={`py-2.5 px-4 rounded-2xl leading-relaxed text-base break-words
                ${message.type === 'bot'
                  ? 'bg-gray-100 dark:bg-gray-700 text-text-primary rounded-bl-lg'
                  : 'bg-purple-600 text-white rounded-br-lg'
                }`
              }
            >
              {message.content}
            </div>
            <span className="text-xs text-text-secondary px-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex gap-3 mb-2 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-1 max-w-[80%]">
            <div className="flex gap-1.5 py-3.5 px-4 rounded-2xl rounded-bl-lg bg-gray-100 dark:bg-gray-700 w-fit">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-[typingDot_1.4s_infinite]"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-[typingDot_1.4s_infinite]" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-[typingDot_1.4s_infinite]" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={chatMessagesEndRef} />
    </div>
  );
}
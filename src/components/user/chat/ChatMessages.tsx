import { useRef, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
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

  // Auto scroll to bottom khi có message mới
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="chat-messages-container">
      {messages.map((message) => (
        <div key={message.id} className={`chat-message ${message.type}`}>
          <div className="chat-message-avatar">
            {message.type === 'bot' ? (
              <SparklesIcon style={{ width: 16, height: 16, color: '#fff' }} />
            ) : (
              <svg style={{ width: 16, height: 16 }} fill="white" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="chat-message-content">
            <div className="chat-message-bubble">
              {message.content}
            </div>
            <span className="chat-message-time">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isTyping && (
        <div className="chat-message bot">
          <div className="chat-message-avatar">
            <SparklesIcon style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <div className="chat-message-content">
            <div className="chat-typing-indicator">
              <div className="chat-typing-dot"></div>
              <div className="chat-typing-dot"></div>
              <div className="chat-typing-dot"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={chatMessagesEndRef} />
    </div>
  );
}


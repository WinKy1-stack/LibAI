import { useRef, useEffect } from "react";
import { SparklesIcon, UserIcon } from "@heroicons/react/24/solid";
import { formatTime } from "../utils";
import BookSuggestions from "./BookSuggestions";
import type { Book } from "../../../services/chatService";

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  books?: Book[];
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="w-full mb-6 py-4 space-y-5 transition-colors duration-300">
      {messages.map((message) => {
        const isUser = message.type === "user";

        return (
          <div
            key={message.id}
            className="w-full flex flex-col gap-4 animate-[fadeIn_0.35s_ease-out]"
          >
            <div
              className={`flex gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 
                  shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-all duration-300
                  ${
                    isUser
                      ? "bg-background-tertiary text-text-primary"
                      : "bg-gradient-to-br from-[#D946EF] to-[#8B5CF6] text-white"
                  }`}
              >
                {isUser ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
              </div>

              <div
                className={`flex-1 flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`py-2.5 px-4 rounded-2xl text-sm sm:text-[15px] leading-relaxed break-words whitespace-pre-wrap
                    transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.1)]
                    ${
                      isUser
                        ? "bg-gradient-primary text-white rounded-br-md"
                        : "bg-background-secondary/95 text-text-primary rounded-bl-md shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
                    }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-text-secondary px-1 select-none">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
            
            {!isUser && message.books && Array.isArray(message.books) && message.books.length > 0 && (
              <div className="w-full ml-12">
                <BookSuggestions books={message.books} />
              </div>
            )}
          </div>
        );
      })}

      {isTyping && (
        <div className="flex gap-3 mb-2 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D946EF] to-[#8B5CF6] flex items-center justify-center shrink-0 text-white shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-col gap-1 max-w-[80%]">
            <div className="flex items-center gap-1.5 py-3 px-4 rounded-2xl rounded-bl-md 
                            bg-background-secondary/95 shadow-[0_2px_12px_rgba(0,0,0,0.08)]
                            transition-all duration-300">
              <span className="w-2 h-2 bg-text-secondary/60 rounded-full animate-[bounce_1.1s_infinite_cubic-bezier(0.55,0,0.45,1)]" />
              <span
                className="w-2 h-2 bg-text-secondary/60 rounded-full animate-[bounce_1.1s_infinite_cubic-bezier(0.55,0,0.45,1)]"
                style={{ animationDelay: "0.18s" }}
              />
              <span
                className="w-2 h-2 bg-text-secondary/60 rounded-full animate-[bounce_1.1s_infinite_cubic-bezier(0.55,0,0.45,1)]"
                style={{ animationDelay: "0.36s" }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={chatMessagesEndRef} />
    </div>
  );
}

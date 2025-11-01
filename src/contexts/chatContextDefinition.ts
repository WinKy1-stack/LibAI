import { createContext } from 'react';
import type { ChatMessage, Conversation, ChatStats } from '../services/chatService';

export interface ChatContextType {
  // Chat state
  isChatting: boolean;
  setIsChatting: (value: boolean) => void;

  // Chat history
  conversationId: string | null;
  messages: ChatMessage[];
  conversations: Conversation[];
  stats: ChatStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  sendMessage: (message: string, context?: string) => Promise<string>;
  loadHistory: (conversationId: string, limit?: number) => Promise<void>;
  loadConversations: (limit?: number, skip?: number) => Promise<void>;
  loadStats: () => Promise<void>;
  endConversation: () => Promise<void>;
  startNewConversation: () => void;
  clearMessages: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

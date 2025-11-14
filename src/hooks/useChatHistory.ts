import { useState, useCallback, useEffect } from 'react';
import {
  chatService,
  type ChatMessage,
  type ChatMessageRequest,
  type ChatMessageResponse,
  type Conversation,
  type ChatStats,
} from '../services/chatService';
import { authService } from '../services/authService';

interface UseChatHistoryReturn {
  // State
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

export function useChatHistory(): UseChatHistoryReturn {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem('current_conversation_id');
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  // Save conversation ID to localStorage when it changes
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('current_conversation_id', conversationId);
    } else {
      localStorage.removeItem('current_conversation_id');
    }
  }, [conversationId]);

  // Load all conversations
  const loadConversations = useCallback(async (limit: number = 20, skip: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const result = await chatService.getConversations(limit, skip);
      setConversations(result.conversations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (message: string, context?: string): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        // Kiểm tra user đã đăng nhập chưa
        const isAuthenticated = authService.isAuthenticated();

        const request: ChatMessageRequest = {
          message,
          chat_history: messages,
          context,
        };

        let response: ChatMessageResponse;

        // CHỈ LƯU LỊCH SỬ nếu đã đăng nhập
        if (isAuthenticated) {
          // Add conversation_id if exists
          if (conversationId) {
            request.conversation_id = conversationId;
          }

          // Gọi endpoint /message (CÓ TOKEN - LƯU DB)
          response = await chatService.sendMessage(request);

          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to send message');
          }

          // Update conversation ID
          const newConversationId = response.data.conversation_id;
          const isNewConversation = !conversationId && newConversationId;
          
          setConversationId(newConversationId);
          
          // Reload conversations để hiện conversation mới trong sidebar
          if (isNewConversation) {
            // Dùng delay nhỏ để đảm bảo backend đã lưu xong
            setTimeout(() => {
              loadConversations(50, 0).catch(err => 
                console.error('Failed to reload conversations:', err)
              );
            }, 300);
          }
        } else {
          // CHƯA ĐĂNG NHẬP: Gọi endpoint /message/guest (KHÔNG TOKEN - KHÔNG LƯU)
          response = await chatService.sendMessageGuest(request);

          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to send message');
          }

          // KHÔNG CẬP NHẬT conversation_id
        }

        // Add messages to local state (CẢ 2 TH đều hiển thị)
        const userMessage: ChatMessage = {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        };

        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp,
          latency_ms: response.data.metadata.latency_ms,
        };

        setMessages((prev) => [...prev, userMessage, aiMessage]);

        return response.data.message;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, messages, loadConversations]
  );

  // Load conversation history
  const loadHistory = useCallback(async (convId: string, limit: number = 100) => {
    setLoading(true);
    setError(null);

    try {
      const history = await chatService.getConversationHistory(convId, limit);
      setMessages(history.messages);
      setConversationId(convId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load chat statistics
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statsData = await chatService.getStats();
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // End current conversation
  const endConversation = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    try {
      await chatService.endConversation(conversationId);
      setConversationId(null);
      setMessages([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end conversation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // State
    conversationId,
    messages,
    conversations,
    stats,
    loading,
    error,

    // Actions
    sendMessage,
    loadHistory,
    loadConversations,
    loadStats,
    endConversation,
    startNewConversation,
    clearMessages,
  };
}

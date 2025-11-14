import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for chat
const chatApi = axios.create({
  baseURL: `${API_URL}/chat`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
chatApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 403 errors - clear invalid conversation_id
chatApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Clear conversation_id khi gặp 403
      localStorage.removeItem('current_conversation_id');
    }
    return Promise.reject(error);
  }
);

// Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  latency_ms?: number;
}

export interface ChatMessageRequest {
  message: string;
  chat_history?: ChatMessage[];
  context?: string;
  conversation_id?: string;
}

export interface ChatMessageResponse {
  success: boolean;
  data: {
    message: string;
    conversation_id: string;
    user_id: string;
    timestamp: string;
    metadata: {
      message_length: number;
      has_context: boolean;
      history_length: number;
      latency_ms?: number;
    };
  };
  error?: {
    message: string;
    type: string;
  };
}


export interface Conversation {
  conversation_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  meta: {
    channel: string;
    model: string;
    lang: string;
  };
  message_count?: number;
}

export interface ConversationHistory {
  conversation_id: string;
  messages: ChatMessage[];
  count: number;
}

export interface ChatStats {
  total_conversations: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  active_conversations: number;
  completed_conversations: number;
  average_latency_ms: number;
}

export interface HealthCheckResponse {
  success: boolean;
  data: {
    status: string;
    service: string;
    model: string;
    config: {
      max_tokens: number;
      temperature: number;
    };
  };
}

export const chatService = {
  // Send chat message (CÓ ĐĂNG NHẬP - LƯU LỊCH SỬ)
  sendMessage: async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
    const response = await chatApi.post<ChatMessageResponse>('/message', request);
    return response.data;
  },

  // Send chat message (KHÔNG ĐĂNG NHẬP - LƯU IN-MEMORY)
  sendMessageGuest: async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
    const response = await chatApi.post<ChatMessageResponse>('/message/guest', request);
    return response.data;
  },

  // Get conversation history
  getConversationHistory: async (
    conversationId: string,
    limit: number = 100
  ): Promise<ConversationHistory> => {
    const response = await chatApi.get<{ success: boolean; data: ConversationHistory }>(
      `/history/${conversationId}`,
      { params: { limit } }
    );
    return response.data.data;
  },

  // Get all user conversations
  getConversations: async (
    limit: number = 20,
    skip: number = 0
  ): Promise<{ conversations: Conversation[]; count: number }> => {
    const response = await chatApi.get<{
      success: boolean;
      data: { conversations: Conversation[]; count: number };
    }>('/conversations', {
      params: { limit, skip },
    });
    return response.data.data;
  },

  // End conversation
  endConversation: async (conversationId: string): Promise<boolean> => {
    const response = await chatApi.post<{
      success: boolean;
      data: { conversation_id: string; ended: boolean };
    }>('/conversation/end', {
      conversation_id: conversationId,
    });
    return response.data.data.ended;
  },

  // Get chat statistics
  getStats: async (): Promise<ChatStats> => {
    const response = await chatApi.get<{ success: boolean; data: { stats: ChatStats } }>('/stats');
    return response.data.data.stats;
  },

  // Health check
  healthCheck: async (): Promise<HealthCheckResponse> => {
    const response = await chatApi.get<HealthCheckResponse>('/health');
    return response.data;
  },
};

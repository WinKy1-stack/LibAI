import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface AIConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  systemPrompt?: string;
  enableStreaming?: boolean;
  enableCache?: boolean;
  maxBooksInContext?: number;
  maxChatHistory?: number;
  maxMessageLength?: number;
}

export interface Z3950Library {
  key?: string;
  name: string;
  host: string;
  port: number;
  database: string;
  syntax?: string;
  enabled?: boolean;
}

export interface SystemConfig {
  siteName?: string;
  siteUrl?: string;
  adminEmail?: string;
  timezone?: string;
  dateFormat?: string;
  language?: string;
  itemsPerPage?: number;
  sessionTimeout?: number;
  maxUploadSize?: number;
  enableRegistration?: boolean;
  enableMaintenance?: boolean;
  enableAnalytics?: boolean;
  enableDebugMode?: boolean;
  z3950Libraries?: Z3950Library[];
}

export const adminConfigService = {
  getAIConfig: async (): Promise<AIConfig> => {
    const response = await api.get('/admin/config/ai');
    return response.data;
  },

  updateAIConfig: async (data: AIConfig): Promise<{ message: string }> => {
    const response = await api.put('/admin/config/ai', data);
    return response.data;
  },

  getSystemConfig: async (): Promise<SystemConfig> => {
    const response = await api.get('/admin/config/system');
    return response.data;
  },

  updateSystemConfig: async (data: SystemConfig): Promise<{ message: string }> => {
    const response = await api.put('/admin/config/system', data);
    return response.data;
  },

  testZ3950Connection: async (config: Partial<Z3950Library>): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/z3950/test', config);
    return response.data;
  }
};

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

export interface FaqRecord {
  _id?: string;
  question?: string;
  answer?: string;
  category?: string;
  status?: string;
  views?: number;
  helpful?: number;
  not_helpful?: number;
  priority?: number;
  tags?: string[];
  created_at?: string | Date | { $date?: string };
  updated_at?: string | Date | { $date?: string };
  created_by?: string;
  updated_by?: string;
}

export interface FaqsResponse {
  faqs: FaqRecord[];
}

export const faqService = {
  // Get all FAQs (admin can see all statuses)
  getFaqs: async (params?: {
    category?: string;
    search?: string;
    status?: string;
  }): Promise<FaqsResponse> => {
    const response = await api.get<FaqsResponse>('/library/faq', {
      params,
    });
    return response.data;
  },

  // Create FAQ
  createFaq: async (data: Partial<FaqRecord>): Promise<{ message: string; faq_id: string }> => {
    const response = await api.post<{ message: string; faq_id: string }>('/library/faq', data);
    return response.data;
  },

  // Update FAQ
  updateFaq: async (faqId: string, data: Partial<FaqRecord>): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/library/faq/${faqId}`, data);
    return response.data;
  },

  // Delete FAQ
  deleteFaq: async (faqId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/library/faq/${faqId}`);
    return response.data;
  },
};


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

export interface MarcRecord {
  _id?: string;
  control_number?: string;
  record_id?: string;
  title?: {
    main?: string;
    subtitle?: string;
  } | string;
  contributors?: Array<{ role?: string; name?: string }>;
  subjects?: Array<{ term?: string; subdivisions?: string[] } | string>;
  normalized?: {
    title?: string;
    authors?: string[];
    isbn?: string[];
    publisher?: string;
    year?: number;
    subjects?: string[];
  };
  publication?: {
    year?: string;
    publisher?: string;
    place?: string;
  };
  identifiers?: {
    isbn?: Array<{ value?: string }>;
  };
  created_at?: string | Date | { $date?: string };
  updated_at?: string | Date | { $date?: string };
}

export interface MarcRecordsResponse {
  records: MarcRecord[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Item {
  _id?: string;
  record_id?: string;
  status?: string;
  [key: string]: any;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const bookService = {
  // Get MARC records
  getMarcRecords: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    year?: string;
    subject?: string;
  }): Promise<MarcRecordsResponse> => {
    const response = await api.get<MarcRecordsResponse>('/library/marc-records', {
      params,
    });
    return response.data;
  },

  // Get items by record_id
  getItemsByRecordId: async (recordId: string): Promise<ItemsResponse> => {
    const response = await api.get<ItemsResponse>('/library/items', {
      params: { record_id: recordId },
    });
    return response.data;
  },

  // Get items with available status
  getAvailableItemsByRecordId: async (recordId: string): Promise<ItemsResponse> => {
    const response = await api.get<ItemsResponse>('/library/items', {
      params: { record_id: recordId, status: 'available' },
    });
    return response.data;
  },

  // Get all items (for batch processing)
  getAllItems: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ItemsResponse> => {
    const response = await api.get<ItemsResponse>('/library/items', {
      params: {
        ...params,
        limit: params?.limit || 1000, // Get more items at once
      },
    });
    return response.data;
  },
};


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
  record_id?: string;
  leader?: string;
  control_number?: string;
  agency_code?: string;
  updated_at?: string;
  created_at?: string;
  source?: string;
  rights?: {
    access?: string;
    format?: string[];
  };
  fixed_fields?: {
    date_entered?: string;
    type_of_record?: string;
    language?: string;
    publication_year?: string;
  };
  identifiers?: {
    isbn?: string[];  // Array of ISBN strings
    other?: string[];
  };
  title?: {
    main?: string;
    subtitle?: string;
  } | string;
  contributors?: Array<{ role?: string; name?: string }>;
  edition?: string;
  publication?: {
    publisher?: string;
    place?: string;
    year?: string;
  };
  physical_description?: {
    extent?: string;
    size?: string;
    illustration?: string;
  };
  notes?: string[];
  subjects?: string[];  // Array of subject strings
  classification?: {
    ddc?: string;
    lcc?: string;
  };
  holdings?: Array<{
    location?: string;
    call_number?: string;
    copies?: number;
    available?: number;
  }>;
  access?: {
    online_url?: string;
    restrictions?: string;
  };
  format?: string[];
  image_url?: string;
  // Legacy support - will be removed in future
  normalized?: {
    title?: string;
    authors?: string[];
    isbn?: string[];
    publisher?: string;
    year?: number;
    subjects?: string[];
  };
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
  barcode?: string;
  location?: {
    branch?: string;
    shelf?: string;
  };
  call_number?: string;
  updated_at?: string;
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


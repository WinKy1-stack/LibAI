import axios from 'axios';
import type { User } from '../types/auth';

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

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export interface CreateUserData {
  username: string; // student_id
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'librarian' | 'reader';
  major?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'librarian' | 'reader';
  status?: string;
  major?: string;
  password?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<UsersResponse>('/users');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch users');
  },
  
  // Create new user
  createUser: async (data: CreateUserData): Promise<User> => {
    try {
      const response = await api.post<CreateUserResponse>('/users', {
        username: data.username,
        email: data.email,
        password: data.password,
        student_id: data.username, // Backend uses username as student_id
        name: data.name || data.username,
        role: data.role || 'reader',
        major: data.major || '',
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create user');
    } catch (error) {
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        // Extract error message from response
        if (error.response) {
          const errorData = error.response.data;
          // Backend returns { success: false, message: "..." } for errors
          const errorMessage = errorData?.message || errorData?.error || 'Có lỗi xảy ra khi tạo người dùng';
          throw new Error(errorMessage);
        }
        // Network error or other axios errors
        if (error.request) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
      }
      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Có lỗi không xác định xảy ra khi tạo người dùng');
    }
  },
  
  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await api.get<{ success: boolean; data: User }>(`/users/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch user');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          const errorMessage = errorData?.message || errorData?.error || 'Không thể lấy thông tin người dùng';
          throw new Error(errorMessage);
        }
        if (error.request) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Có lỗi không xác định xảy ra');
    }
  },
  
  // Update user
  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    try {
      const response = await api.put<UpdateUserResponse>(`/users/${userId}`, data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update user');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          const errorMessage = errorData?.message || errorData?.error || 'Có lỗi xảy ra khi cập nhật người dùng';
          throw new Error(errorMessage);
        }
        if (error.request) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Có lỗi không xác định xảy ra khi cập nhật người dùng');
    }
  },
  
  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    try {
      const response = await api.delete<DeleteUserResponse>(`/users/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          const errorMessage = errorData?.message || errorData?.error || 'Có lỗi xảy ra khi xóa người dùng';
          throw new Error(errorMessage);
        }
        if (error.request) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Có lỗi không xác định xảy ra khi xóa người dùng');
    }
  },
};

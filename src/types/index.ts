// Common types cho dự án
import type { ObjectId } from 'mongodb';

export interface User {
  _id?: string | ObjectId;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

// Overdue Book types
export type OverdueStatus = "returned" | "returned-late" | "delaying";

export interface OverdueBook {
  key: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  bookId: string;
  title: string;
  author: string;
  overdueDays: number;
  status: OverdueStatus;
  fine: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

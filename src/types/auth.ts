// Auth Types
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginData {
  username: string;
  password: string;
  remember?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'librarian' | 'user';
  phone?: string;
  address?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

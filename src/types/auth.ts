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
  id?: string;
  email?: string;
  name: string;
  role?: 'admin' | 'librarian' | 'reader';
  student_id?: string;
  major?: string;
  status?: string;
  created_at?: string | Date | { $date?: string };
  last_login?: string | Date | { $date?: string };
}

// API response user object may have alternative field names
export interface ApiUserResponse {
  id?: string;
  user_id?: string;
  email?: string;
  name?: string;
  full_name?: string;
  role?: 'admin' | 'librarian' | 'reader';
  student_id?: string;
  major?: string;
  status?: string;
  created_at?: string;
  last_login?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: ApiUserResponse;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

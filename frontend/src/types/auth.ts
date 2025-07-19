export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'author' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'author' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
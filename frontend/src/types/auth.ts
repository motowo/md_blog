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
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
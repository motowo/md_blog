import { apiClient } from './api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/login', credentials);

    // トークンをローカルストレージに保存
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/register', userData);

    // トークンをローカルストレージに保存
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      // ログアウトAPIが失敗してもローカルの認証情報は削除
      console.warn('Logout API failed:', error);
    } finally {
      // ローカルストレージから認証情報を削除
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/user');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();

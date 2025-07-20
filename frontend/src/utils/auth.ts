import apiClient from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types/auth";

export class AuthService {
  // ログイン
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/login", credentials);
    const { user, token } = response.data;

    // トークンとユーザー情報をローカルストレージに保存
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  }

  // ユーザー登録
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/register", userData);
    const { user, token } = response.data;

    // トークンとユーザー情報をローカルストレージに保存
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  }

  // ログアウト
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // APIが失敗してもローカルデータは削除
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  }

  // 現在のユーザー情報を取得
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>("/user");
    const user = response.data.user;

    // ユーザー情報を更新
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  }

  // ローカルストレージからユーザー情報を取得
  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      return null;
    }
  }

  // ローカルストレージからトークンを取得
  static getStoredToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  // 認証状態をチェック
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}

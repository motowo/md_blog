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
      this.clearAuthData();
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

      // null、空文字列、"undefined"、"null"の場合はnullを返す
      if (
        !userStr ||
        userStr === "undefined" ||
        userStr === "null" ||
        userStr.trim() === ""
      ) {
        // 不正なデータをクリーンアップ
        localStorage.removeItem("user");
        return null;
      }

      const parsedUser = JSON.parse(userStr);

      // パースした結果がnullまたはundefinedの場合
      if (!parsedUser || typeof parsedUser !== "object") {
        localStorage.removeItem("user");
        return null;
      }

      return parsedUser;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      // エラーが発生した場合は不正なデータをクリーンアップ
      localStorage.removeItem("user");
      return null;
    }
  }

  // ローカルストレージからトークンを取得
  static getStoredToken(): string | null {
    const token = localStorage.getItem("auth_token");

    // 不正なトークンデータをクリーンアップ
    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      token.trim() === ""
    ) {
      localStorage.removeItem("auth_token");
      return null;
    }

    return token;
  }

  // 認証状態をチェック
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // ローカルストレージの認証関連データを完全にクリア
  static clearAuthData(): void {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // その他の認証関連データがある場合はここで削除
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }
}

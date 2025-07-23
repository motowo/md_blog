import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthService } from "../utils/auth";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthContextType,
} from "../types/auth";
import { AuthContext } from "./AuthContextDefinition";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時にローカルストレージから認証状態を復元
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // ローカルストレージから認証情報を取得（内部で不正データはクリーンアップされる）
        const storedUser = AuthService.getStoredUser();
        const storedToken = AuthService.getStoredToken();

        if (storedUser && storedToken) {
          // ローカルストレージのデータが有効な場合、サーバーでトークンを検証
          try {
            const currentUser = await AuthService.getCurrentUser();

            // ユーザーが無効化されているかチェック
            if (!currentUser.is_active) {
              console.warn("User account is inactive, logging out");
              await AuthService.logout();
              setUser(null);
              return;
            }

            setUser(currentUser);
          } catch (error) {
            // トークンが無効または期限切れの場合は認証状態をクリア
            console.warn(
              "Token verification failed, clearing auth state:",
              error,
            );
            // APIインターセプターでローカルストレージがクリアされるため、直接clearAuthDataを呼ぶ
            AuthService.clearAuthData();
            setUser(null);
          }
        } else {
          // ローカルストレージに有効な認証情報がない場合
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // 初期化エラーの場合も認証状態をクリア
        setUser(null);
        AuthService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      const authResponse = await AuthService.login(credentials);
      setUser(authResponse.user);
      return authResponse.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      const authResponse = await AuthService.register(userData);
      setUser(authResponse.user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    console.log("🔵 AuthContext.refreshUser: Starting refresh");
    try {
      const isAuth = AuthService.isAuthenticated();
      console.log("🔵 AuthContext.refreshUser: isAuthenticated =", isAuth);

      if (isAuth) {
        console.log("🔵 AuthContext.refreshUser: Calling getCurrentUser");
        const currentUser = await AuthService.getCurrentUser();
        console.log("✅ AuthContext.refreshUser: Got user", {
          username: currentUser.username,
          hasAvatar: !!currentUser.avatar_path,
        });
        setUser(currentUser);
        console.log("✅ AuthContext.refreshUser: User updated in context");
      }
    } catch (error) {
      console.error("❌ AuthContext.refreshUser: Error occurred", error);

      // エラーの詳細を確認
      const apiError = error as {
        response?: { status?: number };
        message?: string;
      };
      const status = apiError?.response?.status;

      console.log("🔍 AuthContext.refreshUser: Error details", {
        status,
        message: apiError.message,
        hasResponse: !!apiError.response,
      });

      // 401エラー（認証失効）の場合のみログアウト
      // その他のエラー（ネットワークエラーなど）では現在の状態を維持
      if (status === 401) {
        console.warn(
          "🚪 AuthContext.refreshUser: Authentication expired, logging out",
        );
        await logout();
      } else {
        console.warn(
          "⚠️ AuthContext.refreshUser: Failed but maintaining auth state:",
          status,
          apiError.message,
        );
        // ユーザー情報の更新に失敗したが、現在のログイン状態は維持する
      }
    }
  };

  const updateUser = (newUser: User): void => {
    console.log("🔵 AuthContext.updateUser: Updating user directly", {
      username: newUser.username,
      hasAvatar: !!newUser.avatar_path,
    });
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

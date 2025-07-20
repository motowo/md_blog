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
            setUser(currentUser);
          } catch (error) {
            // トークンが無効または期限切れの場合は認証状態をクリア
            console.warn(
              "Token verification failed, clearing auth state:",
              error,
            );
            try {
              await AuthService.logout(); // ローカルストレージをクリア
            } catch (logoutError) {
              console.error("Failed to clear auth state:", logoutError);
            }
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
        try {
          await AuthService.logout();
        } catch (logoutError) {
          console.error(
            "Failed to clear auth state after init error:",
            logoutError,
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const authResponse = await AuthService.login(credentials);
      setUser(authResponse.user);
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
    try {
      if (AuthService.isAuthenticated()) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

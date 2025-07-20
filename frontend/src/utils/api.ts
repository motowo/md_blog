import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import type { ApiError } from "../types/auth";
import { translateApiError } from "./errorMessages";

// API Base URL (環境変数または固定値)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Axios インスタンスを作成
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10秒でタイムアウト
});

// リクエストインターセプター（認証トークンを自動追加）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 401エラー（認証エラー）の場合、トークンを削除してログイン画面へ
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // ログイン画面へのリダイレクトは呼び出し元で処理
    }

    // API エラーレスポンスを統一フォーマットに変換
    let apiError: ApiError = {
      message: "ネットワークエラーが発生しました",
      errors: {},
    };

    if (error.response?.data) {
      const errorData = error.response.data as Record<string, unknown>;
      apiError.message = (errorData.message as string) || error.message;
      apiError.errors = (errorData.errors as Record<string, string[]>) || {};
    } else if (error.request) {
      apiError.message = "サーバーに接続できません";
    } else {
      apiError.message = error.message;
    }

    // エラーメッセージを日本語に変換
    apiError = translateApiError(apiError);

    return Promise.reject(apiError);
  },
);

export default apiClient;

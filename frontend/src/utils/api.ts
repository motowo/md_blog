import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import type { ApiError } from "../types/auth";
import { translateApiError } from "./errorMessages";

// API Base URL (環境変数または固定値)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

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

    // 認証トークンを強制的に設定
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // 追加の認証ヘッダーも設定
      config.headers["X-Auth-Token"] = token;
    }

    // API記事取得時は必要なヘッダーを強制設定
    if (config.url?.includes("/articles/")) {
      config.headers["X-Requested-With"] = "XMLHttpRequest";
      config.headers["Accept"] = "application/json";
      config.headers["Content-Type"] = "application/json";

      console.log("🚀 API Request:", {
        url: config.url,
        method: config.method,
        hasAuthToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : "none",
        headers: {
          Authorization: config.headers.Authorization,
          "X-Auth-Token": config.headers["X-Auth-Token"]
            ? "present"
            : "missing",
          "X-Requested-With": config.headers["X-Requested-With"],
          Accept: config.headers.Accept,
        },
        params: config.params,
      });
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
    // 記事取得APIのレスポンスをログ出力
    if (response.config.url?.includes("/articles/")) {
      const data = response.data;
      const article =
        data && typeof data === "object" && "data" in data ? data.data : data;

      console.log("📨 API Response:", {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        contentLength: article?.content?.length,
        isPaid: article?.is_paid,
        hasFullContent: article?.content && article.content.length > 200,
        responseSize: JSON.stringify(response.data).length,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    console.log("🔍 API Interceptor: Error occurred", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    // 401エラー（認証エラー）の場合の処理
    if (error.response?.status === 401) {
      // 自動認証確認系のAPI以外では、自動的にローカルストレージをクリアしない
      // ユーザーアクション系のAPIエラーは呼び出し元でハンドリングする
      const isAutoAuthRequest =
        (error.config?.url?.includes("/user/profile") &&
          error.config?.method?.toLowerCase() === "get") ||
        error.config?.url?.includes("/user/activity");

      // アバターアップロード等のユーザーアクションでは自動ログアウトしない
      const isUserAction =
        error.config?.url?.includes("/user/avatar") ||
        error.config?.url?.includes("/user/avatars") ||
        error.config?.url?.includes("/user/profile") ||
        error.config?.url === "/user" || // getCurrentUser API
        (error.config?.method?.toLowerCase() === "post" &&
          error.config?.url?.includes("/user/")) ||
        (error.config?.method?.toLowerCase() === "put" &&
          error.config?.url?.includes("/user/")) ||
        (error.config?.method?.toLowerCase() === "delete" &&
          error.config?.url?.includes("/user/"));

      console.log("🔍 API Interceptor: 401 error classification", {
        url: error.config?.url,
        method: error.config?.method,
        isAutoAuthRequest,
        isUserAction,
        willClearAuth: isAutoAuthRequest && !isUserAction,
      });

      if (isAutoAuthRequest && !isUserAction) {
        console.warn("🚪 API Interceptor: Clearing auth data due to 401");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      } else {
        console.log(
          "✅ API Interceptor: 401 error but NOT clearing auth (user action or not auto-auth)",
        );
      }
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

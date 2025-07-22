import type { AxiosResponse } from "axios";
import type { ApiError } from "../types/auth";

// 共通のサービス基底クラス
export abstract class ServiceBase {
  // レスポンスのdata fieldを自動的に展開するヘルパーメソッド
  protected static extractData<T>(response: AxiosResponse<T | { data: T }>): T {
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  // エラーハンドリングのヘルパーメソッド
  protected static handleError(error: unknown): ApiError {
    if (error && typeof error === "object" && "message" in error) {
      return error as ApiError;
    }
    return {
      message: "予期しないエラーが発生しました",
      errors: {},
    };
  }

  // ページネーションパラメータのビルダー
  protected static buildPaginationParams(params?: {
    page?: number;
    per_page?: number;
    [key: string]: unknown;
  }): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    return searchParams;
  }
}

// 共通のページネーションレスポンス型
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// 共通の成功レスポンス型
export interface SuccessResponse<T = void> {
  message: string;
  data?: T;
}

// 共通の削除レスポンス型
export interface DeleteResponse {
  message: string;
}

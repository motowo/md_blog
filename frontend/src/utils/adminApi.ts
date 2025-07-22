import apiClient from "./api";
import type { User } from "../types/auth";
import type { Article } from "../types/article";

// 管理者用のユーザー管理API

export interface AdminUser extends User {
  articles_count: number;
  payments_count: number;
  last_login_at?: string;
  is_active?: boolean;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: PaginationInfo;
}

export interface AdminArticle extends Article {
  user: User;
  payments_count: number;
}

export interface ArticlesResponse {
  articles: AdminArticle[];
  pagination: PaginationInfo;
}

export interface DashboardStats {
  total_users: number;
  total_articles: number;
  published_articles: number;
  total_payments: number;
  total_revenue: number;
  this_month_revenue: number;
  this_month_users: number;
  this_month_articles: number;
}

export interface RecentPayment {
  id: number;
  amount: number;
  created_at: string;
  user: User;
  article: Article;
}

export interface MonthlyRevenue {
  period: string;
  revenue: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_payments: RecentPayment[];
  monthly_revenue: MonthlyRevenue[];
}

export interface RevenueDetails {
  payments: RecentPayment[];
  pagination: PaginationInfo;
  summary: {
    total_amount: number;
    total_count: number;
  };
}

export class AdminService {
  // ===== ユーザー管理 =====

  // 全ユーザー一覧を取得
  static async getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>("/admin/users", {
      params,
    });
    return response.data;
  }

  // ユーザー詳細を取得
  static async getUser(userId: number): Promise<{ user: AdminUser }> {
    const response = await apiClient.get<{ user: AdminUser }>(
      `/admin/users/${userId}`,
    );
    return response.data;
  }

  // ユーザー情報を更新
  static async updateUser(
    userId: number,
    data: {
      name?: string;
      username?: string;
      email?: string;
      role?: "author" | "admin";
      bio?: string;
    },
  ): Promise<{ message: string; user: AdminUser }> {
    const response = await apiClient.put<{ message: string; user: AdminUser }>(
      `/admin/users/${userId}`,
      data,
    );
    return response.data;
  }

  // ユーザーアカウントを停止/有効化
  static async toggleUserStatus(
    userId: number,
  ): Promise<{ message: string; user: AdminUser }> {
    const response = await apiClient.patch<{
      message: string;
      user: AdminUser;
    }>(`/admin/users/${userId}/toggle-status`);
    return response.data;
  }

  // ユーザーアカウントを削除
  static async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/admin/users/${userId}`,
    );
    return response.data;
  }

  // ===== 記事管理 =====

  // 全記事一覧を取得
  static async getArticles(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: "published" | "draft";
  }): Promise<ArticlesResponse> {
    const response = await apiClient.get<ArticlesResponse>("/admin/articles", {
      params,
    });
    return response.data;
  }

  // 記事詳細を取得
  static async getArticle(
    articleId: number,
  ): Promise<{ article: AdminArticle }> {
    const response = await apiClient.get<{ article: AdminArticle }>(
      `/admin/articles/${articleId}`,
    );
    return response.data;
  }

  // 記事情報を更新
  static async updateArticle(
    articleId: number,
    data: {
      status?: "published" | "draft";
      is_featured?: boolean;
      title?: string;
    },
  ): Promise<{ message: string; article: AdminArticle }> {
    const response = await apiClient.put<{
      message: string;
      article: AdminArticle;
    }>(`/admin/articles/${articleId}`, data);
    return response.data;
  }

  // 記事を削除
  static async deleteArticle(articleId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/admin/articles/${articleId}`,
    );
    return response.data;
  }

  // ===== ダッシュボード =====

  // ダッシュボード統計情報を取得
  static async getDashboardStats(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>(
      "/admin/dashboard/stats",
    );
    return response.data;
  }

  // 収益詳細を取得
  static async getRevenueDetails(params?: {
    period?: "week" | "month" | "year";
    page?: number;
    per_page?: number;
  }): Promise<RevenueDetails> {
    const response = await apiClient.get<RevenueDetails>(
      "/admin/dashboard/revenue",
      { params },
    );
    return response.data;
  }
}

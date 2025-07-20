import apiClient from "./api";
import type {
  Article,
  ArticlesResponse,
  ArticleCreateRequest,
  ArticleUpdateRequest,
} from "../types/article";

export class ArticleService {
  // 記事一覧取得
  static async getArticles(params?: {
    page?: number;
    per_page?: number;
    tag?: string;
    status?: string;
  }): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.per_page)
      searchParams.append("per_page", params.per_page.toString());
    if (params?.tag) searchParams.append("tag", params.tag);
    if (params?.status) searchParams.append("status", params.status);

    const url = searchParams.toString()
      ? `/articles?${searchParams}`
      : "/articles";
    const response = await apiClient.get<ArticlesResponse>(url);
    return response.data;
  }

  // 記事詳細取得
  static async getArticle(id: number): Promise<Article> {
    const response = await apiClient.get<Article>(`/articles/${id}`);
    return response.data;
  }

  // 記事作成（認証必要）
  static async createArticle(data: ArticleCreateRequest): Promise<Article> {
    const response = await apiClient.post<Article>("/articles", data);
    return response.data;
  }

  // 記事更新（認証必要・作成者のみ）
  static async updateArticle(
    id: number,
    data: Partial<ArticleUpdateRequest>,
  ): Promise<Article> {
    const response = await apiClient.put<Article>(`/articles/${id}`, data);
    return response.data;
  }

  // 記事削除（認証必要・作成者のみ）
  static async deleteArticle(id: number): Promise<void> {
    await apiClient.delete(`/articles/${id}`);
  }

  // 公開記事のみ取得
  static async getPublishedArticles(params?: {
    page?: number;
    per_page?: number;
    tag?: string;
  }): Promise<ArticlesResponse> {
    return this.getArticles({ ...params, status: "published" });
  }

  // 特集記事取得
  static async getFeaturedArticles(): Promise<Article[]> {
    const response = await apiClient.get<{ data: Article[] }>(
      "/articles?is_featured=1&status=published",
    );
    return response.data.data;
  }

  // 自分の記事一覧取得（認証必要）
  static async getMyArticles(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.per_page)
      searchParams.append("per_page", params.per_page.toString());
    if (params?.status) searchParams.append("status", params.status);

    const url = searchParams.toString()
      ? `/user/articles?${searchParams}`
      : "/user/articles";
    const response = await apiClient.get<ArticlesResponse>(url);
    return response.data;
  }
}

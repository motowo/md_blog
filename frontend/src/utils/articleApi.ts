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
    // Laravel API の場合、data フィールドでラップされている場合がある
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return (response.data as { data: Article }).data;
    }
    return response.data as Article;
  }

  // 記事作成（認証必要）
  static async createArticle(data: ArticleCreateRequest): Promise<Article> {
    const response = await apiClient.post<{ data?: Article } | Article>(
      "/articles",
      data,
    );
    // Laravel API の場合、data フィールドでラップされている場合がある
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as Article;
    }
    return response.data as Article;
  }

  // 記事更新（認証必要・作成者のみ）
  static async updateArticle(
    id: number,
    data: Partial<ArticleUpdateRequest>,
  ): Promise<Article> {
    const response = await apiClient.put<{ data?: Article } | Article>(
      `/articles/${id}`,
      data,
    );
    // Laravel API の場合、data フィールドでラップされている場合がある
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as Article;
    }
    return response.data as Article;
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

  // ユーザーの記事一覧取得（マイページ用）
  static async getUserArticles(): Promise<Article[]> {
    try {
      const response = await apiClient.get<{
        data: Article[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      }>("/user/articles");
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch user articles:", error);
      return [];
    }
  }

  // 新着記事取得（ホームページ用）
  static async getRecentArticles(limit: number = 3): Promise<Article[]> {
    const response = await apiClient.get<{ data: Article[] }>(
      `/articles/recent?limit=${limit}`,
    );
    return response.data.data;
  }

  // 記事にタグを付ける（認証必要・記事作成者のみ）
  static async updateArticleTags(
    articleId: number,
    tagIds: number[],
  ): Promise<void> {
    await apiClient.post(`/articles/${articleId}/tags`, { tag_ids: tagIds });
  }

  // 記事からタグを削除（認証必要・記事作成者のみ）
  static async removeArticleTag(
    articleId: number,
    tagId: number,
  ): Promise<void> {
    await apiClient.delete(`/articles/${articleId}/tags/${tagId}`);
  }
}

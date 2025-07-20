import apiClient from "./api";
import type { Tag } from "../types/tag";

export class TagService {
  // タグ一覧取得
  static async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<{ data?: Tag[] } | Tag[]>("/tags");
    // Laravel API の場合、data フィールドでラップされている場合がある
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data || [];
    }
    // 直接配列が返される場合
    return Array.isArray(response.data) ? response.data : [];
  }

  // タグ詳細取得
  static async getTag(id: number): Promise<Tag> {
    const response = await apiClient.get<Tag>(`/tags/${id}`);
    return response.data;
  }

  // タグ作成（管理者のみ）
  static async createTag(data: { name: string; slug: string }): Promise<Tag> {
    const response = await apiClient.post<Tag>("/tags", data);
    return response.data;
  }

  // タグ更新（管理者のみ）
  static async updateTag(
    id: number,
    data: { name: string; slug: string },
  ): Promise<Tag> {
    const response = await apiClient.put<Tag>(`/tags/${id}`, data);
    return response.data;
  }

  // タグ削除（管理者のみ）
  static async deleteTag(id: number): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  }
}

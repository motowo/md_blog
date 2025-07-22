import apiClient from "./api";
import type { Tag, TagCreateRequest, TagUpdateRequest } from "../types/tag";
import { ServiceBase, type SuccessResponse, type DeleteResponse } from "./serviceBase";

export class TagService extends ServiceBase {
  // タグ一覧取得
  static async getTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get<{ data?: Tag[] } | Tag[]>("/tags");
      return this.extractData(response) || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // タグ詳細取得
  static async getTag(id: number): Promise<Tag> {
    try {
      const response = await apiClient.get<Tag | { data: Tag }>(`/tags/${id}`);
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // タグ作成（管理者のみ）
  static async createTag(data: TagCreateRequest): Promise<Tag> {
    try {
      const response = await apiClient.post<Tag | { data: Tag }>("/tags", data);
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // タグ更新（管理者のみ）
  static async updateTag(
    id: number,
    data: TagUpdateRequest,
  ): Promise<Tag> {
    try {
      const response = await apiClient.put<Tag | { data: Tag }>(`/tags/${id}`, data);
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // タグ削除（管理者のみ）
  static async deleteTag(id: number): Promise<DeleteResponse> {
    try {
      const response = await apiClient.delete<DeleteResponse>(`/tags/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

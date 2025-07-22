import apiClient from "./api";
import type { User } from "../types/auth";

export interface UserProfileUpdateRequest {
  name: string;
  username: string;
  email: string;
  bio?: string;
  career_description?: string;
  x_url?: string;
  github_url?: string;
  profile_public?: boolean;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface AccountDeleteRequest {
  password: string;
}

export interface ActivityData {
  [date: string]: {
    total: number;
    paid: number;
    free: number;
  };
}

export interface AvatarFile {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  crop_data?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom?: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export class UserService {
  // ユーザープロフィール取得
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/user/profile");
    return response.data;
  }

  // プロフィール更新
  static async updateProfile(data: UserProfileUpdateRequest): Promise<User> {
    const response = await apiClient.put<{ user: User; message: string }>(
      "/user/profile",
      data,
    );
    return response.data.user;
  }

  // アバター画像アップロード
  static async uploadAvatar(
    file: File,
    cropData?: CropData,
  ): Promise<{ avatar_file: AvatarFile; avatar_url: string; user: User }> {
    console.log("🔵 UserService.uploadAvatar: Starting upload", {
      fileName: file.name,
      cropData,
    });

    const formData = new FormData();
    formData.append("avatar", file);

    if (cropData) {
      formData.append("crop_data[x]", cropData.x.toString());
      formData.append("crop_data[y]", cropData.y.toString());
      formData.append("crop_data[width]", cropData.width.toString());
      formData.append("crop_data[height]", cropData.height.toString());
      formData.append("crop_data[zoom]", cropData.zoom.toString());
    }

    try {
      console.log(
        "🔵 UserService.uploadAvatar: Making API call to /user/avatar",
      );
      const response = await apiClient.post<{
        avatar_file: AvatarFile;
        avatar_url: string;
        user: User;
        message: string;
      }>("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ UserService.uploadAvatar: Success", {
        status: response.status,
        hasUser: !!response.data.user,
        avatarUrl: response.data.avatar_url,
        message: response.data.message,
      });

      return {
        avatar_file: response.data.avatar_file,
        avatar_url: response.data.avatar_url,
        user: response.data.user,
      };
    } catch (error) {
      console.error("❌ UserService.uploadAvatar: Error", error);
      throw error;
    }
  }

  // アバターファイル一覧取得
  static async getAvatarFiles(): Promise<AvatarFile[]> {
    const response = await apiClient.get<{ avatar_files: AvatarFile[] }>(
      "/user/avatars",
    );
    return response.data.avatar_files;
  }

  // アバタークロップ情報更新
  static async updateAvatarCrop(
    avatarFileId: number,
    cropData: CropData,
  ): Promise<AvatarFile> {
    const response = await apiClient.put<{
      avatar_file: AvatarFile;
      message: string;
    }>(`/user/avatars/${avatarFileId}/crop`, { crop_data: cropData });
    return response.data.avatar_file;
  }

  // アバター削除
  static async deleteAvatar(avatarFileId: number): Promise<void> {
    await apiClient.delete(`/user/avatars/${avatarFileId}`);
  }

  // 記事投稿アクティビティ取得
  static async getArticleActivity(
    userId?: number,
    year?: number,
  ): Promise<ActivityData> {
    const url = userId ? `/user/${userId}/activity` : "/user/activity";
    const params = year ? { year: year.toString() } : {};
    const response = await apiClient.get<{ activities: ActivityData }>(url, {
      params,
    });
    return response.data.activities;
  }

  // パスワード変更
  static async changePassword(data: PasswordChangeRequest): Promise<void> {
    await apiClient.put("/user/password", data);
  }

  // アカウント削除
  static async deleteAccount(data: AccountDeleteRequest): Promise<void> {
    await apiClient.delete("/user/account", { data });
  }
}

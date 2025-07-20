import apiClient from "./api";
import type { User } from "../types/auth";

export interface UserProfileUpdateRequest {
  name: string;
  username: string;
  email: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface AccountDeleteRequest {
  password: string;
}

export class UserService {
  // ユーザープロフィール取得
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<{ data: User }>("/user/profile");
    return response.data.data;
  }

  // プロフィール更新
  static async updateProfile(data: UserProfileUpdateRequest): Promise<User> {
    const response = await apiClient.put<{ data: User; message: string }>(
      "/user/profile",
      data,
    );
    return response.data.data;
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

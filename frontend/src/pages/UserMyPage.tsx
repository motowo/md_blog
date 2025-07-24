import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextDefinition";
import UserProfileView from "../components/UserProfileView";
import { UserService, type CropData } from "../utils/userApi";
import type { ApiError } from "../types/auth";

const UserMyPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URLパラメータからタブを取得
  const tabParam = searchParams.get("tab") as
    | "profile"
    | "articles"
    | "purchases"
    | "payment"
    | "bank-account"
    | "settings"
    | null;
  const initialTab = tabParam || "profile";

  const handleAvatarUpload = async (file: File, cropData?: CropData) => {
    console.log("🔵 UserMyPage.handleAvatarUpload: Starting", {
      fileName: file.name,
    });
    try {
      // アバターをアップロードしてレスポンスを取得
      console.log(
        "🔵 UserMyPage.handleAvatarUpload: Calling UserService.uploadAvatar",
      );
      const response = await UserService.uploadAvatar(file, cropData);
      console.log("✅ UserMyPage.handleAvatarUpload: Upload successful", {
        hasUser: !!response.user,
      });

      // 成功メッセージを表示
      alert("アバター画像をアップロードしました");

      // レスポンスから直接ユーザー情報を更新（APIコールなしで安全）
      if (response.user) {
        console.log(
          "🔵 UserMyPage.handleAvatarUpload: Updating user via AuthContext.updateUser",
        );
        // AuthContextを直接更新（APIコールなしで安全）
        updateUser(response.user);
        console.log(
          "✅ UserMyPage.handleAvatarUpload: User updated successfully without API calls",
        );
      }
    } catch (err) {
      console.error("❌ UserMyPage.handleAvatarUpload: Error", err);
      const apiError = err as ApiError;
      if (apiError.message) {
        throw new Error(apiError.message);
      } else {
        throw new Error("アバター画像のアップロードに失敗しました");
      }
    }
  };

  const handleAvatarDelete = async () => {
    try {
      // Get user's avatar files to find the active one
      const avatarFiles = await UserService.getAvatarFiles();
      const activeAvatar = avatarFiles.find((file) => file.is_active);

      if (activeAvatar) {
        await UserService.deleteAvatar(activeAvatar.id);
        alert("アバター画像を削除しました");

        // ユーザー情報を更新（avatar_pathをクリア）
        if (user) {
          console.log(
            "🔵 UserMyPage.handleAvatarDelete: Updating user via AuthContext.updateUser",
          );
          const updatedUser = { ...user, avatar_path: null };
          updateUser(updatedUser);
          console.log(
            "✅ UserMyPage.handleAvatarDelete: User updated successfully without API calls",
          );
        }
      }
    } catch (err) {
      console.error("Avatar delete failed:", err);
      const apiError = err as ApiError;
      if (apiError.message) {
        throw new Error(apiError.message);
      } else {
        throw new Error("アバター画像の削除に失敗しました");
      }
    }
  };

  const handleAccountDelete = async () => {
    const password = prompt(
      "アカウントを削除するには、現在のパスワードを入力してください:",
    );
    if (!password) return;

    if (
      window.confirm(
        "本当にアカウントを削除しますか？この操作は取り消せません。",
      )
    ) {
      try {
        await UserService.deleteAccount({ password });
        alert("アカウントを削除しました");
        await logout();
        navigate("/");
      } catch (err) {
        console.error("Account delete failed:", err);
        const apiError = err as ApiError;
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat();
          throw new Error(errorMessages.join(", "));
        } else {
          throw new Error(apiError.message || "アカウントの削除に失敗しました");
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">ユーザー情報を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          マイページ
        </h1>
      </div>

      <UserProfileView
        user={user}
        isReadOnly={false}
        onSave={updateUser}
        onAvatarUpdate={handleAvatarUpload}
        onAvatarDelete={handleAvatarDelete}
        onAccountDelete={handleAccountDelete}
        showPaymentTab={true}
        initialTab={initialTab}
      />
    </div>
  );
};

export default UserMyPage;

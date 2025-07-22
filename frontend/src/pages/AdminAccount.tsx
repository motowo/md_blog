import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextDefinition";
import AdminProfileView from "../components/AdminProfileView";
import { UserService, type CropData } from "../utils/userApi";
import type { ApiError } from "../types/auth";

const AdminAccount: React.FC = () => {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleAvatarUpload = async (file: File, cropData?: CropData) => {
    console.log("🔵 AdminAccount.handleAvatarUpload: Starting", {
      fileName: file.name,
    });
    try {
      // アバターをアップロードしてレスポンスを取得
      console.log(
        "🔵 AdminAccount.handleAvatarUpload: Calling UserService.uploadAvatar",
      );
      const response = await UserService.uploadAvatar(file, cropData);
      console.log("✅ AdminAccount.handleAvatarUpload: Upload successful", {
        hasUser: !!response.user,
      });

      // 成功メッセージを表示
      alert("アバター画像をアップロードしました");

      // レスポンスから直接ユーザー情報を更新（APIコールなしで安全）
      if (response.user) {
        console.log(
          "🔵 AdminAccount.handleAvatarUpload: Updating user via AuthContext.updateUser",
        );
        // AuthContextを直接更新（APIコールなしで安全）
        updateUser(response.user);
        console.log(
          "✅ AdminAccount.handleAvatarUpload: User updated successfully without API calls",
        );
      }
    } catch (err) {
      console.error("❌ AdminAccount.handleAvatarUpload: Error", err);
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
            "🔵 AdminAccount.handleAvatarDelete: Updating user via AuthContext.updateUser",
          );
          const updatedUser = { ...user, avatar_path: null };
          updateUser(updatedUser);
          console.log(
            "✅ AdminAccount.handleAvatarDelete: User updated successfully without API calls",
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
      "管理者アカウントを削除するには、現在のパスワードを入力してください:",
    );
    if (!password) return;

    if (
      window.confirm(
        "本当に管理者アカウントを削除しますか？この操作は取り消せません。サイト運営に支障をきたす可能性があります。",
      )
    ) {
      try {
        await UserService.deleteAccount({ password });
        alert("管理者アカウントを削除しました");
        await logout();
        navigate("/");
      } catch (err) {
        console.error("Admin account delete failed:", err);
        const apiError = err as ApiError;
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat();
          throw new Error(errorMessages.join(", "));
        } else {
          throw new Error(
            apiError.message || "管理者アカウントの削除に失敗しました",
          );
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            アカウント設定
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理者アカウントの設定とプロフィール管理
          </p>
        </div>

        <AdminProfileView
          user={user}
          onSave={updateUser}
          onAvatarUpdate={handleAvatarUpload}
          onAvatarDelete={handleAvatarDelete}
          onAccountDelete={handleAccountDelete}
          initialTab="profile"
        />
      </div>
    </div>
  );
};

export default AdminAccount;

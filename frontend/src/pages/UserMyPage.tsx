import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContextDefinition";
import { useTheme } from "../contexts/ThemeContext";
import { ArticleService } from "../utils/articleApi";
import {
  UserService,
  type ActivityData,
  type CropData,
} from "../utils/userApi";
import { paymentApi, type PaymentHistoryItem } from "../api/payment";
import ActivityHeatmap from "../components/ActivityHeatmap";
import AvatarUpload from "../components/AvatarUpload";
import type { Article } from "../types/article";
import type { ApiError } from "../types/auth";
import { getBadgeClass } from "../constants/badgeStyles";

const UserMyPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "profile" | "articles" | "purchases" | "settings"
  >("profile");
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロフィール編集用の状態
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    career_description: user?.career_description || "",
    x_url: user?.x_url || "",
    github_url: user?.github_url || "",
    profile_public: user?.profile_public ?? true,
  });

  // アクティビティ関連の状態
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [purchases, setPurchases] = useState<PaymentHistoryItem[]>([]);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // パスワード変更用の状態
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // ユーザーの記事を取得
  useEffect(() => {
    if (activeTab === "articles") {
      fetchUserArticles();
    } else if (activeTab === "purchases") {
      fetchPurchases();
    }
  }, [activeTab]);

  // アクティビティデータを取得
  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchUserArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const articles = await ArticleService.getUserArticles();
      setUserArticles(articles);
    } catch (err) {
      console.error("Failed to fetch user articles:", err);
      setError("記事の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      const activities = await UserService.getArticleActivity();
      setActivityData(activities);
    } catch (err) {
      console.error("Failed to fetch activity data:", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getPaymentHistory();
      setPurchases(response.data);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
      setError("購入履歴の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File, cropData?: CropData) => {
    console.log("🔵 UserMyPage.handleAvatarUpload: Starting", {
      fileName: file.name,
    });
    try {
      setAvatarUploading(true);
      setError(null);

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

      // プロフィールデータの状態も更新
      setProfileData((prev) => ({
        ...prev,
        // レスポンスからユーザー情報を反映
      }));
    } catch (err) {
      console.error("❌ UserMyPage.handleAvatarUpload: Error", err);
      const apiError = err as ApiError;
      if (apiError.message) {
        setError(apiError.message);
      } else {
        setError("アバター画像のアップロードに失敗しました");
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setAvatarUploading(true);
      setError(null);

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

        // プロフィールデータの状態も更新
        setProfileData((prev) => ({
          ...prev,
          // アバター削除を反映
        }));
      }
    } catch (err) {
      console.error("Avatar delete failed:", err);
      const apiError = err as ApiError;
      if (apiError.message) {
        setError(apiError.message);
      } else {
        setError("アバター画像の削除に失敗しました");
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await UserService.updateProfile(profileData);
      alert("プロフィールを更新しました");
    } catch (err) {
      console.error("Profile update failed:", err);
      const apiError = err as ApiError;
      if (apiError.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError(apiError.message || "プロフィールの更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError("新しいパスワードが一致しません");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await UserService.changePassword(passwordData);
      alert("パスワードを変更しました");
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      console.error("Password change failed:", err);
      const apiError = err as ApiError;
      if (apiError.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError(apiError.message || "パスワードの変更に失敗しました");
      }
    } finally {
      setLoading(false);
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
        setLoading(true);
        setError(null);
        await UserService.deleteAccount({ password });
        alert("アカウントを削除しました");
        await logout();
        navigate("/");
      } catch (err) {
        console.error("Account delete failed:", err);
        const apiError = err as ApiError;
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat();
          setError(errorMessages.join(", "));
        } else {
          setError(apiError.message || "アカウントの削除に失敗しました");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "公開" },
      draft: { label: "下書き" },
      private: { label: "非公開" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span
        className={getBadgeClass(
          "articleStatus",
          status as "published" | "draft" | "private",
        )}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          マイページ
        </h1>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            プロフィール
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "articles"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            記事管理
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "purchases"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            購入履歴
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            アカウント設定
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* プロフィールタブ */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* アクティビティヒートマップとプロフィール写真 */}
          <Card>
            <CardBody>
              <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
                {/* ヒートマップエリア (3/4) */}
                <div className="flex-1 lg:w-3/4">
                  <ActivityHeatmap activities={activityData} />
                </div>

                {/* プロフィール写真エリア (1/4) */}
                <div className="lg:w-1/4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      プロフィール画像
                    </h3>
                    <AvatarUpload
                      currentAvatar={
                        user?.avatar_path || user?.profile_image_url
                      }
                      onUpload={handleAvatarUpload}
                      onDelete={handleAvatarDelete}
                      loading={avatarUploading}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* プロフィール編集 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                プロフィール編集
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <Input
                  label="名前（必須）"
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="表示名を入力"
                  required
                />

                <Input
                  label="ユーザー名（必須）"
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  placeholder="ユーザー名を入力"
                  required
                />

                <Input
                  label="メールアドレス（必須）"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="メールアドレスを入力"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    自己紹介（任意）
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="自己紹介文を入力してください"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    経歴・キャリア（任意）
                  </label>
                  <textarea
                    value={profileData.career_description}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        career_description: e.target.value,
                      })
                    }
                    placeholder="経歴やキャリアについて詳しく記載してください"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <Input
                  label="X URL（任意）"
                  type="url"
                  value={profileData.x_url}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      x_url: e.target.value,
                    })
                  }
                  placeholder="https://x.com/username"
                />

                <Input
                  label="GitHub URL（任意）"
                  type="url"
                  value={profileData.github_url}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      github_url: e.target.value,
                    })
                  }
                  placeholder="https://github.com/username"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    プロフィール公開設定（任意）
                  </label>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      非公開
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          profile_public: !profileData.profile_public,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        profileData.profile_public
                          ? "bg-blue-600"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileData.profile_public
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      公開
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {profileData.profile_public
                      ? "✅ プロフィールが他のユーザーに表示されます"
                      : "🔒 プロフィールは非公開です"}
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" loading={loading}>
                    プロフィールを更新
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 購入履歴タブ */}
      {activeTab === "purchases" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              購入履歴
            </h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  読み込み中...
                </span>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  購入履歴がありません
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  有料記事を購入すると、ここに履歴が表示されます。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {purchase.article?.title || "記事タイトル不明"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          購入日:{" "}
                          {new Date(purchase.paid_at).toLocaleDateString(
                            "ja-JP",
                          )}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ¥{purchase.amount.toLocaleString()}
                          </span>
                          <span
                            className={getBadgeClass(
                              "paymentStatus",
                              purchase.status,
                            )}
                          >
                            {purchase.status === "success"
                              ? "完了"
                              : purchase.status === "failed"
                                ? "失敗"
                                : "処理中"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/articles/${purchase.article_id}`)
                          }
                        >
                          記事を読む
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* 記事管理タブ */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              記事管理
            </h2>
            <Button variant="primary" onClick={() => navigate("/articles/new")}>
              新しい記事を作成
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                読み込み中...
              </span>
            </div>
          ) : userArticles.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    記事がありません
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    上の「新しい記事を作成」ボタンから最初の記事を書いてみましょう！
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    マークダウン形式で簡単に美しい記事が作成できます
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {userArticles.map((article) => (
                <Card key={article.id}>
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {article.title}
                          </h3>
                          {getStatusBadge(article.status)}
                          {article.is_paid && (
                            <span
                              className={getBadgeClass("priceType", "paid")}
                            >
                              有料: ¥{article.price}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          作成日:{" "}
                          {new Date(article.created_at).toLocaleDateString(
                            "ja-JP",
                          )}
                          {article.updated_at !== article.created_at && (
                            <span className="ml-4">
                              更新日:{" "}
                              {new Date(article.updated_at).toLocaleDateString(
                                "ja-JP",
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/articles/${article.id}`)}
                        >
                          表示
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/articles/${article.id}/edit`)
                          }
                        >
                          編集
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* アカウント設定タブ */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* テーマ設定 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                表示設定
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    テーマ設定
                  </label>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ライトモード
                    </span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isDark ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDark ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      ダークモード
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {isDark
                      ? "🌙 ダークモードが有効です"
                      : "☀️ ライトモードが有効です"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* パスワード変更 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                パスワード変更
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="現在のパスワード"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="新しいパスワード"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="新しいパスワード（確認）"
                  type="password"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password_confirmation: e.target.value,
                    })
                  }
                  required
                />
                <Button type="submit" variant="primary" loading={loading}>
                  パスワードを変更
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* その他の設定 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                危険な操作
              </h2>
            </CardHeader>
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-red-600 dark:text-red-400">
                    アカウント削除
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    アカウントとすべてのデータを完全に削除します。この操作は取り消せません。
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAccountDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                >
                  削除
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserMyPage;

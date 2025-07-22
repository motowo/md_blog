import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ActivityHeatmap from "../components/ActivityHeatmap";
import AvatarUpload from "../components/AvatarUpload";
import { useAuth } from "../contexts/AuthContextDefinition";
import { useTheme } from "../contexts/ThemeContext";
import {
  UserService,
  type ActivityData,
  type CropData,
} from "../utils/userApi";
import { ArticleService } from "../utils/articleApi";
import type { Article } from "../types/article";
import type { ApiError } from "../types/auth";
import { formatCurrency } from "../utils/currency";

const AdminAccount: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "profile" | "articles" | "settings"
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
  const [avatarUploading, setAvatarUploading] = useState(false);

  // パスワード変更用の状態
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // タブに応じてデータを取得
  useEffect(() => {
    if (activeTab === "articles") {
      fetchUserArticles();
    }
  }, [activeTab]);

  // アクティビティデータを取得
  useEffect(() => {
    fetchActivityData();
  }, []);

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

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

  const handleAvatarUpload = async (file: File, cropData?: CropData) => {
    try {
      setAvatarUploading(true);
      setError(null);

      const response = await UserService.uploadAvatar(file, cropData);
      alert("アバター画像をアップロードしました");

      if (response.user) {
        updateUser(response.user);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const apiError = err as ApiError;
      setError(apiError.message || "アバター画像のアップロードに失敗しました");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setAvatarUploading(true);
      setError(null);

      const avatarFiles = await UserService.getAvatarFiles();
      const activeAvatar = avatarFiles.find((file) => file.is_active);

      if (activeAvatar) {
        await UserService.deleteAvatar(activeAvatar.id);
        alert("アバター画像を削除しました");

        if (user) {
          const updatedUser = { ...user, avatar_path: null };
          updateUser(updatedUser);
        }
      }
    } catch (err) {
      console.error("Avatar delete failed:", err);
      setError("アバター画像の削除に失敗しました");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const updatedUser = await UserService.updateProfile(profileData);
      updateUser(updatedUser);
      alert("プロフィールを更新しました");
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("プロフィールの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError("パスワードの変更に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleArticleDelete = async (articleId: number) => {
    if (!confirm("この記事を削除しますか？")) return;

    try {
      await ArticleService.deleteArticle(articleId);
      setUserArticles(userArticles.filter((a) => a.id !== articleId));
      alert("記事を削除しました");
    } catch (err) {
      console.error("Article deletion failed:", err);
      alert("記事の削除に失敗しました");
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            アカウント設定
          </h1>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
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
              自分の記事
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              設定
            </button>
          </nav>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
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
                  <div className="flex-1 lg:w-3/4">
                    <ActivityHeatmap activities={activityData} />
                  </div>
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
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
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

        {/* 記事管理タブ */}
        {activeTab === "articles" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  投稿記事一覧
                </h2>
                <Button
                  variant="primary"
                  onClick={() => navigate("/articles/new")}
                >
                  新規投稿
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  読み込み中...
                </div>
              ) : userArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  まだ記事を投稿していません
                </div>
              ) : (
                <div className="space-y-4">
                  {userArticles.map((article) => (
                    <div
                      key={article.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {article.status === "published"
                                ? "公開中"
                                : "下書き"}
                            </span>
                            <span>
                              {article.is_paid
                                ? `有料 ${formatCurrency(article.price || 0)}`
                                : "無料"}
                            </span>
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/articles/${article.id}/edit`)
                            }
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleArticleDelete(article.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                          >
                            削除
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

        {/* 設定タブ */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* ダークモード設定 */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  表示設定
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      ダークモード
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      サイトの表示をダークモードに切り替えます
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDark ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
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
                  <div className="pt-2">
                    <Button type="submit" variant="primary" loading={loading}>
                      パスワードを変更
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccount;

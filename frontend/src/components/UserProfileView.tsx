import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useTheme } from "../contexts/ThemeContext";
import { ArticleService } from "../utils/articleApi";
import {
  UserService,
  type ActivityData,
  type CropData,
} from "../utils/userApi";
import { paymentApi, type PaymentHistoryItem } from "../api/payment";
import ActivityHeatmap from "./ActivityHeatmap";
import AvatarUpload from "./AvatarUpload";
import { CreditCardManager } from "./CreditCardManager";
import { BankAccountManager } from "./BankAccountManager";
import SalesManagement from "../pages/SalesManagement";
import PayoutManagement from "../pages/PayoutManagement";
import type { Article } from "../types/article";
import type { User } from "../types/auth";
import type { ApiError } from "../types/auth";
import { getBadgeClass } from "../constants/badgeStyles";
import { formatCurrency } from "../utils/currency";
import { formatDateTimeJST } from "../utils/datetime";

interface UserProfileViewProps {
  user: User;
  isReadOnly?: boolean;
  onSave?: (updatedUser: User) => void;
  onAvatarUpdate?: (file: File, cropData?: CropData) => Promise<void>;
  onAvatarDelete?: () => Promise<void>;
  onAccountDelete?: () => Promise<void>;
  showPaymentTab?: boolean;
  initialTab?:
    | "profile"
    | "articles"
    | "purchases"
    | "payment"
    | "bank-account"
    | "sales"
    | "payouts"
    | "settings";
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  isReadOnly = false,
  onSave,
  onAvatarUpdate,
  onAvatarDelete,
  onAccountDelete,
  showPaymentTab = false,
  initialTab = "profile",
}) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "articles"
    | "purchases"
    | "payment"
    | "bank-account"
    | "sales"
    | "payouts"
    | "settings"
  >(initialTab);
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
    profile_public: user?.profile_public ?? false,
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

  const fetchActivityData = useCallback(
    async (year?: number) => {
      try {
        const activities = isReadOnly
          ? await UserService.getArticleActivity(user.id, year)
          : await UserService.getArticleActivity(undefined, year);
        setActivityData(activities);
      } catch (err) {
        console.error("Failed to fetch activity data:", err);
        setActivityData({});
      }
    },
    [user.id, isReadOnly],
  );

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        career_description: user.career_description || "",
        x_url: user.x_url || "",
        github_url: user.github_url || "",
        profile_public: user.profile_public ?? false,
      });
      fetchActivityData();
    }
  }, [user, fetchActivityData]);

  const fetchUserArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const articles = isReadOnly
        ? await ArticleService.getUserArticles(user.id)
        : await ArticleService.getUserArticles();
      setUserArticles(articles);
    } catch (err) {
      console.error("Failed to fetch user articles:", err);
      setError("記事の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [user.id, isReadOnly]);

  const fetchPurchases = useCallback(async () => {
    if (isReadOnly) return;

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
  }, [isReadOnly]);

  // タブに応じてデータを取得
  useEffect(() => {
    if (activeTab === "articles") {
      fetchUserArticles();
    } else if (activeTab === "purchases" && !isReadOnly) {
      fetchPurchases();
    }
  }, [activeTab, fetchUserArticles, fetchPurchases, isReadOnly]);

  const handleAvatarUpload = async (file: File, cropData?: CropData) => {
    if (onAvatarUpdate) {
      setAvatarUploading(true);
      try {
        await onAvatarUpdate(file, cropData);
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (onAvatarDelete) {
      setAvatarUploading(true);
      try {
        await onAvatarDelete();
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await UserService.updateProfile(profileData);
      if (onSave) {
        onSave(updatedUser);
      }
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
    if (isReadOnly) return;

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 dark:border-gray-700">
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
            {isReadOnly ? "投稿記事" : "記事管理"}
          </button>
          {!isReadOnly && (
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
          )}
          {showPaymentTab && !isReadOnly && (
            <button
              onClick={() => setActiveTab("payment")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payment"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              支払い方法
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={() => setActiveTab("bank-account")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "bank-account"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              振込口座
            </button>
          )}
          {!isReadOnly && user?.role === "author" && (
            <button
              onClick={() => setActiveTab("sales")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "sales"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              売上管理
            </button>
          )}
          {!isReadOnly && user?.role === "author" && (
            <button
              onClick={() => setActiveTab("payouts")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payouts"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              入金管理
            </button>
          )}
          {!isReadOnly && (
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
          )}
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
          {/* プロフィール画像 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                プロフィール画像
              </h2>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                {isReadOnly ? (
                  <div className="flex justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <svg
                          className="h-16 w-16 text-gray-400 dark:text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <AvatarUpload
                    currentAvatar={user?.avatar_url}
                    onUpload={handleAvatarUpload}
                    onDelete={handleAvatarDelete}
                    loading={avatarUploading}
                  />
                )}
              </div>
            </CardBody>
          </Card>

          {/* プロフィール編集 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isReadOnly ? "プロフィール情報" : "プロフィール編集"}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <Input
                  label="名前（必須）"
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    !isReadOnly &&
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="表示名を入力"
                  required
                  readOnly={isReadOnly}
                />

                <Input
                  label="ユーザー名（必須）"
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    !isReadOnly &&
                    setProfileData({
                      ...profileData,
                      username: e.target.value,
                    })
                  }
                  placeholder="ユーザー名を入力"
                  required
                  readOnly={isReadOnly}
                />

                <Input
                  label="メールアドレス（必須）"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    !isReadOnly &&
                    setProfileData({
                      ...profileData,
                      email: e.target.value,
                    })
                  }
                  placeholder="メールアドレスを入力"
                  required
                  readOnly={isReadOnly}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    自己紹介（任意）
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      !isReadOnly &&
                      setProfileData({
                        ...profileData,
                        bio: e.target.value,
                      })
                    }
                    placeholder="自己紹介文を入力してください"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly
                        ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        : ""
                    }`}
                    rows={3}
                    readOnly={isReadOnly}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    経歴・キャリア（任意）
                  </label>
                  <textarea
                    value={profileData.career_description}
                    onChange={(e) =>
                      !isReadOnly &&
                      setProfileData({
                        ...profileData,
                        career_description: e.target.value,
                      })
                    }
                    placeholder="経歴やキャリアについて詳しく記載してください"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly
                        ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        : ""
                    }`}
                    rows={4}
                    readOnly={isReadOnly}
                  />
                </div>

                <Input
                  label="X URL（任意）"
                  type="url"
                  value={profileData.x_url}
                  onChange={(e) =>
                    !isReadOnly &&
                    setProfileData({
                      ...profileData,
                      x_url: e.target.value,
                    })
                  }
                  placeholder="https://x.com/username"
                  readOnly={isReadOnly}
                />

                <Input
                  label="GitHub URL（任意）"
                  type="url"
                  value={profileData.github_url}
                  onChange={(e) =>
                    !isReadOnly &&
                    setProfileData({
                      ...profileData,
                      github_url: e.target.value,
                    })
                  }
                  placeholder="https://github.com/username"
                  readOnly={isReadOnly}
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
                        !isReadOnly &&
                        setProfileData({
                          ...profileData,
                          profile_public: !profileData.profile_public,
                        })
                      }
                      disabled={isReadOnly}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        profileData.profile_public
                          ? "bg-blue-600"
                          : "bg-gray-200 dark:bg-gray-600"
                      } ${isReadOnly ? "cursor-not-allowed opacity-50" : ""}`}
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

                {!isReadOnly && (
                  <div className="pt-4">
                    <Button type="submit" variant="primary" loading={loading}>
                      プロフィールを更新
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 記事管理タブ */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          {/* アクティビティヒートマップ */}
          <Card>
            <CardBody>
              <ActivityHeatmap
                activities={activityData}
                onYearChange={fetchActivityData}
              />
            </CardBody>
          </Card>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isReadOnly ? "投稿記事一覧" : "記事一覧"}
            </h2>
            {!isReadOnly && (
              <Button
                variant="primary"
                onClick={() => navigate("/articles/new")}
              >
                新しい記事を作成
              </Button>
            )}
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
                    {isReadOnly ? "投稿記事がありません" : "記事がありません"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isReadOnly
                      ? "このユーザーはまだ記事を投稿していません"
                      : "記事を作成すると、ここに表示されます"}
                  </p>
                  {!isReadOnly && (
                    <Button
                      variant="primary"
                      onClick={() => navigate("/articles/new")}
                    >
                      最初の記事を作成する
                    </Button>
                  )}
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
                              有料: {formatCurrency(article.price || 0)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center space-x-4">
                          <span>
                            📅 作成: {formatDateTimeJST(article.created_at)}
                          </span>
                          {article.updated_at !== article.created_at && (
                            <span>
                              🔄 更新: {formatDateTimeJST(article.updated_at)}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!isReadOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/articles/${article.id}/edit`)
                            }
                          >
                            編集
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/articles/${article.id}`)}
                        >
                          詳細
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

      {/* 購入履歴タブ */}
      {activeTab === "purchases" && !isReadOnly && (
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
                          購入日: {formatDate(purchase.paid_at)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(purchase.amount)}
                          </span>
                          <span
                            className={getBadgeClass(
                              "paymentStatus",
                              purchase.status,
                            )}
                          >
                            {purchase.status === "completed"
                              ? "完了"
                              : purchase.status === "failed"
                                ? "失敗"
                                : "処理中"}
                          </span>
                        </div>
                      </div>
                      {purchase.status === "completed" && purchase.article_id && (
                        <Button
                          variant="primary"
                          size="md"
                          className="flex items-center justify-center gap-2 mt-2"
                          onClick={() => navigate(`/articles/${purchase.article_id}`)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          記事を読む
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* 支払い方法タブ */}
      {activeTab === "payment" && showPaymentTab && !isReadOnly && (
        <div className="space-y-6">
          <CreditCardManager />
        </div>
      )}

      {/* 振込口座タブ */}
      {activeTab === "bank-account" && !isReadOnly && (
        <div className="space-y-6">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                振込口座管理
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                有料記事の売上を受け取るための振込口座を管理します
              </p>
            </div>
            <BankAccountManager />
          </div>
        </div>
      )}

      {/* 売上管理タブ */}
      {activeTab === "sales" && !isReadOnly && user?.role === "author" && (
        <SalesManagement />
      )}

      {/* 入金管理タブ */}
      {activeTab === "payouts" && !isReadOnly && user?.role === "author" && (
        <PayoutManagement />
      )}

      {/* アカウント設定タブ */}
      {activeTab === "settings" && !isReadOnly && (
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
          {onAccountDelete && (
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
                    onClick={onAccountDelete}
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                  >
                    削除
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileView;

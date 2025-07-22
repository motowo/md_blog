import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useTheme } from "../contexts/ThemeContext";
import { ArticleService } from "../utils/articleApi";
import { UserService, type ActivityData } from "../utils/userApi";
import { paymentApi, type PaymentHistoryItem } from "../api/payment";
import ActivityHeatmap from "./ActivityHeatmap";
import AvatarUpload from "./AvatarUpload";
import type { Article } from "../types/article";
import type { User } from "../types/auth";

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  isReadOnly?: boolean;
  onSave?: (updatedUser: User) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  isReadOnly = false,
  onSave,
}) => {
  const { isDark, toggleTheme } = useTheme();
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

  // パスワード変更用の状態
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const fetchActivityData = useCallback(async () => {
    try {
      const activities = await UserService.getArticleActivity(user.id);
      setActivityData(activities);
    } catch (err) {
      console.error("Failed to fetch activity data:", err);
    }
  }, [user.id]);

  useEffect(() => {
    if (isOpen && user) {
      setProfileData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        career_description: user.career_description || "",
        x_url: user.x_url || "",
        github_url: user.github_url || "",
        profile_public: user.profile_public ?? true,
      });
      fetchActivityData();
    }
  }, [isOpen, user, fetchActivityData]);

  const fetchUserArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const articles = await ArticleService.getUserArticles(user.id);
      setUserArticles(articles);
    } catch (err) {
      console.error("Failed to fetch user articles:", err);
      setError("記事の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const fetchPurchases = useCallback(async () => {
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
  }, []);

  // タブに応じてデータを取得
  useEffect(() => {
    if (isOpen && activeTab === "articles") {
      fetchUserArticles();
    } else if (isOpen && activeTab === "purchases" && !isReadOnly) {
      fetchPurchases();
    }
  }, [activeTab, isOpen, isReadOnly, fetchUserArticles, fetchPurchases]);

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
      setError("プロフィールの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.floor(amount));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isReadOnly ? "ユーザー情報参照" : "プロフィール管理"}
            </h3>
            <Button variant="outline" onClick={onClose}>
              ×
            </Button>
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
                投稿記事
              </button>
              {!isReadOnly && (
                <>
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
                    設定
                  </button>
                </>
              )}
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
                        {isReadOnly ? (
                          <div className="flex justify-center">
                            {user.avatar_path ? (
                              <img
                                src={`http://localhost:8000${user.avatar_path}`}
                                alt={user.username}
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
                            currentAvatar={
                              user.avatar_path || user.profile_image_url
                            }
                            onUpload={() => {}}
                            onDelete={() => {}}
                            loading={avatarUploading}
                          />
                        )}
                      </div>
                    </div>
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
                        placeholder="経歴やキャリアについて入力してください"
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isReadOnly
                            ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                            : ""
                        }`}
                        rows={3}
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

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          プロフィール公開設定
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          他のユーザーがあなたのプロフィールを閲覧できるかどうかを設定します
                        </p>
                      </div>
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
                            : "bg-gray-200"
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
                    </div>

                    {!isReadOnly && (
                      <div className="pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={loading}
                        >
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    投稿記事一覧
                  </h2>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* 購入履歴タブ（編集可能モードのみ） */}
          {!isReadOnly && activeTab === "purchases" && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  購入履歴
                </h2>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    読み込み中...
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    まだ記事を購入していません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {payment.article.title}
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span>著者: {payment.article.user.username}</span>
                              <span className="mx-2">•</span>
                              <span>
                                購入日:{" "}
                                {formatDate(
                                  payment.paid_at || payment.created_at,
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              購入済み
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* 設定タブ（編集可能モードのみ） */}
          {!isReadOnly && activeTab === "settings" && (
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
    </div>
  );
};

export default UserProfileModal;

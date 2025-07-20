import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContextDefinition";
import { ArticleService } from "../utils/articleApi";
import { UserService } from "../utils/userApi";
import type { Article } from "../types/article";
import type { ApiError } from "../types/auth";

const UserMyPage: React.FC = () => {
  const { user, logout } = useAuth();
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
  });

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
    }
  }, [activeTab]);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: {
        label: "公開",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      draft: {
        label: "下書き",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      },
      private: {
        label: "非公開",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
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
        <p className="text-gray-600 dark:text-gray-400">
          ようこそ、{user?.name || user?.username}さん
        </p>
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
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              プロフィール編集
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input
                label="名前"
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                placeholder="表示名を入力"
              />

              <Input
                label="ユーザー名"
                type="text"
                value={profileData.username}
                onChange={(e) =>
                  setProfileData({ ...profileData, username: e.target.value })
                }
                placeholder="ユーザー名を入力"
              />

              <Input
                label="メールアドレス"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                placeholder="メールアドレスを入力"
              />

              <div className="pt-4">
                <Button type="submit" variant="primary" loading={loading}>
                  プロフィールを更新
                </Button>
              </div>
            </form>
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
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    まだ記事を作成していません
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/articles/new")}
                  >
                    最初の記事を作成
                  </Button>
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
                その他の設定
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      ログアウト
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      現在のセッションからログアウトします
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    ログアウト
                  </Button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserMyPage;

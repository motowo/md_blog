import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import UserProfileView from "../components/UserProfileView";
import { API_BASE_URL } from "../utils/api";

interface PublicUser {
  id: number;
  name: string;
  username: string;
  bio?: string;
  career_description?: string;
  x_url?: string;
  github_url?: string;
  avatar_path?: string;
  created_at: string;
  articles_count: number;
  public_articles_count: number;
  paid_articles_count: number;
}
import type { User } from "../types/auth";

const UserPublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setError("ユーザー名が指定されていません。");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/users/${username}`);

        if (!response.ok) {
          if (response.status === 404) {
            const errorData = await response.json();
            throw new Error(errorData.message || "ユーザーが見つかりません");
          }
          throw new Error("Failed to fetch user profile");
        }

        const userProfile = await response.json();
        setUser(userProfile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(
          err instanceof Error
            ? err.message
            : "プロフィールの取得に失敗しました。",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                プロフィールが見つかりません
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error ||
                  "指定されたユーザーのプロフィールは存在しないか、非公開に設定されています。"}
              </p>
              <Button onClick={() => navigate("/articles")}>
                記事一覧に戻る
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // PublicUserをUserタイプに変換（UserProfileViewで使用するため）
  const userForProfileView: User = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: "", // 公開プロフィールではメールアドレスは非表示
    bio: user.bio || "",
    career_description: user.career_description || "",
    x_url: user.x_url || "",
    github_url: user.github_url || "",
    avatar_path: user.avatar_path || "",
    role: "author", // 公開プロフィールは全て投稿者
    profile_public: true, // 公開プロフィール表示ページなので表示上は常にtrue
    is_active: true,
    created_at: user.created_at,
    updated_at: user.created_at, // 公開プロフィールでは更新日時は表示しない
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.name} のプロフィール
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            @{user.username} • {user.articles_count}記事投稿
            {user.paid_articles_count > 0 &&
              ` • ${user.paid_articles_count}記事有料`}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/articles")}>
          記事一覧に戻る
        </Button>
      </div>

      {/* プロフィール表示 */}
      <UserProfileView
        user={userForProfileView}
        isReadOnly={true}
        showPaymentTab={false}
        initialTab="profile"
      />
    </div>
  );
};

export default UserPublicProfilePage;

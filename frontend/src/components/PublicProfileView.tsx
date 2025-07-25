import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody } from "./ui/Card";
import ActivityHeatmap from "./ActivityHeatmap";
import type { ActivityData } from "../utils/userApi";
import type { Article } from "../types/article";
import type { User } from "../types/auth";
import { getBadgeClass } from "../constants/badgeStyles";
import { formatCurrency } from "../utils/currency";
import { formatDateTimeJST } from "../utils/datetime";
import { API_BASE_URL } from "../utils/api";

interface PublicProfileViewProps {
  user: User;
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 10;

  const fetchActivityData = useCallback(
    async (year?: number) => {
      try {
        let activities;
        // 公開プロフィール用の新しいエンドポイント
        const response = await fetch(
          `${API_BASE_URL}/api/users/${user.username}/activity${year ? `?year=${year}` : ""}`,
        );
        if (response.ok) {
          const data = await response.json();
          activities = data.activities;
        } else {
          activities = {};
        }
        setActivityData(activities);
      } catch (err) {
        console.error("Failed to fetch activity data:", err);
        setActivityData({});
      }
    },
    [user.username],
  );

  const fetchUserArticles = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        // 公開記事用のエンドポイント（ページネーション対応）
        const response = await fetch(
          `${API_BASE_URL}/api/users/${user.username}/articles?page=${page}&per_page=${articlesPerPage}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();
        setUserArticles(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
        setTotalArticles(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch user articles:", err);
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [user.username, articlesPerPage],
  );

  useEffect(() => {
    fetchActivityData();
    fetchUserArticles(1);
  }, [fetchActivityData, fetchUserArticles]);

  // ページネーション関数
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUserArticles(page);
  };

  const handleFirstPage = () => handlePageChange(1);
  const handleLastPage = () => handlePageChange(totalPages);
  const handlePrevPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () =>
    handlePageChange(Math.min(totalPages, currentPage + 1));

  // ページネーションコンポーネント
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            最初
          </button>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {totalArticles}件中 {(currentPage - 1) * articlesPerPage + 1}-
            {Math.min(currentPage * articlesPerPage, totalArticles)}件を表示
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            (ページ {currentPage} / {totalPages})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            最後
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* プロフィール画像とプロフィール情報を横並びで表示 */}
      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
            {/* プロフィール画像（25%） */}
            <div className="lg:w-1/4 flex-shrink-0">
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  プロフィール画像
                </h3>
                <div className="flex justify-center lg:justify-start">
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
              </div>
            </div>

            {/* プロフィール情報（75%） */}
            <div className="lg:w-3/4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  プロフィール情報
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.username}
                  </p>
                </div>

                {user.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      自己紹介
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  </div>
                )}

                {user.career_description && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      経歴・キャリア
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {user.career_description}
                    </p>
                  </div>
                )}

                {(user.x_url || user.github_url) && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      リンク
                    </h4>
                    <div className="space-y-2">
                      {user.x_url && (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M18.258,3.266c-0.693,0.405-1.46,0.698-2.277,0.857c-0.653-0.686-1.586-1.115-2.618-1.115c-1.98,0-3.586,1.581-3.586,3.53c0,0.276,0.031,0.545,0.092,0.805C6.888,7.195,4.245,5.79,2.476,3.654C2.167,4.176,1.99,4.781,1.99,5.429c0,1.224,0.633,2.305,1.596,2.938C2.999,8.349,2.445,8.19,1.961,7.925C1.96,7.94,1.96,7.954,1.96,7.97c0,1.71,1.237,3.138,2.877,3.462c-0.301,0.08-0.617,0.123-0.943,0.123c-0.23,0-0.456-0.021-0.674-0.062c0.456,1.402,1.781,2.422,3.35,2.451c-1.228,0.947-2.773,1.512-4.454,1.512c-0.291,0-0.575-0.017-0.855-0.049C2.44,17.738,4.358,18.5,6.467,18.5c7.756,0,11.99-6.325,11.99-11.817c0-0.18-0.004-0.359-0.012-0.537C17.818,5.205,18.11,4.765,18.258,3.266z" />
                          </svg>
                          <a
                            href={user.x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            X (Twitter)
                          </a>
                        </div>
                      )}
                      {user.github_url && (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <a
                            href={user.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            GitHub
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ヒートマップ */}
      <Card>
        <CardBody>
          <ActivityHeatmap
            activities={activityData}
            onYearChange={fetchActivityData}
          />
        </CardBody>
      </Card>

      {/* 記事一覧 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          投稿記事一覧
        </h2>
      </div>

      {/* 上部ページネーション */}
      {totalArticles > 0 && <PaginationComponent />}

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
                投稿記事がありません
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                このユーザーはまだ記事を投稿していません
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {userArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      <button
                        onClick={() => navigate(`/articles/${article.id}`)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full text-left"
                      >
                        {article.title}
                      </button>
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDateTimeJST(article.created_at)}</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(
                          "articleStatus",
                          article.status,
                        )}`}
                      >
                        {article.status === "published"
                          ? "公開中"
                          : article.status === "draft"
                            ? "下書き"
                            : "非公開"}
                      </span>
                      {article.is_paid && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          有料 {formatCurrency(article.price || 0)}
                        </span>
                      )}
                      {!article.is_paid && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          無料
                        </span>
                      )}
                      {article.payments_count > 0 && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {article.payments_count}人が購入
                        </span>
                      )}
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* 下部ページネーション */}
      {totalArticles > 0 && <PaginationComponent />}
    </div>
  );
};

export default PublicProfileView;

import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import { type SortConfig } from "../components/ui/SortableTableHeader";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../contexts/AuthContextDefinition";
import {
  AdminService,
  type AdminArticle,
  type ArticlesResponse,
} from "../utils/adminApi";
import { getBadgeClass } from "../constants/badgeStyles";
import { formatCurrency } from "../utils/currency";

const AdminArticles: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [sortConfig] = useState<SortConfig[]>([]);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 並び替えパラメータを構築
      const sortParams = sortConfig.reduce(
        (acc, config, index) => {
          if (config.direction) {
            acc[`sort[${index}][field]`] = config.field;
            acc[`sort[${index}][direction]`] = config.direction;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      const data: ArticlesResponse = await AdminService.getArticles({
        page: currentPage,
        per_page: 15,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        ...sortParams,
      });
      setArticles(data.articles);
      setTotalPages(data.pagination.last_page);
      setTotalArticles(data.pagination.total);
    } catch (err) {
      console.error("Articles fetch failed:", err);
      setError("記事一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, sortConfig]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (article: AdminArticle) => {
    const newStatus = article.status === "published" ? "draft" : "published";
    try {
      await AdminService.updateArticle(article.id, {
        status: newStatus,
      });
      fetchArticles();
      alert(`記事を${newStatus === "published" ? "公開" : "非公開"}しました`);
    } catch (err) {
      console.error("Article update failed:", err);
      alert("記事のステータス変更に失敗しました");
    }
  };

  const handleDeleteArticle = async (article: AdminArticle) => {
    if (
      !confirm(
        `記事「${article.title}」を削除しますか？この操作は取り消せません。`,
      )
    ) {
      return;
    }

    try {
      await AdminService.deleteArticle(article.id);
      fetchArticles();
      alert("記事を削除しました");
    } catch (err) {
      console.error("Article deletion failed:", err);
      alert("記事の削除に失敗しました");
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  if (loading && articles.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* フィルター・検索フォーム */}
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="記事タイトル、内容、作者で検索..."
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべてのステータス</option>
                <option value="published">公開中</option>
                <option value="draft">下書き</option>
              </select>
              <Button type="submit" variant="primary" loading={loading}>
                検索
              </Button>
            </form>
          </CardBody>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
            <button
              onClick={fetchArticles}
              className="ml-4 underline hover:no-underline"
            >
              再試行
            </button>
          </div>
        )}

        {/* 記事一覧 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                記事一覧
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {totalArticles.toLocaleString()}件中{" "}
                {Math.min((currentPage - 1) * 15 + 1, totalArticles)}-
                {Math.min(currentPage * 15, totalArticles)}件を表示
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {articles.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchQuery || statusFilter
                  ? "検索条件に一致する記事が見つかりません"
                  : "記事が投稿されていません"}
              </p>
            ) : (
              <>
                {/* 上部ページネーション */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  disabled={loading}
                  className="mb-4"
                />

                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* タイトルと基本情報 */}
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              to={`/articles/${article.id}`}
                              className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              {truncateText(article.title, 80)}
                            </Link>
                          </div>

                          {/* ステータスと価格のバッジ */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={getBadgeClass(
                                "articleStatus",
                                article.status === "published"
                                  ? "published"
                                  : "draft",
                              )}
                            >
                              {article.status === "published"
                                ? "公開中"
                                : "下書き"}
                            </span>
                            <span
                              className={getBadgeClass(
                                "priceType",
                                article.is_paid ? "paid" : "free",
                              )}
                            >
                              {article.is_paid
                                ? `有料 ${formatCurrency(article.price || 0)}`
                                : "無料"}
                            </span>
                            {article.payments_count > 0 && (
                              <span
                                className={getBadgeClass("metrics", "count")}
                              >
                                購入数: {article.payments_count}
                              </span>
                            )}
                          </div>

                          {/* 作者と日付 */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0">
                                {article.user.avatar_url ? (
                                  <img
                                    src={article.user.avatar_url}
                                    alt={article.user.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <svg
                                      className="h-3 w-3 text-gray-500 dark:text-gray-400"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <span>
                                作者:{" "}
                                {article.user.name || article.user.username}
                              </span>
                            </div>
                            <span>
                              投稿日: {formatDate(article.created_at)}
                            </span>
                            {article.updated_at !== article.created_at && (
                              <span>
                                更新日: {formatDate(article.updated_at)}
                              </span>
                            )}
                          </div>

                          {/* タグ */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                タグ:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {article.tags.map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 操作ボタン */}
                        <div className="flex flex-col sm:flex-row sm:flex-col gap-2 ml-4 min-w-fit">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(article)}
                          >
                            {article.status === "published" ? "非公開" : "公開"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteArticle(article)}
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 下部ページネーション */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  disabled={loading}
                  className="mt-6"
                />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminArticles;

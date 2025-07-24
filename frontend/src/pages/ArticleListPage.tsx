import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArticleCard } from "../components/ArticleCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import { ArticleService } from "../utils/articleApi";
import { TagService } from "../utils/tagApi";
import { paymentApi } from "../api/payment";
import { useAuth } from "../contexts/AuthContextDefinition";
import type { Article, ArticlesResponse } from "../types/article";
import type { Tag } from "../types/tag";

export const ArticleListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedArticles, setPurchasedArticles] = useState<Set<number>>(
    new Set(),
  );
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  // 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || [],
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // 購入状況を取得する関数
  const fetchPurchasedArticles = useCallback(async () => {
    if (!user) {
      setPurchasedArticles(new Set());
      return;
    }

    try {
      const response = await paymentApi.getPaymentHistory(1);
      const purchasedIds = response.data
        .filter((payment) => payment.status === "success")
        .map((payment) => payment.article_id);
      setPurchasedArticles(new Set(purchasedIds));
    } catch (error) {
      console.warn("Failed to fetch purchase history:", error);
      setPurchasedArticles(new Set());
    }
  }, [user]);

  // タグ一覧取得
  const fetchTags = useCallback(async () => {
    try {
      const tags = await TagService.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.warn("Failed to fetch tags:", error);
    }
  }, []);

  // 記事データ取得
  const fetchArticles = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params: {
          page: number;
          per_page: number;
          tags?: string;
          search?: string;
        } = {
          page,
          per_page: pagination.per_page,
        };

        // URLパラメータから検索クエリを取得
        const currentSearchQuery = searchParams.get("search");
        if (currentSearchQuery) {
          params.search = currentSearchQuery;
        }

        if (selectedTags.length > 0) {
          params.tags = selectedTags.join(",");
        }

        const response: ArticlesResponse =
          await ArticleService.getPublishedArticles(params);

        setArticles(response.data);
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        });

        // 記事取得後に購入状況も取得
        await fetchPurchasedArticles();
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [selectedTags, pagination.per_page, fetchPurchasedArticles, searchParams],
  );

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
    fetchArticles(page);
  };

  // タグフィルター変更時の処理
  const handleTagToggle = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];

    setSelectedTags(newSelectedTags);
    const newSearchParams = new URLSearchParams(searchParams);

    if (newSelectedTags.length > 0) {
      newSearchParams.set("tags", newSelectedTags.join(","));
    } else {
      newSearchParams.delete("tags");
    }

    newSearchParams.delete("page"); // ページをリセット
    setSearchParams(newSearchParams);
  };

  // すべてのタグを解除
  const handleClearAllTags = () => {
    setSelectedTags([]);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("tags");
    newSearchParams.delete("page");
    setSearchParams(newSearchParams);
  };

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newSearchParams.set("search", searchQuery);
    } else {
      newSearchParams.delete("search");
    }
    newSearchParams.delete("page"); // ページをリセット
    setSearchParams(newSearchParams);
  };

  // 購入成功時の処理
  const handlePurchaseSuccess = (articleId: number) => {
    setPurchasedArticles((prev) => new Set(prev).add(articleId));
  };

  // 初期ロード時にタグ一覧を取得
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // 初期ロード & URLパラメータ変更時
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    fetchArticles(page);
  }, [searchParams, fetchArticles]);

  // ページネーションコンポーネント
  const renderPagination = () => {
    return (
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={handlePageChange}
        disabled={loading}
        showPageNumbers={true}
        maxVisible={5}
      />
    );
  };

  if (loading && articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            読み込み中...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* パンくずナビ */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">
            ホーム
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">記事一覧</span>
        </div>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            記事一覧
          </h1>
          {user && (
            <Link to="/articles/new">
              <Button variant="primary" size="md">
                ✏️ 新しい記事を書く
              </Button>
            </Link>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {pagination.total}件の記事が見つかりました
        </p>
      </div>

      {/* 検索・フィルター */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">
            検索
          </Button>
        </form>

        {/* タグフィルター */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              タグで絞り込み
            </h3>
            {selectedTags.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllTags}
                className="text-xs"
              >
                すべて解除
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTags.length === 0 ? "primary" : "outline"}
              size="sm"
              onClick={handleClearAllTags}
            >
              すべて
            </Button>
            {availableTags.map((tag) => (
              <Button
                key={tag.id}
                variant={
                  selectedTags.includes(tag.name) ? "primary" : "outline"
                }
                size="sm"
                onClick={() => handleTagToggle(tag.name)}
                className="relative"
              >
                #{tag.name}
                {selectedTags.includes(tag.name) && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </Button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              選択中: {selectedTags.join(", ")} ({selectedTags.length}個)
            </div>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 記事一覧 */}
      {articles.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            記事が見つかりませんでした
          </p>
        </div>
      ) : (
        <>
          {/* 上部ページネーション */}
          {pagination.last_page > 1 && (
            <div className="mb-6">{renderPagination()}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => {
              // 購入済み判定: 無料記事、投稿者本人、管理者、または実際に購入済みの場合
              const isPurchased =
                !article.is_paid ||
                article.user_id === user?.id ||
                user?.role === "admin" ||
                purchasedArticles.has(article.id);

              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isPurchased={isPurchased}
                  onPurchaseSuccess={handlePurchaseSuccess}
                />
              );
            })}
          </div>

          {/* 下部ページネーション */}
          {pagination.last_page > 1 && (
            <div className="mt-8">{renderPagination()}</div>
          )}
        </>
      )}
    </div>
  );
};

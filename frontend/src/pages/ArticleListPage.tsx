import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArticleCard } from "../components/ArticleCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ArticleService } from "../utils/articleApi";
import { useAuth } from "../contexts/AuthContextDefinition";
import type { Article, ArticlesResponse } from "../types/article";

export const ArticleListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");

  // 記事データ取得
  const fetchArticles = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params: {
          page: number;
          per_page: number;
          tag?: string;
        } = {
          page,
          per_page: pagination.per_page,
        };

        if (selectedTag) {
          params.tag = selectedTag;
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
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [selectedTag, pagination.per_page],
  );

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
    fetchArticles(page);
  };

  // タグフィルター変更時の処理
  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    const newSearchParams = new URLSearchParams(searchParams);
    if (tag) {
      newSearchParams.set("tag", tag);
    } else {
      newSearchParams.delete("tag");
    }
    newSearchParams.delete("page"); // ページをリセット
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
    // TODO: 検索API実装時に追加
  };

  // 初期ロード & URLパラメータ変更時
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    fetchArticles(page);
  }, [searchParams, fetchArticles]);

  // ページネーションボタン生成
  const renderPagination = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(
      1,
      pagination.current_page - Math.floor(maxVisible / 2),
    );
    const endPage = Math.min(pagination.last_page, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // 前のページ
    if (pagination.current_page > 1) {
      buttons.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.current_page - 1)}
        >
          前へ
        </Button>,
      );
    }

    // ページ番号
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={pagination.current_page === i ? "primary" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    // 次のページ
    if (pagination.current_page < pagination.last_page) {
      buttons.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.current_page + 1)}
        >
          次へ
        </Button>,
      );
    }

    return buttons;
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === "" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleTagFilter("")}
          >
            すべて
          </Button>
          {/* TODO: タグ一覧APIから動的に取得 */}
          {["JavaScript", "React", "TypeScript", "Laravel", "PHP"].map(
            (tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "primary" : "outline"}
                size="sm"
                onClick={() => handleTagFilter(tag)}
              >
                #{tag}
              </Button>
            ),
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => {
              // 購入済み判定: 無料記事、投稿者本人、管理者、または実際に購入済みの場合
              const isPurchased =
                !article.is_paid ||
                article.user_id === user?.id ||
                user?.role === "admin";

              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isPurchased={isPurchased}
                />
              );
            })}
          </div>

          {/* ページネーション */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

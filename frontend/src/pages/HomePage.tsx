import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { ArticleCard } from "../components/ArticleCard";
import { useAuth } from "../contexts/AuthContextDefinition";
import { ArticleService } from "../utils/articleApi";
import type { Article } from "../types/article";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新着記事を取得
  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const articles = await ArticleService.getRecentArticles(3);
        setRecentArticles(articles);
      } catch (err) {
        console.error("Failed to fetch recent articles:", err);
        setError("新着記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          MD Blog へようこそ
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          マークダウンで記事を投稿・管理できるブログプラットフォーム
        </p>
      </div>

      <div className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            新着記事
          </h2>
          <Link to="/articles">
            <Button variant="outline" size="sm">
              すべて見る
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              読み込み中...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              再試行
            </Button>
          </div>
        ) : recentArticles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              まだ記事が投稿されていません
            </p>
            <Link to="/articles">
              <Button variant="primary">記事を見る</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => {
              // 無料記事、自分の記事、管理者は常に購入済みとして扱う
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
        )}
      </div>
    </div>
  );
};

export default HomePage;

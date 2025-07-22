import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { generatePreviewText, generateBlurredText } from "../utils/markdown";
import { useAuth } from "../contexts/AuthContextDefinition";
import { PaidArticleAccessModal } from "./PaidArticleAccessModal";
import type { Article } from "../types/article";
import { getBadgeClass } from "../constants/badgeStyles";
import { formatCurrency } from "../utils/currency";

interface ArticleCardProps {
  article: Article;
  showAuthor?: boolean;
  isPurchased?: boolean;
  onPurchaseSuccess?: (articleId: number) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  showAuthor = true,
  isPurchased = false,
  onPurchaseSuccess,
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // プレビューテキストの生成
  const previewText = generatePreviewText(
    article.content,
    120,
    article.is_paid,
    isPurchased,
  );

  // 有料記事で未購入の場合はぼかし効果を適用
  const displayText =
    article.is_paid && !isPurchased
      ? generateBlurredText(previewText)
      : previewText;

  // 投稿者本人または管理者かチェック
  const isOwnerOrAdmin =
    user && (user.id === article.user_id || user.role === "admin");

  // ナビゲーション可能かチェック
  const canNavigate = !article.is_paid || isPurchased || isOwnerOrAdmin;

  const handleClick = (e: React.MouseEvent) => {
    if (!canNavigate) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const cardContent = (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {article.title}
          </h3>
        </div>

        <div className="flex items-center space-x-2 mt-2">
          {article.is_paid && (
            <span className={getBadgeClass("priceType", "paid")}>
              {formatCurrency(article.price || 0)}
            </span>
          )}
          {!article.is_paid && (
            <span className={getBadgeClass("priceType", "free")}>無料</span>
          )}
          {article.status === "draft" && (
            <span className={getBadgeClass("articleStatus", "draft")}>
              下書き
            </span>
          )}
        </div>
      </CardHeader>

      <CardBody>
        <div className="mb-4">
          <p
            className={`text-gray-600 dark:text-gray-400 text-sm ${
              article.is_paid && !isPurchased
                ? "filter blur-sm select-none"
                : ""
            }`}
          >
            {displayText}
          </p>
          {article.is_paid && !isPurchased && (
            <div className="mt-2 text-center">
              <span className="inline-block px-3 py-1 text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200 rounded-full">
                続きを読むには購入が必要です
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {showAuthor && article.user && (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{article.user.username}</span>
                {/* 自分の記事の場合はアイコンを表示 */}
                {user && user.id === article.user_id && (
                  <span
                    className="ml-1 text-blue-600 dark:text-blue-400"
                    title="あなたの記事"
                  >
                    ✏️
                  </span>
                )}
              </div>
            )}
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatDate(article.created_at)}
            </span>
          </div>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >
                #{tag.name}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardBody>
    </>
  );

  return (
    <>
      <Card
        className={`h-full transition-transform hover:scale-105 hover:shadow-lg ${
          !canNavigate ? "cursor-pointer" : "cursor-pointer"
        }`}
      >
        {canNavigate ? (
          <Link to={`/articles/${article.id}`} className="block h-full">
            {cardContent}
          </Link>
        ) : (
          <div className="block h-full" onClick={handleClick}>
            {cardContent}
          </div>
        )}
      </Card>

      {/* 有料記事アクセスモーダル */}
      <PaidArticleAccessModal
        article={article}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        onPurchaseSuccess={() => {
          setShowModal(false);
          if (onPurchaseSuccess) {
            onPurchaseSuccess(article.id);
          }
        }}
        isLoggedIn={!!user}
      />
    </>
  );
};

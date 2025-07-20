import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "./ui/Card";
import type { Article } from "../types/article";

interface ArticleCardProps {
  article: Article;
  showAuthor?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  showAuthor = true,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="h-full transition-transform hover:scale-105 hover:shadow-lg">
      <Link to={`/articles/${article.id}`} className="block h-full">
        {article.thumbnail_url && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {article.title}
            </h3>
            {article.is_featured && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                特集
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-2">
            {article.is_paid && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ¥{article.price?.toLocaleString()}
              </span>
            )}
            {!article.is_paid && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                無料
              </span>
            )}
            {article.status === "draft" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                下書き
              </span>
            )}
          </div>
        </CardHeader>

        <CardBody>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {truncateContent(article.preview_content || article.content)}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              {showAuthor && article.user && (
                <span className="flex items-center">
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
                  {article.user.username}
                </span>
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
      </Link>
    </Card>
  );
};

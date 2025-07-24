import React from "react";
import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  showPageNumbers?: boolean;
  maxVisible?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
  showPageNumbers = true,
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  // ページ番号ボタンの生成ロジック
  const generatePageNumbers = () => {
    if (!showPageNumbers) return [];

    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // 先頭との間に省略記号が必要かチェック
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={disabled}
        >
          1
        </Button>,
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>,
        );
      }
    }

    // 中央のページ番号
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={disabled}
        >
          {i}
        </Button>,
      );
    }

    // 末尾との間に省略記号が必要かチェック
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>,
        );
      }

      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={disabled}
        >
          {totalPages}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div className={`flex justify-center items-center space-x-1 ${className}`}>
      {/* 先頭へ */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || disabled}
        title="先頭ページ"
        className="mr-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </Button>

      {/* 前へ */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || disabled}
        title="前のページ"
        className="mr-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>

      {/* ページ番号表示 */}
      {showPageNumbers ? (
        <div className="flex items-center space-x-1">
          {generatePageNumbers()}
        </div>
      ) : (
        <div className="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300 min-w-[100px] justify-center">
          <span className="font-medium">{currentPage}</span>
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>
      )}

      {/* 次へ */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || disabled}
        title="次のページ"
        className="ml-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>

      {/* 末尾へ */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages || disabled}
        title="最後のページ"
        className="ml-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  );
};

export default Pagination;

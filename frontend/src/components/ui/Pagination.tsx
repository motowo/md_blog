import React from "react";
import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center items-center space-x-2 ${className}`}>
      {/* 先頭へ */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || disabled}
        title="先頭ページ"
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
      <div className="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300 min-w-[100px] justify-center">
        <span className="font-medium">{currentPage}</span>
        <span className="mx-1">/</span>
        <span>{totalPages}</span>
      </div>

      {/* 次へ */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || disabled}
        title="次のページ"
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

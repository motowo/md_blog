import React from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

interface SortableTableHeaderProps {
  field: string;
  children: React.ReactNode;
  sortConfig: SortConfig[];
  onSort: (field: string) => void;
  className?: string;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  field,
  children,
  sortConfig,
  onSort,
  className = "",
}) => {
  const currentSort = sortConfig.find((config) => config.field === field);
  const direction = currentSort?.direction;

  const getSortIcon = () => {
    if (!direction) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }

    if (direction === "asc") {
      return (
        <svg
          className="w-4 h-4 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const getSortOrder = () => {
    const index = sortConfig.findIndex((config) => config.field === field);
    return index >= 0 ? index + 1 : null;
  };

  const sortOrder = getSortOrder();

  return (
    <th
      className={`text-left py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 select-none transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between group">
        <span className="flex items-center">
          {children}
          {sortOrder && sortConfig.length > 1 && (
            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center">
              {sortOrder}
            </span>
          )}
        </span>
        <div className="flex items-center ml-2">{getSortIcon()}</div>
      </div>
    </th>
  );
};

export default SortableTableHeader;

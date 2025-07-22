// アラートコンポーネント用スタイル定数

export const alertStyles = {
  base: "p-4 rounded-lg border transition-all duration-200",
  variant: {
    info: "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    success: "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
    error: "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
  },
  size: {
    sm: "p-2 text-sm",
    md: "p-4 text-base",
    lg: "p-6 text-lg",
  },
  icon: {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  },
} as const;

// 保存ステータスインジケーター用スタイル定数
export const saveStatusStyles = {
  base: "inline-flex items-center rounded-lg border transition-all duration-200",
  size: {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  },
  status: {
    saved: {
      icon: "✓",
      text: "保存済み",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    saving: {
      icon: "⟳",
      text: "保存中...",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      spinning: true,
    },
    unsaved: {
      icon: "●",
      text: "未保存",
      textColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    error: {
      icon: "⚠",
      text: "保存エラー",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
    idle: {
      icon: "○",
      text: "待機中",
      textColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
    },
  },
} as const;
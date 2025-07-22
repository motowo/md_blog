// Badgeコンポーネント用スタイル定数

export const badgeStyles = {
  // 基本スタイル
  base: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors",

  // サイズ設定
  size: {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs", // デフォルト
    lg: "px-3 py-1.5 text-sm",
  },

  // 記事ステータス用の色設定（境界線スタイル）
  articleStatus: {
    published:
      "bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 border-2 border-green-500 dark:border-green-400",
    draft:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-500",
    private:
      "bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 border-2 border-orange-500 dark:border-orange-400",
  },

  // 価格タイプ用の色設定
  priceType: {
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", // 有料記事は緑色系で統一
    free: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", // 無料記事は青色で統一
  },

  // 決済ステータス用の色設定
  paymentStatus: {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },

  // ユーザーロール用の色設定
  userRole: {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    author:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },

  // 統計・数値用の色設定
  metrics: {
    count: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", // 購入数など
    owner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", // 投稿者表示
  },

  // 汎用の意味別色設定
  semantic: {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
} as const;

// ヘルパー関数
export const getBadgeClass = (
  type: keyof typeof badgeStyles,
  variant: string,
  size: keyof typeof badgeStyles.size = "md",
): string => {
  const baseClass = badgeStyles.base;
  const sizeClass = badgeStyles.size[size];

  if (type === "articleStatus" && variant in badgeStyles.articleStatus) {
    return `${baseClass} ${sizeClass} ${badgeStyles.articleStatus[variant as keyof typeof badgeStyles.articleStatus]}`;
  }
  if (type === "priceType" && variant in badgeStyles.priceType) {
    return `${baseClass} ${sizeClass} ${badgeStyles.priceType[variant as keyof typeof badgeStyles.priceType]}`;
  }
  if (type === "paymentStatus" && variant in badgeStyles.paymentStatus) {
    return `${baseClass} ${sizeClass} ${badgeStyles.paymentStatus[variant as keyof typeof badgeStyles.paymentStatus]}`;
  }
  if (type === "userRole" && variant in badgeStyles.userRole) {
    return `${baseClass} ${sizeClass} ${badgeStyles.userRole[variant as keyof typeof badgeStyles.userRole]}`;
  }
  if (type === "metrics" && variant in badgeStyles.metrics) {
    return `${baseClass} ${sizeClass} ${badgeStyles.metrics[variant as keyof typeof badgeStyles.metrics]}`;
  }
  if (type === "semantic" && variant in badgeStyles.semantic) {
    return `${baseClass} ${sizeClass} ${badgeStyles.semantic[variant as keyof typeof badgeStyles.semantic]}`;
  }

  // フォールバック
  return `${baseClass} ${sizeClass} ${badgeStyles.semantic.neutral}`;
};

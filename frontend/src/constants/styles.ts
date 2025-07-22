// Tailwind CSS共通スタイル定数

// ボタンスタイル
export const buttonStyles = {
  base: "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  variant: {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  },
  size: {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  },
} as const;

// インプットスタイル
export const inputStyles = {
  base: "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  normal: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
  error: "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400",
  readOnly: "bg-gray-100 dark:bg-gray-700 cursor-not-allowed",
  text: "text-gray-900 dark:text-gray-100",
  placeholder: "placeholder-gray-500 dark:placeholder-gray-400",
} as const;

// カードスタイル
export const cardStyles = {
  base: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
  header: "px-6 py-4 border-b border-gray-200 dark:border-gray-700",
  body: "px-6 py-4",
  footer: "px-6 py-4 border-t border-gray-200 dark:border-gray-700",
} as const;

// レイアウトスタイル
export const layoutStyles = {
  container: "container mx-auto px-4",
  sectionPadding: "py-8",
  grid: {
    cols2: "grid grid-cols-1 md:grid-cols-2 gap-6",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  },
} as const;

// テキストスタイル
export const textStyles = {
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
  error: "mt-1 text-sm text-red-600 dark:text-red-400",
  muted: "text-gray-500 dark:text-gray-400",
  heading: {
    h1: "text-4xl font-bold text-gray-900 dark:text-gray-100",
    h2: "text-3xl font-bold text-gray-900 dark:text-gray-100",
    h3: "text-2xl font-semibold text-gray-900 dark:text-gray-100",
    h4: "text-xl font-semibold text-gray-900 dark:text-gray-100",
  },
} as const;

// 背景スタイル
export const backgroundStyles = {
  primary: "bg-white dark:bg-gray-900",
  secondary: "bg-gray-50 dark:bg-gray-800",
  tertiary: "bg-gray-100 dark:bg-gray-700",
} as const;

// ボーダースタイル
export const borderStyles = {
  default: "border-gray-200 dark:border-gray-700",
  focus: "focus:border-blue-500 dark:focus:border-blue-400",
  error: "border-red-500 dark:border-red-400",
} as const;

// 影スタイル
export const shadowStyles = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
} as const;

// パディングスタイル
export const paddingStyles = {
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
} as const;

// マージンスタイル
export const marginStyles = {
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
} as const;

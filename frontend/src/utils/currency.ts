/**
 * 金額表記用のユーティリティ関数
 * 全ての金額表示を統一するための共通部品
 */

/**
 * 金額を日本円形式で表示する関数
 * @param amount - 金額（数値）
 * @param options - フォーマットオプション
 * @returns フォーマットされた金額文字列（例: "¥1,234"）
 */
export const formatCurrency = (
  amount: number,
  options: {
    /** 通貨記号を表示するか（デフォルト: true） */
    showSymbol?: boolean;
    /** 通貨記号（デフォルト: "¥"） */
    symbol?: string;
  } = {},
): string => {
  const { showSymbol = true } = options;

  // 整数に変換してからフォーマット
  const integerAmount = Math.floor(amount);

  if (!showSymbol) {
    return integerAmount.toLocaleString("ja-JP");
  }

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(integerAmount);
};

/**
 * シンプルな金額表示（通貨記号なし）
 * @param amount - 金額（数値）
 * @returns カンマ区切りの数値文字列（例: "1,234"）
 */
export const formatAmount = (amount: number): string => {
  return formatCurrency(amount, { showSymbol: false });
};

/**
 * 金額と通貨記号を分離して表示する場合の数値部分
 * @param amount - 金額（数値）
 * @returns カンマ区切りの整数文字列
 */
export const formatPriceNumber = (amount: number): string => {
  return Math.floor(amount).toLocaleString("ja-JP");
};

/**
 * 有料/無料を判定して適切な表示文字列を返す
 * @param price - 価格（数値、null、undefined）
 * @param paidLabel - 有料記事のラベル形式（デフォルト: "有料 {price}"）
 * @param freeLabel - 無料記事のラベル（デフォルト: "無料"）
 * @returns 有料/無料のラベル文字列
 */
export const formatPriceLabel = (
  price: number | null | undefined,
  paidLabel: string = "有料 {price}",
  freeLabel: string = "無料",
): string => {
  if (!price || price <= 0) {
    return freeLabel;
  }
  return paidLabel.replace("{price}", formatCurrency(price));
};

/**
 * 決済状況を表示するためのヘルパー関数
 * @param amount - 決済金額
 * @param status - 決済状況
 * @returns フォーマットされた決済情報
 */
export const formatPaymentAmount = (
  amount: number,
  status?: "success" | "failed" | "pending",
): string => {
  const formattedAmount = formatCurrency(amount);

  if (status === "failed") {
    return `${formattedAmount}（失敗）`;
  }
  if (status === "pending") {
    return `${formattedAmount}（処理中）`;
  }

  return formattedAmount;
};

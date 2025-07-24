/**
 * 日時関連のユーティリティ関数
 */

/**
 * ISO 8601形式の日時文字列をJSTの日本語形式に変換
 * @param dateString ISO 8601形式の日時文字列
 * @returns JST形式の日本語日時文字列
 */
export const formatDateTimeJST = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * ISO 8601形式の日時文字列をJSTの日付のみに変換
 * @param dateString ISO 8601形式の日時文字列
 * @returns JST形式の日本語日付文字列
 */
export const formatDateJST = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * 記事の更新日から経過年数を計算
 * @param updatedAt 更新日時のISO 8601文字列
 * @returns 経過年数（1年未満は0、未来の日付は0）
 */
export const getYearsSinceUpdate = (updatedAt: string): number => {
  const now = new Date();
  const updateDate = new Date(updatedAt);
  const diffTime = now.getTime() - updateDate.getTime();

  // 未来の日付の場合は0を返す
  if (diffTime < 0) {
    return 0;
  }

  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
};

/**
 * 記事が古いかどうかを判定（1年以上経過）
 * @param updatedAt 更新日時のISO 8601文字列
 * @returns 1年以上経過している場合はtrue
 */
export const isArticleOld = (updatedAt: string): boolean => {
  return getYearsSinceUpdate(updatedAt) >= 1;
};

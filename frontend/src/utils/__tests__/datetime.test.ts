import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDateTimeJST,
  formatDateJST,
  getYearsSinceUpdate,
  isArticleOld,
} from "../datetime";

describe("datetime utilities", () => {
  beforeEach(() => {
    // 固定の日時でテストを実行（2024年1月1日 12:00:00 UTC）
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDateTimeJST", () => {
    it("ISO 8601形式の日時文字列をJSTの日本語形式に変換する", () => {
      const isoString = "2023-12-25T15:30:45Z";
      const result = formatDateTimeJST(isoString);

      // JST変換後は +9時間されるため、00:30:45になる
      expect(result).toBe("2023/12/26 00:30:45");
    });

    it("異なる日時でも正しく変換される", () => {
      const isoString = "2023-06-15T09:15:30Z";
      const result = formatDateTimeJST(isoString);

      expect(result).toBe("2023/06/15 18:15:30");
    });
  });

  describe("formatDateJST", () => {
    it("ISO 8601形式の日時文字列をJSTの日付のみに変換する", () => {
      const isoString = "2023-12-25T15:30:45Z";
      const result = formatDateJST(isoString);

      expect(result).toBe("2023/12/26");
    });
  });

  describe("getYearsSinceUpdate", () => {
    it("1年前の日付の場合は1を返す", () => {
      const oneYearAgo = "2022-12-01T12:00:00Z";
      const result = getYearsSinceUpdate(oneYearAgo);

      expect(result).toBe(1);
    });

    it("6ヶ月前の日付の場合は0を返す", () => {
      const sixMonthsAgo = "2023-07-01T12:00:00Z";
      const result = getYearsSinceUpdate(sixMonthsAgo);

      expect(result).toBe(0);
    });

    it("2年前の日付の場合は2を返す", () => {
      const twoYearsAgo = "2021-12-01T12:00:00Z";
      const result = getYearsSinceUpdate(twoYearsAgo);

      expect(result).toBe(2);
    });

    it("未来の日付の場合は0を返す", () => {
      const futureDate = "2025-01-01T12:00:00Z";
      const result = getYearsSinceUpdate(futureDate);

      expect(result).toBe(0);
    });
  });

  describe("isArticleOld", () => {
    it("1年以上前の記事の場合はtrueを返す", () => {
      const oldDate = "2022-12-01T12:00:00Z";
      const result = isArticleOld(oldDate);

      expect(result).toBe(true);
    });

    it("1年未満前の記事の場合はfalseを返す", () => {
      const recentDate = "2023-06-01T12:00:00Z";
      const result = isArticleOld(recentDate);

      expect(result).toBe(false);
    });

    it("ちょうど1年前の記事の場合はtrueを返す", () => {
      const oneYearAgo = "2022-12-01T12:00:00Z";
      const result = isArticleOld(oneYearAgo);

      expect(result).toBe(true);
    });
  });
});

import React, { useState } from "react";

interface ActivityData {
  [date: string]: {
    total: number;
    paid: number;
    free: number;
  };
}

interface ActivityHeatmapProps {
  activities: ActivityData;
  className?: string;
  onYearChange?: (year: number) => void;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities,
  className = "",
  onYearChange,
}) => {
  // 現在の年を初期値とする
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // 指定された年の1月1日から12月31日までの日付配列を生成
  const generateDateRange = (year: number) => {
    const dates = [];
    const startDate = new Date(year, 0, 1); // 1月1日
    const endDate = new Date(year, 11, 31); // 12月31日

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }
    return dates;
  };

  // 週ごとに配列を分割
  const groupByWeeks = (dates: string[]) => {
    const weeks = [];
    let currentWeek = [];

    dates.forEach((date, index) => {
      const day = new Date(date).getDay(); // 0=Sunday, 1=Monday...

      if (index === 0) {
        // 最初の週は日曜日から始まるように調整
        for (let i = 0; i < day; i++) {
          currentWeek.push("");
        }
      }

      currentWeek.push(date);

      if (day === 6 || index === dates.length - 1) {
        // 土曜日または最後の日付で週を完了
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  };

  // 記事種別に基づく色を取得（Badgeトンマナに合わせて有料=緑、無料=青）
  const getColor = (
    activityData: { total: number; paid: number; free: number } | null,
  ) => {
    if (!activityData || activityData.total === 0) {
      return "bg-gray-100 dark:bg-gray-800";
    }

    const { total, paid } = activityData;
    const paidRatio = paid / total;

    // 有料記事の比率に基づいて色を決定（有料=緑、無料=青）
    if (paidRatio >= 0.8) {
      // 80%以上有料: 緑系（有料中心）
      if (total === 1) return "bg-emerald-300 dark:bg-emerald-800";
      if (total === 2) return "bg-emerald-400 dark:bg-emerald-700";
      if (total >= 3) return "bg-emerald-500 dark:bg-emerald-600";
    } else if (paidRatio >= 0.5) {
      // 50-79%有料: 紫系（混合）
      if (total === 1) return "bg-purple-300 dark:bg-purple-800";
      if (total === 2) return "bg-purple-400 dark:bg-purple-700";
      if (total >= 3) return "bg-purple-500 dark:bg-purple-600";
    } else if (paidRatio > 0) {
      // 1-49%有料: 青緑系（混合、無料寄り）
      if (total === 1) return "bg-cyan-300 dark:bg-cyan-800";
      if (total === 2) return "bg-cyan-400 dark:bg-cyan-700";
      if (total >= 3) return "bg-cyan-500 dark:bg-cyan-600";
    } else {
      // 0%有料（全て無料）: 青系
      if (total === 1) return "bg-blue-300 dark:bg-blue-800";
      if (total === 2) return "bg-blue-400 dark:bg-blue-700";
      if (total >= 3) return "bg-blue-500 dark:bg-blue-600";
    }

    return "bg-gray-100 dark:bg-gray-800";
  };

  // 月のラベルを生成（1月から開始）
  const getMonthLabels = (weeks: string[][]) => {
    const months = [];
    let currentMonth = "";

    weeks.forEach((week, weekIndex) => {
      // 週の最初の有効な日付を取得
      const firstDate = week.find((date) => date !== "");
      if (!firstDate) return;

      const date = new Date(firstDate);
      const monthYear = date.toLocaleDateString("ja-JP", {
        month: "short",
      });
      const month = date.getMonth() + 1; // 1-12

      // 新しい月が始まる場合のみラベルを追加
      // 年の最初の12月は除外して1月から開始
      if (monthYear !== currentMonth && month >= 1) {
        // 年の最初の部分にある前年12月は除外
        if (!(month === 12 && weekIndex < 4)) {
          months.push({
            label: monthYear,
            weekIndex,
            // 月の開始位置を週の中央に調整
            position: weekIndex * 16 + 8, // セル幅12px + 間隔4px = 16px, 中央は+8px
          });
        }
        currentMonth = monthYear;
      }
    });

    return months;
  };

  // 年切り替え関数
  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? currentYear - 1 : currentYear + 1;
    setCurrentYear(newYear);
    // 親コンポーネントに年変更を通知してAPI再取得を実行
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  // 利用可能な年の範囲を計算（データがある年のみ）
  const availableYears = Array.from(
    new Set(
      Object.keys(activities).map((date) => new Date(date).getFullYear()),
    ),
  ).sort((a, b) => b - a);

  const canGoPrev =
    availableYears.length > 0 && currentYear > Math.min(...availableYears);
  const canGoNext =
    availableYears.length > 0 &&
    currentYear < Math.max(...availableYears, new Date().getFullYear());

  const dates = generateDateRange(currentYear);
  const weeks = groupByWeeks(dates);
  const monthLabels = getMonthLabels(weeks);

  // 現在の年のアクティビティデータのみを抽出
  const yearActivities = Object.entries(activities)
    .filter(([date]) => new Date(date).getFullYear() === currentYear)
    .reduce((acc, [date, activityData]) => {
      acc[date] = activityData;
      return acc;
    }, {} as ActivityData);

  // ツールチップ用の日付フォーマット
  const formatTooltip = (
    date: string,
    activityData: { total: number; paid: number; free: number } | null,
  ) => {
    if (!date || !activityData) return "";

    const formattedDate = new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (activityData.total === 0) {
      return `${formattedDate}: 投稿なし`;
    }

    const { total, paid, free } = activityData;
    let tooltip = `${formattedDate}: ${total}記事投稿`;

    if (paid > 0 && free > 0) {
      tooltip += `\n有料記事: ${paid}記事\n無料記事: ${free}記事`;
    } else if (paid > 0) {
      tooltip += `\n有料記事: ${paid}記事`;
    } else if (free > 0) {
      tooltip += `\n無料記事: ${free}記事`;
    }

    return tooltip;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            記事投稿アクティビティ ({currentYear}年)
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleYearChange("prev")}
              disabled={!canGoPrev}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="前の年"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => handleYearChange("next")}
              disabled={!canGoNext}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="次の年"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {/* 投稿数の凡例 */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>投稿数:</span>
            <span>少ない</span>
            <div className="flex space-x-1">
              <div
                className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-800"
                title="投稿なし"
              />
              <div
                className="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-800"
                title="1記事"
              />
              <div
                className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-700"
                title="2記事"
              />
              <div
                className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-600"
                title="3記事以上"
              />
            </div>
            <span>多い</span>
          </div>

          {/* 記事種別の凡例 */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>記事種別:</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 dark:bg-blue-700" />
                <span>無料</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 dark:bg-cyan-700" />
                <span>混合</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-purple-400 dark:bg-purple-700" />
                <span>半々</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                <span>有料</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* 月のラベル */}
        <div className="relative mb-2 min-w-max h-4">
          {/* 曜日ラベル分のオフセット */}
          <div className="ml-8">
            {monthLabels.map((month, index) => (
              <div
                key={index}
                className="absolute text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
                style={{
                  left: `${month.position}px`,
                  transform: "translateX(-50%)", // 中央揃え
                }}
              >
                {month.label}
              </div>
            ))}
          </div>
        </div>

        {/* 曜日ラベルとヒートマップグリッド */}
        <div className="flex min-w-max">
          <div className="flex flex-col mr-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="h-3 flex items-center justify-end">日</div>
            <div className="h-3 flex items-center justify-end">月</div>
            <div className="h-3 flex items-center justify-end">火</div>
            <div className="h-3 flex items-center justify-end">水</div>
            <div className="h-3 flex items-center justify-end">木</div>
            <div className="h-3 flex items-center justify-end">金</div>
            <div className="h-3 flex items-center justify-end">土</div>
          </div>

          {/* ヒートマップグリッド */}
          <div className="flex space-x-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((date, dayIndex) => {
                  const activityData = date
                    ? yearActivities[date] || null
                    : null;
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getColor(activityData)} ${
                        date ? "cursor-pointer" : ""
                      } transition-all duration-200 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600`}
                      title={date ? formatTooltip(date, activityData) : ""}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {Object.keys(yearActivities).length > 0 && (
          <div className="space-y-1">
            <p>
              {currentYear}年に{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {Object.values(yearActivities).reduce(
                  (sum, activity) => sum + activity.total,
                  0,
                )}
              </span>{" "}
              記事を投稿しました（
              {Object.keys(yearActivities).length}日間活動）
            </p>
            <div className="flex space-x-4 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400">
                有料記事:{" "}
                {Object.values(yearActivities).reduce(
                  (sum, activity) => sum + activity.paid,
                  0,
                )}
                記事
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                無料記事:{" "}
                {Object.values(yearActivities).reduce(
                  (sum, activity) => sum + activity.free,
                  0,
                )}
                記事
              </span>
            </div>
          </div>
        )}
        {Object.keys(yearActivities).length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            {currentYear}年の投稿記事はありません
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityHeatmap;

import React from "react";

interface ActivityData {
  [date: string]: number; // "2024-01-15": 3
}

interface ActivityHeatmapProps {
  activities: ActivityData;
  className?: string;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities,
  className = "",
}) => {
  // 現在から1年前までの日付配列を生成
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
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

  // アクティビティレベルに基づく色を取得
  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count === 1) return "bg-green-200 dark:bg-green-900";
    if (count === 2) return "bg-green-300 dark:bg-green-700";
    if (count === 3) return "bg-green-400 dark:bg-green-600";
    return "bg-green-500 dark:bg-green-500";
  };

  // 月のラベルを生成
  const getMonthLabels = (weeks: string[][]) => {
    const months = [];
    let currentMonth = "";

    weeks.forEach((week, weekIndex) => {
      const firstDate = week.find((date) => date !== "");
      if (!firstDate) return;

      const monthYear = new Date(firstDate).toLocaleDateString("ja-JP", {
        month: "short",
      });

      if (monthYear !== currentMonth) {
        months.push({ label: monthYear, weekIndex });
        currentMonth = monthYear;
      }
    });

    return months;
  };

  const dates = generateDateRange();
  const weeks = groupByWeeks(dates);
  const monthLabels = getMonthLabels(weeks);

  // ツールチップ用の日付フォーマット
  const formatTooltip = (date: string, count: number) => {
    if (!date) return "";
    const formattedDate = new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${formattedDate}: ${count}記事投稿`;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          記事投稿アクティビティ
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span>少ない</span>
          <div className="flex space-x-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-700" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-500" />
          </div>
          <span>多い</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* 月のラベル */}
        <div className="flex mb-2 min-w-max ml-8">
          {monthLabels.map((month, index) => (
            <div
              key={index}
              className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0"
              style={{
                width: "16px",
                marginLeft:
                  index === 0
                    ? `${month.weekIndex * 16}px`
                    : `${(month.weekIndex - monthLabels[index - 1]?.weekIndex) * 16}px`,
              }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* 曜日ラベルとヒートマップグリッド */}
        <div className="flex min-w-max">
          <div
            className="flex flex-col mr-2 text-xs text-gray-500 dark:text-gray-400 justify-between"
            style={{ height: "112px" }}
          >
            <div className="h-4 flex items-center">月</div>
            <div className="h-4 flex items-center">水</div>
            <div className="h-4 flex items-center">金</div>
          </div>

          {/* ヒートマップグリッド */}
          <div className="flex space-x-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((date, dayIndex) => {
                  const count = date ? activities[date] || 0 : 0;
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getColor(count)} ${
                        date ? "cursor-pointer" : ""
                      } transition-all duration-200 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600`}
                      title={date ? formatTooltip(date, count) : ""}
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
        {Object.keys(activities).length > 0 && (
          <p>
            過去1年間で{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {Object.values(activities).reduce((sum, count) => sum + count, 0)}
            </span>{" "}
            記事を投稿しました（
            {Object.keys(activities).length}日間活動）
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityHeatmap;

import React from "react";
import type { SaveStatus } from "../hooks/useAutoSave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  className?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved,
  className = "",
}) => {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return "";

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) {
      return "たった今保存";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前に保存`;
    } else {
      return (
        date.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }) + "に保存"
      );
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "saved":
        return {
          icon: "✓",
          text: "保存済み",
          textColor: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "saving":
        return {
          icon: "⟳",
          text: "保存中...",
          textColor: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          spinning: true,
        };
      case "unsaved":
        return {
          icon: "●",
          text: "未保存",
          textColor: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-800",
        };
      case "error":
        return {
          icon: "⚠",
          text: "保存エラー",
          textColor: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: "○",
          text: "不明",
          textColor: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-lg border transition-all duration-200 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <span
        className={`text-sm font-medium mr-2 ${config.textColor} ${
          config.spinning ? "animate-spin" : ""
        }`}
      >
        {config.icon}
      </span>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.text}
        </span>
        {status === "saved" && lastSaved && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatLastSaved(lastSaved)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SaveStatusIndicator;

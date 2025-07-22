import React from "react";
import type { SaveStatus } from "../hooks/useAutoSave";
import { saveStatusStyles } from "../constants/alertStyles";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  size?: "sm" | "md" | "lg";
  showLastSaved?: boolean;
  className?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved = null,
  size = "md",
  showLastSaved = true,
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

  const statusKey =
    status === "idle" || !saveStatusStyles.status[status] ? "idle" : status;
  const config = saveStatusStyles.status[statusKey];
  const sizeClasses = saveStatusStyles.size[size];
  const baseClasses = saveStatusStyles.base;

  return (
    <div
      className={`${baseClasses} ${sizeClasses} ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <span
        className={`font-medium mr-2 ${config.textColor} ${
          config.spinning ? "animate-spin" : ""
        }`}
      >
        {config.icon}
      </span>
      <div className="flex flex-col">
        <span className={`font-medium ${config.textColor}`}>{config.text}</span>
        {showLastSaved && status === "saved" && lastSaved && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatLastSaved(lastSaved)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SaveStatusIndicator;

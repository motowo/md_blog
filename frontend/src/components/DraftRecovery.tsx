import React, { useState } from "react";
import Button from "./ui/Button";
import Alert from "./Alert";

interface DraftData<T = unknown> {
  data: T;
  timestamp: string;
}

interface DraftRecoveryProps<T = unknown> {
  draftData: DraftData<T>;
  onRestore: (data: T) => void;
  onDiscard: () => void;
  className?: string;
}

const DraftRecovery = <T = unknown,>({
  draftData,
  onRestore,
  onDiscard,
  className = "",
}: DraftRecoveryProps<T>) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else {
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleRestore = () => {
    onRestore(draftData.data);
    setIsVisible(false);
  };

  const handleDiscard = () => {
    onDiscard();
    setIsVisible(false);
  };

  const getPreviewText = () => {
    const data = draftData.data;
    if (data.title && data.title.trim()) {
      return (
        data.title.trim().substring(0, 50) +
        (data.title.length > 50 ? "..." : "")
      );
    } else if (data.content && data.content.trim()) {
      const contentPreview = data.content.trim().substring(0, 100);
      return contentPreview + (data.content.length > 100 ? "..." : "");
    }
    return "無題の下書き";
  };

  return (
    <div className={className}>
      <Alert variant="info">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📝</span>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                保存された下書きが見つかりました
              </h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>プレビュー:</strong> {getPreviewText()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                最終更新: {formatTimestamp(draftData.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleRestore}
              className="bg-blue-600 hover:bg-blue-700"
            >
              復元する
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
            >
              破棄する
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default DraftRecovery;

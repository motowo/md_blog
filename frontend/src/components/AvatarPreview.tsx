import React from "react";
import Button from "./ui/Button";

interface AvatarPreviewProps {
  imageSrc: string;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  imageSrc,
  onClose,
  onEdit,
  onDelete,
  loading = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            プロフィール画像
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={imageSrc}
              alt="プロフィール画像"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-avatar.png";
              }}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={loading}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
            >
              削除
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={onEdit} disabled={loading}>
              変更
            </Button>
          )}
          <Button variant="primary" onClick={onClose} disabled={loading}>
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPreview;

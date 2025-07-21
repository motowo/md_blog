import React, { useRef, useState } from "react";
import Button from "./ui/Button";
import AvatarCropper from "./AvatarCropper";
import AvatarPreview from "./AvatarPreview";
import type { CropData } from "../utils/userApi";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File, cropData?: CropData) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUpload,
  onDelete,
  loading = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropper(true);
    } else {
      alert("画像ファイルを選択してください");
    }
  };

  const handleCropComplete = async (cropData: CropData) => {
    if (selectedFile) {
      await onUpload(selectedFile, cropData);
    }
    handleCropCancel();
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm("プロフィール画像を削除しますか？")) {
      await onDelete();
    }
  };

  const handleClick = () => {
    if (currentAvatar) {
      setShowPreview(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarPreviewEdit = () => {
    setShowPreview(false);
    fileInputRef.current?.click();
  };

  const handleAvatarPreviewDelete = async () => {
    setShowPreview(false);
    if (onDelete) {
      await onDelete();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const avatarUrl = currentAvatar?.startsWith("http")
    ? currentAvatar
    : currentAvatar
      ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/storage/${currentAvatar}`
      : null;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div
        className={`relative w-24 h-24 rounded-full border-2 border-dashed cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        } ${loading ? "opacity-50" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="アバター"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              console.error("Avatar image failed to load:", avatarUrl);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            loading={loading}
            className="text-xs"
          >
            {currentAvatar ? "画像を変更" : "画像をアップロード"}
          </Button>
          {currentAvatar && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-xs text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
            >
              削除
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, GIF (最大5MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {showCropper && previewUrl && (
        <AvatarCropper
          imageSrc={previewUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          loading={loading}
        />
      )}

      {showPreview && avatarUrl && (
        <AvatarPreview
          imageSrc={avatarUrl}
          onClose={() => setShowPreview(false)}
          onEdit={handleAvatarPreviewEdit}
          onDelete={onDelete ? handleAvatarPreviewDelete : undefined}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AvatarUpload;

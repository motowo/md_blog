import React, { useState, useRef, useCallback } from "react";
import Button from "./ui/Button";

interface AvatarCropperProps {
  imageSrc: string;
  onCropComplete: (cropData: CropData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  loading = false,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight, width, height } = e.currentTarget;

      setImageSize({ width: naturalWidth, height: naturalHeight });

      // 画像を正方形枠にフィットするように初期ズームとポジションを設定
      const containerSize = 300; // 固定の正方形サイズ
      const minZoom = Math.max(containerSize / width, containerSize / height);

      setZoom(Math.max(minZoom, 1));
      setImagePosition({ x: 0, y: 0 });
    },
    [],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imgRef.current && containerRef.current) {
      const containerSize = 300;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // 画像がコンテナからはみ出さないように制限
      const scaledImageWidth = imgRef.current.clientWidth * zoom;
      const scaledImageHeight = imgRef.current.clientHeight * zoom;

      const maxX = Math.max(0, (scaledImageWidth - containerSize) / 2);
      const maxY = Math.max(0, (scaledImageHeight - containerSize) / 2);

      const clampedX = Math.max(-maxX, Math.min(maxX, newX));
      const clampedY = Math.max(-maxY, Math.min(maxY, newY));

      setImagePosition({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    // ズーム変更時にポジションを調整
    if (imgRef.current && containerRef.current) {
      const containerSize = 300;
      const scaledImageWidth = imgRef.current.clientWidth * newZoom;
      const scaledImageHeight = imgRef.current.clientHeight * newZoom;

      const maxX = Math.max(0, (scaledImageWidth - containerSize) / 2);
      const maxY = Math.max(0, (scaledImageHeight - containerSize) / 2);

      setImagePosition((prev) => ({
        x: Math.max(-maxX, Math.min(maxX, prev.x)),
        y: Math.max(-maxY, Math.min(maxY, prev.y)),
      }));
    }
  };

  const handleCropComplete = () => {
    if (!imgRef.current || !containerRef.current) return;

    const image = imgRef.current;
    const containerSize = 300;

    // 画像の実際のサイズと表示サイズの比率を計算
    const scaleX = imageSize.width / image.clientWidth;
    const scaleY = imageSize.height / image.clientHeight;

    // クロップ領域の計算（固定正方形枠の中央部分）
    const scaledImageWidth = image.clientWidth * zoom;
    const scaledImageHeight = image.clientHeight * zoom;

    // クロップ開始位置（画像上での座標）
    const cropStartX =
      Math.max(0, (scaledImageWidth - containerSize) / 2 - imagePosition.x) /
      zoom;
    const cropStartY =
      Math.max(0, (scaledImageHeight - containerSize) / 2 - imagePosition.y) /
      zoom;

    // 実際の画像座標に変換
    const cropData: CropData = {
      x: cropStartX * scaleX,
      y: cropStartY * scaleY,
      width: (containerSize / zoom) * scaleX,
      height: (containerSize / zoom) * scaleY,
      zoom: zoom,
    };

    onCropComplete(cropData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          プロフィール画像を調整
        </h3>

        <div className="space-y-4">
          {/* ズームコントロール */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ズーム:
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* 固定正方形クロップエリア */}
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative overflow-hidden border-2 border-blue-500 rounded-lg bg-gray-100 dark:bg-gray-800"
              style={{ width: "300px", height: "300px" }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                style={{
                  transform: `scale(${zoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transformOrigin: "center center",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                }}
                onLoad={onImageLoad}
                onMouseDown={handleMouseDown}
                onDragStart={(e) => e.preventDefault()}
              />

              {/* クロップ枠のオーバーレイ */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-2 border-dashed border-white opacity-50 rounded"></div>
              </div>

              {/* アバター表示領域（内接円）*/}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className="rounded-full border-2 border-blue-400 border-dashed opacity-70"
                  style={{
                    width: "280px",
                    height: "280px",
                    boxShadow: "inset 0 0 0 2px rgba(59, 130, 246, 0.3)",
                  }}
                ></div>
              </div>

              {/* 中央のクロスヘア */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-4 h-4 border border-white opacity-60">
                  <div className="absolute inset-0 border border-black opacity-30"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 説明テキスト */}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            画像をドラッグして位置を調整し、ズームスライダーでサイズを変更できます
            <br />
            青い円内の部分がプロフィール画像として保存されます
          </p>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleCropComplete}
              loading={loading}
            >
              適用
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropper;

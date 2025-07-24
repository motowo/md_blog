import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SingleItemCarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const SingleItemCarousel: React.FC<SingleItemCarouselProps> = ({
  children,
  autoPlay = true,
  interval = 3000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = children.length;

  // 自動再生の設定
  useEffect(() => {
    if (autoPlay && !isPaused && totalItems > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isPaused, autoPlay, interval, totalItems]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (totalItems === 0) {
    return <div className={className}>コンテンツがありません</div>;
  }

  if (totalItems === 1) {
    return <div className={className}>{children[0]}</div>;
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* カルーセルコンテナ */}
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              style={{ minWidth: "100%" }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-400 p-3 shadow-lg transition-all duration-200 z-10 opacity-80 hover:opacity-100"
        aria-label="前へ"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700 hover:text-blue-600" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-400 p-3 shadow-lg transition-all duration-200 z-10 opacity-80 hover:opacity-100"
        aria-label="次へ"
      >
        <ChevronRight className="h-5 w-5 text-gray-700 hover:text-blue-600" />
      </button>

      {/* インジケーター */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {Array.from({ length: totalItems }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ease-in-out border-2 ${
              index === currentIndex
                ? "bg-blue-600 border-blue-600 shadow-lg transform scale-125"
                : "bg-white border-gray-400 hover:bg-gray-100 hover:border-gray-600 shadow-md"
            }`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </div>

      {/* 現在位置表示 */}
      <div className="absolute top-4 right-4 bg-white/90 border border-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md z-10 backdrop-blur-sm">
        {currentIndex + 1} / {totalItems}
      </div>
    </div>
  );
};

export default SingleItemCarousel;

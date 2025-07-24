import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  itemsPerView?: number;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoPlay = true,
  interval = 5000,
  itemsPerView = 3,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalItems = children.length;
  const totalPages = Math.ceil(totalItems / itemsPerView);

  // 自動再生の設定
  useEffect(() => {
    if (autoPlay && !isPaused && totalPages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isPaused, autoPlay, interval, totalPages]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
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

  // 表示する要素の計算
  const startIndex = currentIndex * itemsPerView;
  const visibleItems = children.slice(startIndex, startIndex + itemsPerView);

  // アイテムが足りない場合は空のdivで埋める
  while (visibleItems.length < itemsPerView) {
    visibleItems.push(<div key={`empty-${visibleItems.length}`} />);
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* カルーセルコンテナ */}
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / totalPages}%)`,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex w-full flex-shrink-0"
              style={{ width: `${100 / totalPages}%` }}
            >
              {children
                .slice(pageIndex * itemsPerView, (pageIndex + 1) * itemsPerView)
                .map((child, itemIndex) => (
                  <div
                    key={`${pageIndex}-${itemIndex}`}
                    className="px-2"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    {child}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* ナビゲーションボタン */}
      {totalPages > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg transition-opacity hover:opacity-80 dark:bg-gray-800"
            aria-label="前へ"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg transition-opacity hover:opacity-80 dark:bg-gray-800"
            aria-label="次へ"
          >
            <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </>
      )}

      {/* インジケーター */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-blue-600 dark:bg-blue-400"
                  : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              }`}
              aria-label={`スライド ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;

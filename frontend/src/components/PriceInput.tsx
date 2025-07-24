import React, { useState, useEffect } from "react";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "100",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // 価格候補（よく使われる価格帯）
  const pricePresets = [100, 200, 300, 500, 800, 1000, 1500, 2000, 3000, 5000];

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseInt(newValue) || 0;
    onChange(numValue);
  };

  const handlePresetPrice = (price: number) => {
    setInputValue(price.toString());
    onChange(price);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {/* 価格入力フィールド */}
        <div className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min="10"
            step="10"
            placeholder={placeholder}
            disabled={disabled}
            inputMode="numeric"
            className="w-full px-3 py-2 pr-12 text-right font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
            円
          </div>
        </div>

        {/* 注釈 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• 最低10円から設定可能</p>
          <p>• 10円単位での設定となります</p>
          {!disabled && <p>• おすすめの価格は下のボタンから選択可能</p>}
        </div>

        {/* 価格プリセット */}
        {!disabled && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              おすすめの価格:
            </div>
            <div className="flex flex-wrap gap-2">
              {pricePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetPrice(preset)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    value === preset
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  ¥{formatPrice(preset)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceInput;

import { useState, useEffect, useRef, useCallback } from "react";

// 保存ステータスの型定義
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface AutoSaveOptions<T = unknown> {
  /** 自動保存間隔（ミリ秒） */
  interval?: number;
  /** ローカルストレージのキー */
  storageKey?: string;
  /** 保存処理（サーバー側） */
  onSave?: (data: T) => Promise<void>;
  /** 自動保存が無効な場合（例：送信中） */
  disabled?: boolean;
}

export interface AutoSaveResult<T = unknown> {
  /** 現在の保存状態 */
  saveStatus: SaveStatus;
  /** 最後に保存された時刻 */
  lastSaved: Date | null;
  /** 手動保存の実行 */
  forceSave: () => Promise<void>;
  /** ローカルストレージから復元 */
  restoreFromStorage: () => T | null;
  /** ローカルストレージをクリア */
  clearStorage: () => void;
  /** 未保存の変更があるかどうか */
  hasUnsavedChanges: boolean;
}

/**
 * 自動保存機能のカスタムフック
 */
export const useAutoSave = <T = unknown>(
  data: T,
  options: AutoSaveOptions<T> = {},
): AutoSaveResult<T> => {
  const {
    interval = 5000, // 5秒間隔
    storageKey = "autosave-data",
    onSave,
    disabled = false,
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const dataRef = useRef(data);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>("");

  // データが変更されたときの処理
  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    const hasChanged = currentDataString !== lastSavedDataRef.current;

    if (hasChanged && lastSavedDataRef.current !== "") {
      setSaveStatus("unsaved");
      setHasUnsavedChanges(true);
    }

    dataRef.current = data;
  }, [data]);

  // ローカルストレージに保存
  const saveToStorage = useCallback(
    (saveData: T) => {
      try {
        const storageData = {
          data: saveData,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    },
    [storageKey],
  );

  // ローカルストレージから復元
  const restoreFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        return parsedData.data;
      }
    } catch (error) {
      console.warn("Failed to restore from localStorage:", error);
    }
    return null;
  }, [storageKey]);

  // ローカルストレージをクリア
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }, [storageKey]);

  // 保存処理
  const performSave = useCallback(async () => {
    if (disabled) return;

    const currentData = dataRef.current;
    const currentDataString = JSON.stringify(currentData);

    // 変更がない場合は保存をスキップ
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    setSaveStatus("saving");

    try {
      // ローカルストレージに保存（常に実行）
      saveToStorage(currentData);

      // サーバー保存（onSaveが提供されている場合）
      if (onSave) {
        await onSave(currentData);
      }

      // 成功時の処理
      lastSavedDataRef.current = currentDataString;
      setSaveStatus("saved");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("error");
      // エラーの場合も、ローカルストレージには保存されている
    }
  }, [disabled, onSave, saveToStorage]);

  // 手動保存
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  // 自動保存タイマー
  useEffect(() => {
    if (disabled || !hasUnsavedChanges) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, interval, disabled, hasUnsavedChanges, performSave]);

  // 初期データの設定
  useEffect(() => {
    lastSavedDataRef.current = JSON.stringify(data);
  }, [data]);

  // ページ離脱時の保存
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // 最後に一度保存を試行
        saveToStorage(dataRef.current);

        // ユーザーに警告表示
        event.preventDefault();
        event.returnValue =
          "未保存の変更があります。本当にページを離れますか？";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, saveToStorage]);

  return {
    saveStatus,
    lastSaved,
    forceSave,
    restoreFromStorage,
    clearStorage,
    hasUnsavedChanges,
  };
};

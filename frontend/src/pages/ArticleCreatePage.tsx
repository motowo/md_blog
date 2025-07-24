import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownEditor from "../components/MarkdownEditor";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PriceInput from "../components/PriceInput";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import SaveStatusIndicator from "../components/SaveStatusIndicator";
import DraftRecovery from "../components/DraftRecovery";
import { ArticleService } from "../utils/articleApi";
import { TagService } from "../utils/tagApi";
import { useAuth } from "../contexts/AuthContextDefinition";
import { useAutoSave } from "../hooks/useAutoSave";
import { suggestTags, getConfidenceLevel } from "../utils/tagSuggestion";
import type { Tag } from "../types/tag";

interface ArticleFormData {
  title: string;
  content: string;
  is_paid: boolean;
  price: number;
  tag_ids: number[];
}

const ArticleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<
    { id: number; name: string; confidence: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    is_paid: false,
    price: 0,
    tag_ids: [],
  });

  // 自動保存機能
  const {
    saveStatus,
    lastSaved,
    forceSave,
    restoreFromStorage,
    clearStorage,
    hasUnsavedChanges,
  } = useAutoSave(
    { ...formData, selectedTags },
    {
      storageKey: "article-create-autosave",
      interval: 5000, // 5秒間隔
      disabled: isSubmitting,
    },
  );

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await TagService.getTags();
        // APIレスポンスが配列であることを確認
        if (Array.isArray(tags)) {
          setAvailableTags(tags);
        } else {
          console.warn("Tags response is not an array:", tags);
          setAvailableTags([]);
        }
      } catch (error) {
        console.error("タグの取得に失敗しました:", error);
        setAvailableTags([]);
      }
    };

    fetchTags();
  }, []);

  // 下書き復元チェック
  useEffect(() => {
    const checkForDraft = () => {
      const draftData = restoreFromStorage();
      if (draftData) {
        // データが存在し、かつ空でない場合にのみ復元オプションを表示
        const hasContent = draftData.title?.trim() || draftData.content?.trim();
        if (hasContent) {
          setShowDraftRecovery(true);
        }
      }
    };

    checkForDraft();
  }, [restoreFromStorage]);

  // タグ提案の更新
  useEffect(() => {
    if (availableTags.length > 0 && (formData.title || formData.content)) {
      const suggestions = suggestTags(
        formData.title,
        formData.content,
        availableTags,
      );
      setSuggestedTags(suggestions);
    } else {
      setSuggestedTags([]);
    }
  }, [formData.title, formData.content, availableTags]);

  // 下書き復元ハンドラー
  const handleDraftRestore = (
    draftData: Partial<ArticleFormData & { selectedTags: number[] }>,
  ) => {
    if (draftData.title !== undefined)
      setFormData((prev) => ({ ...prev, title: draftData.title }));
    if (draftData.content !== undefined)
      setFormData((prev) => ({ ...prev, content: draftData.content }));
    // 管理者の場合は有料記事設定をクリア
    if (draftData.is_paid !== undefined)
      setFormData((prev) => ({
        ...prev,
        is_paid: user?.role === "admin" ? false : draftData.is_paid,
      }));
    if (draftData.price !== undefined)
      setFormData((prev) => ({
        ...prev,
        price: user?.role === "admin" ? 0 : draftData.price,
      }));
    if (draftData.selectedTags && Array.isArray(draftData.selectedTags)) {
      setSelectedTags(draftData.selectedTags);
      setFormData((prev) => ({ ...prev, tag_ids: draftData.selectedTags }));
    }
  };

  // 下書き破棄ハンドラー
  const handleDraftDiscard = () => {
    clearStorage();
  };

  const handleInputChange =
    (field: keyof ArticleFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.type === "number"
            ? Number(e.target.value)
            : e.target.value;

      setFormData((prev) => {
        const newData = {
          ...prev,
          [field]: value,
        };

        // 無料に変更した場合、価格を0にリセット
        if (field === "is_paid" && !value) {
          newData.price = 0;
        }

        return newData;
      });
    };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) => {
      const newSelection = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];

      setFormData((current) => ({
        ...current,
        tag_ids: newSelection,
      }));

      return newSelection;
    });
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("タイトルを入力してください。");
      return false;
    }
    if (!formData.content.trim()) {
      setError("本文を入力してください。");
      return false;
    }
    if (formData.is_paid && formData.price < 10) {
      setError("有料記事の場合は価格を10円以上に設定してください。");
      return false;
    }
    if (formData.is_paid && formData.price % 10 !== 0) {
      setError("価格は10円単位で設定してください。");
      return false;
    }
    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "published",
  ) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        is_paid: user?.role === "admin" ? false : formData.is_paid,
        price: user?.role === "admin" ? 0 : formData.price,
        status: status,
      };

      const article = await ArticleService.createArticle(submitData);

      // 記事作成が成功し、IDが存在する場合のみタグを処理
      if (article && article.id && selectedTags.length > 0) {
        try {
          await ArticleService.updateArticleTags(article.id, selectedTags);
        } catch (tagError) {
          console.warn(
            "タグの設定に失敗しましたが、記事作成は成功しました:",
            tagError,
          );
        }
      }

      if (!article || !article.id) {
        throw new Error(
          "記事の作成に失敗しました。レスポンスにIDが含まれていません。",
        );
      }

      // 記事作成成功時に自動保存をクリア
      clearStorage();

      navigate(`/articles/${article.id}`, {
        state: {
          message: `記事が${status === "draft" ? "下書きとして保存" : "作成・公開"}されました。`,
        },
      });
    } catch (error: unknown) {
      console.error("記事の作成に失敗しました:", error);
      let errorMessage = "記事の作成に失敗しました。もう一度お試しください。";

      if (error instanceof Error) {
        if ("response" in error) {
          const responseError = error as {
            response?: { data?: { message?: string } };
          };
          errorMessage = responseError.response?.data?.message || errorMessage;
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-2 py-8">
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 dark:text-gray-400">
              記事を作成するにはログインが必要です。
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 管理者の場合は有料記事機能を無効にする
  const isAdmin = user.role === "admin";

  return (
    <div className="max-w-6xl mx-auto px-2 py-8">
      <div className="mb-6">
        {/* 上部ボタンエリア */}
        <div className="flex justify-between items-center mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/articles")}
            disabled={isSubmitting}
          >
            ← 記事一覧に戻る
          </Button>
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "下書き保存"}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "公開中..." : "作成・公開"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              新しい記事を作成
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Markdownを使って記事を書くことができます。リアルタイムでプレビューも確認できます。
            </p>
          </div>

          {/* 保存状態表示 */}
          <div className="flex items-center space-x-4">
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={forceSave}
                disabled={isSubmitting}
              >
                手動保存
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 下書き復元 */}
        {showDraftRecovery &&
          (() => {
            const stored = localStorage.getItem("article-create-autosave");
            let draftData = { data: {}, timestamp: new Date().toISOString() };

            if (stored) {
              try {
                const parsedData = JSON.parse(stored);
                draftData = {
                  data: parsedData.data || {},
                  timestamp: parsedData.timestamp || new Date().toISOString(),
                };
              } catch (error) {
                console.warn("Failed to parse draft data:", error);
              }
            }

            return (
              <DraftRecovery
                draftData={draftData}
                onRestore={handleDraftRestore}
                onDiscard={() => {
                  handleDraftDiscard();
                  setShowDraftRecovery(false);
                }}
              />
            );
          })()}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* タイトル入力 */}
        <div className="mb-4">
          <Input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="記事のタイトル"
            className="text-xl font-bold"
            disabled={isSubmitting}
          />
        </div>

        {/* 記事設定セクション（タイトル入力欄と本文編集の間に配置） */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex space-x-8">
              {/* 左側：記事タイプと価格設定 */}
              <div className="flex-1 space-y-4">
                {!isAdmin && (
                  <>
                    {/* 記事タイプ設定 */}
                    <div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-sm ${!formData.is_paid ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          無料
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="is_paid"
                            checked={formData.is_paid}
                            onChange={handleInputChange("is_paid")}
                            disabled={isSubmitting}
                            className="sr-only"
                          />
                          <label
                            htmlFor="is_paid"
                            className={`flex items-center cursor-pointer ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                          >
                            <div
                              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                formData.is_paid
                                  ? "bg-orange-500"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            >
                              <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                  formData.is_paid
                                    ? "translate-x-6"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                          </label>
                        </div>
                        <span
                          className={`text-sm ${formData.is_paid ? "text-orange-600 dark:text-orange-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          有料
                        </span>
                      </div>
                    </div>

                    {/* 価格設定 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        価格設定
                      </label>
                      <PriceInput
                        value={formData.price}
                        onChange={(price) =>
                          setFormData((prev) => ({ ...prev, price }))
                        }
                        disabled={isSubmitting || !formData.is_paid}
                        placeholder="100"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* 右側：タグ選択 */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  タグ
                </label>

                {/* タグ提案セクション */}
                {suggestedTags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        💡 提案されたタグ
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (記事内容から自動提案)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        const confidenceLevel = getConfidenceLevel(
                          tag.confidence,
                        );
                        const confidenceColor =
                          confidenceLevel === "high"
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                            : confidenceLevel === "medium"
                              ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                              : "border-gray-400 bg-gray-50 dark:bg-gray-800";

                        return (
                          <button
                            key={`suggested-${tag.id}`}
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
                            disabled={isSubmitting}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border-2 ${
                              isSelected
                                ? "bg-blue-500 text-white border-blue-500"
                                : `${confidenceColor} text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30`
                            }`}
                            title={`提案度: ${confidenceLevel.toUpperCase()}`}
                          >
                            {tag.name}
                            {!isSelected && (
                              <span className="ml-1 text-xs opacity-70">
                                {confidenceLevel === "high"
                                  ? "🔥"
                                  : confidenceLevel === "medium"
                                    ? "⭐"
                                    : "💡"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 全タグ表示 */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      📋 すべてのタグ
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSuggested = suggestedTags.some(
                        (s) => s.id === tag.id,
                      );
                      if (isSuggested) return null; // 提案タグは上に表示済みなのでスキップ

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          disabled={isSubmitting}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag.id)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {availableTags.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    利用可能なタグがありません。
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Markdownエディタ */}
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
          placeholder="記事の内容をMarkdownで書いてください..."
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ArticleCreatePage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MarkdownEditor from "../components/MarkdownEditor";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import SaveStatusIndicator from "../components/SaveStatusIndicator";
import DraftRecovery from "../components/DraftRecovery";
import { ArticleService } from "../utils/articleApi";
import { TagService } from "../utils/tagApi";
import { useAuth } from "../contexts/AuthContextDefinition";
import { useAutoSave } from "../hooks/useAutoSave";
import type { Article } from "../types/article";
import type { Tag } from "../types/tag";

interface ArticleFormData {
  title: string;
  content: string;
  is_paid: boolean;
  price: number;
  tag_ids: number[];
}

const ArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    is_paid: false,
    price: 0,
    tag_ids: [],
  });

  // 自動保存機能（記事IDベース）
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
      storageKey: `article-edit-autosave-${id}`,
      interval: 5000, // 5秒間隔
      disabled: isSubmitting || isLoading,
    },
  );

  // 記事データとタグ一覧を取得
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("記事IDが指定されていません。");
        setIsLoading(false);
        return;
      }

      try {
        const [articleResponse, tags] = await Promise.all([
          ArticleService.getArticle(Number(id)),
          TagService.getTags(),
        ]);

        setArticle(articleResponse);

        // APIレスポンスが配列であることを確認
        if (Array.isArray(tags)) {
          setAvailableTags(tags);
        } else {
          console.warn("Tags response is not an array:", tags);
          setAvailableTags([]);
        }

        // フォームデータを初期化（管理者の場合は有料記事を無料に強制変更）
        setFormData({
          title: articleResponse.title,
          content: articleResponse.content,
          is_paid: user?.role === "admin" ? false : articleResponse.is_paid,
          price: user?.role === "admin" ? 0 : (articleResponse.price || 0),
          tag_ids: articleResponse.tags?.map((tag) => tag.id) || [],
        });

        // 選択されたタグを設定
        setSelectedTags(articleResponse.tags?.map((tag) => tag.id) || []);

        // データ読み込み後に下書き復元をチェック
        setTimeout(() => {
          const draftData = restoreFromStorage();
          if (draftData) {
            const hasContent =
              draftData.title?.trim() || draftData.content?.trim();
            // 元の記事と異なる内容があるかチェック
            const isDifferent =
              draftData.title !== articleResponse.title ||
              draftData.content !== articleResponse.content ||
              draftData.is_paid !== articleResponse.is_paid ||
              draftData.price !== (articleResponse.price || 0);

            if (hasContent && isDifferent) {
              setShowDraftRecovery(true);
            }
          }
        }, 100);
      } catch (error: unknown) {
        console.error("データの取得に失敗しました:", error);
        const is404Error =
          error instanceof Error &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status ===
            404;
        setError(
          is404Error ? "記事が見つかりません。" : "記事の取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, restoreFromStorage]);

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
      setFormData((prev) => ({ ...prev, is_paid: user?.role === "admin" ? false : draftData.is_paid }));
    if (draftData.price !== undefined)
      setFormData((prev) => ({ ...prev, price: user?.role === "admin" ? 0 : draftData.price }));
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

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
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
    if (formData.is_paid && formData.price <= 0) {
      setError("有料記事の場合は価格を設定してください。");
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

    if (!validateForm() || !article) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        is_paid: user?.role === "admin" ? false : formData.is_paid,
        price: user?.role === "admin" ? 0 : formData.price,
        status: status,
      };

      await ArticleService.updateArticle(article.id, submitData);

      // タグの更新
      if (selectedTags.length > 0 || article.tags?.length) {
        try {
          await ArticleService.updateArticleTags(article.id, selectedTags);
        } catch (tagError) {
          console.warn(
            "タグの更新に失敗しましたが、記事更新は成功しました:",
            tagError,
          );
        }
      }

      // 記事更新成功時に自動保存をクリア
      clearStorage();

      navigate(`/articles/${article.id}`, {
        state: {
          message: `記事が${status === "draft" ? "下書きとして保存" : "更新・公開"}されました。`,
        },
      });
    } catch (error: unknown) {
      console.error("記事の更新に失敗しました:", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(
        errorMessage || "記事の更新に失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;

    const confirmed = window.confirm(
      "この記事を削除しますか？この操作は取り消せません。",
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await ArticleService.deleteArticle(article.id);
      navigate("/articles", {
        state: { message: "記事が削除されました。" },
      });
    } catch (error: unknown) {
      console.error("記事の削除に失敗しました:", error);
      setError("記事の削除に失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-center text-red-600 dark:text-red-400">
              {error}
            </p>
            <div className="text-center mt-4">
              <Button onClick={() => navigate("/articles")}>
                記事一覧に戻る
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 dark:text-gray-400">
              記事を編集する権限がありません。
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 作成者または管理者のみ編集可能
  const canEdit = user.id === article.user_id || user.role === "admin";
  
  // 管理者の場合は有料記事機能を無効にする
  const isAdmin = user.role === "admin";
  
  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 dark:text-gray-400">
              この記事を編集する権限がありません。
            </p>
            <div className="text-center mt-4">
              <Button onClick={() => navigate(`/articles/${article.id}`)}>
                記事を表示
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            記事を編集
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Markdownを使って記事を編集できます。リアルタイムでプレビューも確認できます。
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

      <div className="space-y-6">
        {/* 下書き復元 */}
        {showDraftRecovery &&
          (() => {
            const stored = localStorage.getItem(`article-edit-autosave-${id}`);
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

        {/* Markdownエディタ */}
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
          onTitleChange={(title) => setFormData((prev) => ({ ...prev, title }))}
          title={formData.title}
          placeholder="記事の内容をMarkdownで書いてください..."
          disabled={isSubmitting}
        />

        {/* 記事設定 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              記事設定
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* 有料設定（管理者の場合は非表示） */}
            {!isAdmin && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_paid"
                    checked={formData.is_paid}
                    onChange={handleInputChange("is_paid")}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_paid"
                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    有料記事にする
                  </label>
                </div>

                {formData.is_paid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      価格（円）
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange("price")}
                      min="1"
                      placeholder="100"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            )}

            {/* タグ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                タグ
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
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
                ))}
              </div>
              {availableTags.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  利用可能なタグがありません。
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 送信・削除ボタン */}
        <div className="flex justify-between">
          <div className="space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/articles/${article.id}`)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              削除
            </Button>
          </div>
          <div className="space-x-3">
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
              {isSubmitting ? "更新中..." : "更新・公開"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditPage;

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ArticleService } from "../utils/articleApi";
import { useAuth } from "../contexts/AuthContextDefinition";
import Button from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { PaidArticleAccessModal } from "../components/PaidArticleAccessModal";
import type { Article } from "../types/article";
import { getBadgeClass } from "../constants/badgeStyles";
import { formatCurrency } from "../utils/currency";

// PrismJS core - 必ず最初にインポート
import Prism from "prismjs";
// PrismJS CSS for syntax highlighting (light theme)
import "prismjs/themes/prism.css";
// カスタムCSS
import "../styles/markdown.css";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

// PrismJS言語を動的にロード
const loadPrismLanguage = async (language: string): Promise<void> => {
  try {
    switch (language) {
      case "javascript":
      case "js":
        await import("prismjs/components/prism-javascript");
        break;
      case "typescript":
      case "ts":
        // TypeScriptはJavaScriptに依存するため、先にJavaScriptを読み込む
        await import("prismjs/components/prism-javascript");
        await import("prismjs/components/prism-typescript");
        break;
      case "jsx":
        // JSXはJavaScriptに依存するため、先にJavaScriptを読み込む
        await import("prismjs/components/prism-javascript");
        await import("prismjs/components/prism-jsx");
        break;
      case "tsx":
        // TSXはTypeScriptとJSXに依存するため、必要な依存関係を先に読み込む
        await import("prismjs/components/prism-javascript");
        await import("prismjs/components/prism-typescript");
        await import("prismjs/components/prism-jsx");
        await import("prismjs/components/prism-tsx");
        break;
      case "php":
        await import("prismjs/components/prism-php");
        break;
      case "python":
      case "py":
        await import("prismjs/components/prism-python");
        break;
      case "go":
        await import("prismjs/components/prism-go");
        break;
      case "rust":
        await import("prismjs/components/prism-rust");
        break;
      case "java":
        await import("prismjs/components/prism-java");
        break;
      case "csharp":
      case "cs":
        await import("prismjs/components/prism-csharp");
        break;
      case "css":
        await import("prismjs/components/prism-css");
        break;
      case "scss":
        await import("prismjs/components/prism-scss");
        break;
      case "bash":
      case "shell":
        await import("prismjs/components/prism-bash");
        break;
      case "json":
        await import("prismjs/components/prism-json");
        break;
      case "yaml":
      case "yml":
        await import("prismjs/components/prism-yaml");
        break;
      case "sql":
        await import("prismjs/components/prism-sql");
        break;
      case "docker":
      case "dockerfile":
        await import("prismjs/components/prism-docker");
        break;
      case "markdown":
      case "md":
        await import("prismjs/components/prism-markdown");
        break;
    }
  } catch (error) {
    console.warn(`Failed to load Prism language: ${language}`, error);
  }
};

// 言語検出とシンタックスハイライト用のヘルパー関数
const detectLanguageFromContent = (content: string): string => {
  const firstLine = content.split("\n")[0].trim().toLowerCase();

  // 一行目から言語を推測
  if (firstLine.includes("import ") && firstLine.includes("from ")) {
    if (firstLine.includes(".tsx") || firstLine.includes("tsx")) return "tsx";
    if (firstLine.includes(".jsx") || firstLine.includes("jsx")) return "jsx";
    if (firstLine.includes("react")) return "typescript";
    return "javascript";
  }

  if (firstLine.includes("<?php") || firstLine.includes("namespace "))
    return "php";
  if (
    firstLine.includes("def ") ||
    (firstLine.includes("import ") && firstLine.includes("from"))
  )
    return "python";
  if (firstLine.includes("func ") || firstLine.includes("package "))
    return "go";
  if (firstLine.includes("fn ") || firstLine.includes("use ")) return "rust";
  if (firstLine.includes("public class") || firstLine.includes("package "))
    return "java";
  if (firstLine.includes("using ") || firstLine.includes("namespace "))
    return "csharp";
  if (firstLine.includes("SELECT") || firstLine.includes("CREATE"))
    return "sql";
  if (firstLine.includes("FROM ") && firstLine.includes(":")) return "docker";
  if (firstLine.includes("{") || firstLine.includes('"')) return "json";
  if (firstLine.includes("---") || firstLine.includes("apiVersion:"))
    return "yaml";
  if (
    firstLine.includes("#!/bin/bash") ||
    firstLine.includes("npm ") ||
    firstLine.includes("git ")
  )
    return "bash";

  // コンテンツから推測
  if (
    content.includes("function ") ||
    content.includes("const ") ||
    content.includes("let ")
  ) {
    if (
      content.includes("interface ") ||
      content.includes(": string") ||
      content.includes(": number")
    )
      return "typescript";
    if (
      content.includes("<") &&
      content.includes(">") &&
      content.includes("jsx")
    )
      return "jsx";
    if (content.includes("<") && content.includes(">")) return "tsx";
    return "javascript";
  }

  if (
    content.includes("div") &&
    content.includes("class") &&
    content.includes("{")
  )
    return "css";

  return "text"; // デフォルト
};

// コードブロックコンポーネント（シンタックスハイライト付き）
const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState<string>("");

  // 子要素からテキストを抽出
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (React.isValidElement(node) && node.props.children) {
      return extractText(node.props.children);
    }
    if (Array.isArray(node)) {
      return node.map(extractText).join("");
    }
    return "";
  };

  const codeText = extractText(children);

  // 言語を取得
  const getLanguage = () => {
    if (className) {
      const match = className.match(/language-(\w+)/);
      if (match) return match[1];
    }
    if (React.isValidElement(children) && children.props?.className) {
      const match = children.props.className.match(/language-(\w+)/);
      if (match) return match[1];
    }
    return detectLanguageFromContent(codeText);
  };

  const language = getLanguage();

  // シンタックスハイライトを適用
  useEffect(() => {
    const applyHighlight = async () => {
      if (language !== "text" && codeText) {
        try {
          // 言語ファイルを動的にロード
          await loadPrismLanguage(language);

          // 少し待ってから言語が利用可能かチェック
          setTimeout(() => {
            if (Prism.languages[language]) {
              try {
                const highlightedCode = Prism.highlight(
                  codeText,
                  Prism.languages[language],
                  language,
                );
                setHighlighted(highlightedCode);
              } catch (highlightError) {
                console.warn(
                  `Failed to apply syntax highlighting for ${language}:`,
                  highlightError,
                );
                setHighlighted(codeText);
              }
            } else {
              console.warn(`Language ${language} not available in Prism`);
              setHighlighted(codeText);
            }
          }, 100);
        } catch (error) {
          console.warn(
            `Failed to load language support for: ${language}`,
            error,
          );
          setHighlighted(codeText);
        }
      } else {
        setHighlighted(codeText);
      }
    };

    if (codeText) {
      applyHighlight();
    }
  }, [codeText, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="code-block-container relative group">
      {/* 右上のコントロール */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        {/* 言語ラベル */}
        {language !== "text" && (
          <span className="px-2 py-1 text-xs bg-gray-600 dark:bg-gray-500 text-white rounded">
            {language.toUpperCase()}
          </span>
        )}

        {/* コピーボタン */}
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs bg-gray-700 dark:bg-gray-600 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors opacity-0 group-hover:opacity-100"
          title="コードをコピー"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      <pre
        className={`language-${language} ${className || ""} relative overflow-x-auto`}
      >
        {highlighted ? (
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : (
          <code className={`language-${language}`}>{codeText}</code>
        )}
      </pre>
    </div>
  );
};

export const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError("記事IDが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 記事詳細を取得
        const response = await ArticleService.getArticle(parseInt(id));
        const articleData = response.data;

        setArticle(articleData);

        // 購入済み判定
        if (response.has_purchased !== undefined) {
          setIsPurchased(response.has_purchased);
        } else {
          // 無料記事、投稿者本人、管理者の場合
          setIsPurchased(!articleData.is_paid || !response.is_preview);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            読み込み中...
          </span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 text-lg mb-4">
                {error || "記事が見つかりません"}
              </p>
              <Link to="/articles">
                <Button variant="primary">記事一覧に戻る</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 投稿者本人または管理者かどうかをチェック (現在は未使用だが将来的に使用予定)
  // const isAuthorOrAdmin =
  //   user && (user.id === article.user_id || user.role === "admin");

  const contentToShow = article.content;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* パンくずナビ */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">
            ホーム
          </Link>
          <span>/</span>
          <Link
            to="/articles"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            記事一覧
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{article.title}</span>
        </div>
      </nav>

      <article>
        {/* 記事ヘッダー */}
        <Card className="mb-8">
          <CardHeader>
            {/* タイトル */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                {article.user && (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {article.user.profile_public ? (
                      <Link
                        to={`/users/${article.user.username}`}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {article.user.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {article.user.name}
                      </span>
                    )}
                    {/* 自分の記事の場合はアイコンを表示 */}
                    {user && user.id === article.user_id && (
                      <span
                        className={`ml-2 ${getBadgeClass("metrics", "owner")}`}
                        title="あなたの記事"
                      >
                        ✏️ 投稿者
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formatDate(article.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {article.is_paid ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {formatCurrency(article.price || 0)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    無料
                  </span>
                )}

                {/* 編集ボタン（作成者または管理者のみ） */}
                {user &&
                  (user.id === article.user_id || user.role === "admin") && (
                    <Link to={`/articles/${article.id}/edit`}>
                      <Button variant="outline" size="sm">
                        ✏️ 編集
                      </Button>
                    </Link>
                  )}
              </div>
            </div>

            {/* タグ */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/articles?tag=${tag.slug}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* 記事本文 */}
        <Card>
          <CardBody>
            {/* 有料記事で未購入かつ投稿者以外の場合の購入促進 */}
            {article.is_paid && !isPurchased && (
              <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  この記事は有料コンテンツです
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  続きを読むには記事を購入してください。
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {formatCurrency(article.price || 0)}
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!user) {
                        navigate("/login");
                      } else {
                        setShowPaymentModal(true);
                      }
                    }}
                  >
                    記事を購入する
                  </Button>
                </div>
              </div>
            )}

            {/* 表示モード切り替えボタン */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                記事内容
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "preview"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  📖 プレビュー
                </button>
                <button
                  onClick={() => setViewMode("markdown")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "markdown"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  📝 マークダウン
                </button>
              </div>
            </div>

            {/* コンテンツ表示 */}
            {viewMode === "preview" ? (
              /* プレビューモード（マークダウンレンダリング） */
              <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    pre: ({ children, ...props }) => (
                      <CodeBlock {...props}>{children}</CodeBlock>
                    ),
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      if (match) {
                        // ブロックコードの場合はpreで処理される
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                      // インラインコードの場合
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // カスタムコンポーネントでスタイリングを制御
                    h1: ({ children, ...props }) => (
                      <h1
                        {...props}
                        className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700"
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2
                        {...props}
                        className="text-2xl font-semibold mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700"
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3
                        {...props}
                        className="text-xl font-semibold mt-5 mb-2"
                      >
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote
                        {...props}
                        className="border-l-4 border-blue-500 pl-4 my-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg italic"
                      >
                        {children}
                      </blockquote>
                    ),
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table
                          {...props}
                          className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children, ...props }) => (
                      <thead {...props} className="bg-gray-50 dark:bg-gray-800">
                        {children}
                      </thead>
                    ),
                    th: ({ children, ...props }) => (
                      <th
                        {...props}
                        className="px-4 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700"
                      >
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td
                        {...props}
                        className="px-4 py-2 border-b border-gray-100 dark:border-gray-700"
                      >
                        {children}
                      </td>
                    ),
                    a: ({ children, href, ...props }) => (
                      <a
                        {...props}
                        href={href}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-transparent hover:decoration-current transition-all"
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href?.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {children}
                      </a>
                    ),
                    img: ({ src, alt, ...props }) => (
                      <img
                        {...props}
                        src={src}
                        alt={alt}
                        className="max-w-full h-auto rounded-lg shadow-md my-4"
                      />
                    ),
                    hr: ({ ...props }) => (
                      <hr
                        {...props}
                        className="my-8 border-gray-200 dark:border-gray-700"
                      />
                    ),
                  }}
                >
                  {contentToShow}
                </ReactMarkdown>
              </div>
            ) : (
              /* マークダウンモード（生テキスト表示） */
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(contentToShow);
                        // 簡単なフィードバック - より良いソリューションはtoastライブラリを使用
                        const btn = document.activeElement as HTMLButtonElement;
                        const originalText = btn.textContent;
                        btn.textContent = "✓ コピー済み";
                        setTimeout(() => {
                          btn.textContent = originalText;
                        }, 2000);
                      } catch (err) {
                        console.error("Failed to copy markdown:", err);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-gray-700 dark:bg-gray-600 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors"
                    title="マークダウンをコピー"
                  >
                    📋 コピー
                  </button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">
                  <code className="text-gray-800 dark:text-gray-200 font-mono">
                    {contentToShow}
                  </code>
                </pre>
              </div>
            )}

            {/* 有料記事で未購入の場合の続きを読むボタン */}
            {article.is_paid && !isPurchased && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    続きを読むには記事を購入してください
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!user) {
                        navigate("/login");
                      } else {
                        setShowPaymentModal(true);
                      }
                    }}
                  >
                    {formatCurrency(article.price || 0)}で購入する
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* 記事フッター */}
        <div className="mt-8 flex justify-between items-center">
          <Link to="/articles">
            <Button variant="outline">← 記事一覧に戻る</Button>
          </Link>

          {/* TODO: 関連記事、コメント機能などを追加 */}
        </div>
      </article>

      {/* 決済モーダル */}
      <PaidArticleAccessModal
        article={article}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPurchaseSuccess={() => {
          setShowPaymentModal(false);
          setIsPurchased(true);
        }}
        isLoggedIn={!!user}
      />
    </div>
  );
};

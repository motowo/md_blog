import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Card, CardBody, CardHeader } from "./ui/Card";

// PrismJS core - 必ず最初にインポート
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "../styles/markdown.css";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

// PrismJS言語を動的にロード（ArticleDetailPageと同じ）
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
      case "rs":
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
      case "json":
        await import("prismjs/components/prism-json");
        break;
      case "yaml":
      case "yml":
        await import("prismjs/components/prism-yaml");
        break;
      case "bash":
      case "shell":
        await import("prismjs/components/prism-bash");
        break;
      case "sql":
        await import("prismjs/components/prism-sql");
        break;
      case "docker":
      case "dockerfile":
        await import("prismjs/components/prism-docker");
        break;
      default:
        // デフォルトのプレーンテキストとして処理
        break;
    }
  } catch (error) {
    console.warn(`Failed to load Prism language: ${language}`, error);
  }
};

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const language = className?.replace("language-", "") || "";
  const code = String(children).replace(/\n$/, "");

  useEffect(() => {
    const highlightCode = async () => {
      if (language && Prism.languages[language] === undefined) {
        try {
          await loadPrismLanguage(language);
          // 少し待ってから言語が利用可能かチェック
          setTimeout(() => {
            if (codeRef.current && Prism.languages[language]) {
              try {
                Prism.highlightElement(codeRef.current);
              } catch (highlightError) {
                console.warn(
                  `Failed to apply syntax highlighting for ${language}:`,
                  highlightError,
                );
              }
            }
          }, 100);
        } catch (error) {
          console.warn(
            `Failed to load language support for: ${language}`,
            error,
          );
        }
      } else if (codeRef.current && Prism.languages[language]) {
        try {
          Prism.highlightElement(codeRef.current);
        } catch (highlightError) {
          console.warn(
            `Failed to apply syntax highlighting for ${language}:`,
            highlightError,
          );
        }
      }
    };

    highlightCode();
  }, [language, code]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="コードをコピー"
      >
        {isCopied ? "✓ コピー済み" : "📋 コピー"}
      </button>
      <pre className={`language-${language}`}>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTitleChange?: (title: string) => void;
  title?: string;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onTitleChange,
  title = "",
  placeholder = "Markdownで記事を書いてください...",
  className = "",
  showPreview = true,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // タブキー対応
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      // カーソル位置を調整
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // ツールバーボタンのクリックハンドラ
  const insertText = (insertValue: string, cursorOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newValue: string;
    let newCursorPos: number;

    if (insertValue.includes("SELECTED")) {
      newValue =
        value.substring(0, start) +
        insertValue.replace("SELECTED", selectedText) +
        value.substring(end);
      newCursorPos =
        start + insertValue.replace("SELECTED", "").length + cursorOffset;
    } else {
      newValue = value.substring(0, start) + insertValue + value.substring(end);
      newCursorPos = start + insertValue.length + cursorOffset;
    }

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    }, 0);
  };

  const components = {
    code: CodeBlock,
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-2xl font-bold mb-3 mt-6 text-gray-900 dark:text-white">
        {children}
      </h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-xl font-bold mb-2 mt-4 text-gray-900 dark:text-white">
        {children}
      </h3>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
        {children}
      </ol>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 mb-4 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 dark:border-gray-600">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white text-left">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
        {children}
      </td>
    ),
    a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className={`markdown-editor ${className}`}>
      {/* タイトル入力 */}
      {onTitleChange && (
        <div className="mb-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="記事のタイトル"
            className="text-xl font-bold"
            disabled={disabled}
          />
        </div>
      )}

      <Card>
        {showPreview && (
          <CardHeader className="pb-0">
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("write")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  activeTab === "write"
                    ? "bg-white dark:bg-gray-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                disabled={disabled}
              >
                ✏️ 編集
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-gray-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                disabled={disabled}
              >
                👁️ プレビュー
              </button>
            </div>
          </CardHeader>
        )}

        <CardBody>
          {(!showPreview || activeTab === "write") && (
            <div className="space-y-3">
              {/* ツールバー */}
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("**SELECTED**", -2)}
                  disabled={disabled}
                  className="text-xs"
                >
                  <strong>B</strong>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("*SELECTED*", -1)}
                  disabled={disabled}
                  className="text-xs italic"
                >
                  I
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("# ")}
                  disabled={disabled}
                  className="text-xs"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("## ")}
                  disabled={disabled}
                  className="text-xs"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("### ")}
                  disabled={disabled}
                  className="text-xs"
                >
                  H3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("- ")}
                  disabled={disabled}
                  className="text-xs"
                >
                  • リスト
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("1. ")}
                  disabled={disabled}
                  className="text-xs"
                >
                  1. 番号
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("[リンクテキスト](URL)", -1)}
                  disabled={disabled}
                  className="text-xs"
                >
                  🔗 リンク
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("```javascript\nコード\n```", -4)}
                  disabled={disabled}
                  className="text-xs"
                >
                  💻 コード
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("> ")}
                  disabled={disabled}
                  className="text-xs"
                >
                  " 引用
                </Button>
              </div>

              {/* エディタ */}
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
              />
            </div>
          )}

          {showPreview && activeTab === "preview" && (
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="min-h-96 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                {value ? (
                  <ReactMarkdown
                    components={components}
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {value}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    プレビューを表示するには、左側の「編集」タブでMarkdownを入力してください。
                  </p>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MarkdownEditor;

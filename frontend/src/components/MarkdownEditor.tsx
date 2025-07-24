import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Button from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";

// PrismJS core - 必ず最初にインポート
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "../styles/markdown.css";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

// SUPPORTED_LANGUAGESは constants/languages.ts で定義されています

// PrismJS言語を動的にロード（強化版）
const loadPrismLanguage = async (language: string): Promise<void> => {
  try {
    switch (language) {
      case "javascript":
      case "js":
        await import("prismjs/components/prism-javascript");
        break;
      case "typescript":
      case "ts":
        await import("prismjs/components/prism-javascript");
        await import("prismjs/components/prism-typescript");
        break;
      case "jsx":
        await import("prismjs/components/prism-javascript");
        await import("prismjs/components/prism-jsx");
        break;
      case "tsx":
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
      case "cpp":
      case "c++":
        await import("prismjs/components/prism-c");
        await import("prismjs/components/prism-cpp");
        break;
      case "c":
        await import("prismjs/components/prism-c");
        break;
      case "css":
        await import("prismjs/components/prism-css");
        break;
      case "scss":
      case "sass":
        await import("prismjs/components/prism-css");
        await import("prismjs/components/prism-scss");
        break;
      case "html":
        await import("prismjs/components/prism-markup");
        break;
      case "xml":
        await import("prismjs/components/prism-markup");
        await import("prismjs/components/prism-xml-doc");
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
      case "sh":
        await import("prismjs/components/prism-bash");
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
      case "nginx":
        await import("prismjs/components/prism-nginx");
        break;
      case "apache":
        await import("prismjs/components/prism-apacheconf");
        break;
      case "vim":
        await import("prismjs/components/prism-vim");
        break;
      case "diff":
        await import("prismjs/components/prism-diff");
        break;
      case "git":
        await import("prismjs/components/prism-git");
        break;
      default:
        // サポートされていない言語の場合はplaintextとして扱う
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
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  disabled?: boolean;
  defaultViewMode?: "split" | "tab";
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Markdownで記事を書いてください...",
  className = "",
  showPreview = true,
  disabled = false,
  defaultViewMode = "split",
}) => {
  const [viewMode, setViewMode] = useState<"split" | "tab">(defaultViewMode);
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

  // ツールバーボタンのクリックハンドラ（強化版）
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
        start +
        insertValue.replace("SELECTED", selectedText).length +
        cursorOffset;
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

  // 特殊な挿入処理
  const insertTable = () => {
    const tableTemplate = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;
    insertText(tableTemplate, -tableTemplate.length + 10);
  };

  const insertCodeBlock = (language = "javascript") => {
    const codeTemplate = `\`\`\`${language}\n// コードをここに入力\n\`\`\``;
    insertText(codeTemplate, -7);
  };

  const insertMath = () => {
    const mathTemplate = `$$
E = mc^2
$$`;
    insertText(mathTemplate, -6);
  };

  const insertChecklist = () => {
    const checklistTemplate = `- [ ] タスク1
- [ ] タスク2
- [x] 完了済みタスク`;
    insertText(checklistTemplate);
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
      <Card>
        {showPreview && (
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    表示モード:
                  </span>
                  {/* トグルスイッチ */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="viewModeToggle"
                      checked={viewMode === "split"}
                      onChange={(e) =>
                        setViewMode(e.target.checked ? "split" : "tab")
                      }
                      disabled={disabled}
                      className="sr-only"
                    />
                    <label
                      htmlFor="viewModeToggle"
                      className={`flex items-center cursor-pointer ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                        📋 タブ表示
                      </span>
                      <div
                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                          viewMode === "split"
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                            viewMode === "split"
                              ? "translate-x-7"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        📝 分割表示
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {viewMode === "tab" && (
                <div className="flex space-x-1">
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
              )}
            </div>
          </CardHeader>
        )}

        <CardBody>
          {viewMode === "split" && showPreview ? (
            // 分割表示モード
            <div className="space-y-4">
              {/* 強化されたツールバー（分割表示では上部に配置） */}
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                {/* テキスト装飾グループ */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("**SELECTED**", -2)}
                  disabled={disabled}
                  className="text-xs"
                  title="太字"
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
                  title="斜体"
                >
                  I
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("~~SELECTED~~", -2)}
                  disabled={disabled}
                  className="text-xs line-through"
                  title="取り消し線"
                >
                  S
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("`SELECTED`", -1)}
                  disabled={disabled}
                  className="text-xs font-mono"
                  title="インラインコード"
                >
                  `code`
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("==SELECTED==", -2)}
                  disabled={disabled}
                  className="text-xs"
                  title="ハイライト"
                >
                  HL
                </Button>

                {/* 区切り線 */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                {/* 見出しグループ */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("# ")}
                  disabled={disabled}
                  className="text-xs"
                  title="見出し1"
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
                  title="見出し2"
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
                  title="見出し3"
                >
                  H3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("#### ")}
                  disabled={disabled}
                  className="text-xs"
                  title="見出し4"
                >
                  H4
                </Button>

                {/* 区切り線 */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                {/* リストグループ */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("- ")}
                  disabled={disabled}
                  className="text-xs"
                  title="箇条書きリスト"
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
                  title="番号付きリスト"
                >
                  1. 番号
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertChecklist}
                  disabled={disabled}
                  className="text-xs"
                  title="チェックリスト"
                >
                  ☑ TODO
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("> ")}
                  disabled={disabled}
                  className="text-xs"
                  title="引用"
                >
                  " 引用
                </Button>

                {/* 区切り線 */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                {/* リンク・挿入グループ */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("[リンクテキスト](URL)", -1)}
                  disabled={disabled}
                  className="text-xs"
                  title="リンク"
                >
                  🔗 リンク
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("![画像の説明](画像URL)", -1)}
                  disabled={disabled}
                  className="text-xs"
                  title="画像"
                >
                  🖼️ 画像
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertTable}
                  disabled={disabled}
                  className="text-xs"
                  title="表"
                >
                  📊 表
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText("---\n")}
                  disabled={disabled}
                  className="text-xs"
                  title="水平線"
                >
                  ➖ 区切り
                </Button>

                {/* 区切り線 */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                {/* コード・数式グループ */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertCodeBlock("javascript")}
                  disabled={disabled}
                  className="text-xs"
                  title="JavaScriptコードブロック"
                >
                  💻 JS
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertCodeBlock("python")}
                  disabled={disabled}
                  className="text-xs"
                  title="Pythonコードブロック"
                >
                  🐍 Python
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertCodeBlock("bash")}
                  disabled={disabled}
                  className="text-xs"
                  title="Bashコードブロック"
                >
                  💾 Bash
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertMath}
                  disabled={disabled}
                  className="text-xs"
                  title="数式"
                >
                  📏 数式
                </Button>
              </div>

              {/* 分割エディタとプレビューエリア */}
              <div className="flex gap-4" style={{ minHeight: "600px" }}>
                {/* 左側：エディタ */}
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
                    style={{ minHeight: "600px" }}
                  />
                </div>

                {/* 右側：プレビュー */}
                <div className="flex-1">
                  <div
                    className="h-full overflow-y-auto p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ minHeight: "600px" }}
                  >
                    <div className="prose prose-lg max-w-none dark:prose-invert">
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
                          Markdownを入力するとここにプレビューが表示されます。
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // タブ表示モード（従来の動作）
            <>
              {(!showPreview || activeTab === "write") && (
                <div className="space-y-3">
                  {/* 強化されたツールバー（タブ表示） */}
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {/* テキスト装飾グループ */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("**SELECTED**", -2)}
                      disabled={disabled}
                      className="text-xs"
                      title="太字"
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
                      title="斜体"
                    >
                      I
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("~~SELECTED~~", -2)}
                      disabled={disabled}
                      className="text-xs line-through"
                      title="取り消し線"
                    >
                      S
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("`SELECTED`", -1)}
                      disabled={disabled}
                      className="text-xs font-mono"
                      title="インラインコード"
                    >
                      `code`
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("==SELECTED==", -2)}
                      disabled={disabled}
                      className="text-xs"
                      title="ハイライト"
                    >
                      HL
                    </Button>

                    {/* 区切り線 */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                    {/* 見出しグループ */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("# ")}
                      disabled={disabled}
                      className="text-xs"
                      title="見出し1"
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
                      title="見出し2"
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
                      title="見出し3"
                    >
                      H3
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("#### ")}
                      disabled={disabled}
                      className="text-xs"
                      title="見出し4"
                    >
                      H4
                    </Button>

                    {/* 区切り線 */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                    {/* リストグループ */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("- ")}
                      disabled={disabled}
                      className="text-xs"
                      title="箇条書きリスト"
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
                      title="番号付きリスト"
                    >
                      1. 番号
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertChecklist}
                      disabled={disabled}
                      className="text-xs"
                      title="チェックリスト"
                    >
                      ☑ TODO
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("> ")}
                      disabled={disabled}
                      className="text-xs"
                      title="引用"
                    >
                      " 引用
                    </Button>

                    {/* 区切り線 */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                    {/* リンク・挿入グループ */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("[リンクテキスト](URL)", -1)}
                      disabled={disabled}
                      className="text-xs"
                      title="リンク"
                    >
                      🔗 リンク
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("![画像の説明](画像URL)", -1)}
                      disabled={disabled}
                      className="text-xs"
                      title="画像"
                    >
                      🖼️ 画像
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertTable}
                      disabled={disabled}
                      className="text-xs"
                      title="表"
                    >
                      📊 表
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertText("---\n")}
                      disabled={disabled}
                      className="text-xs"
                      title="水平線"
                    >
                      ➖ 区切り
                    </Button>

                    {/* 区切り線 */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>

                    {/* コード・数式グループ */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertCodeBlock("javascript")}
                      disabled={disabled}
                      className="text-xs"
                      title="JavaScriptコードブロック"
                    >
                      💻 JS
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertCodeBlock("python")}
                      disabled={disabled}
                      className="text-xs"
                      title="Pythonコードブロック"
                    >
                      🐍 Python
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertCodeBlock("bash")}
                      disabled={disabled}
                      className="text-xs"
                      title="Bashコードブロック"
                    >
                      💾 Bash
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertMath}
                      disabled={disabled}
                      className="text-xs"
                      title="数式"
                    >
                      📏 数式
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
                    style={{ minHeight: "500px" }}
                  />
                </div>
              )}

              {showPreview && activeTab === "preview" && (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div
                    className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ minHeight: "500px" }}
                  >
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
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MarkdownEditor;

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MarkdownEditor from "../MarkdownEditor";
import { SUPPORTED_LANGUAGES } from "../../constants/languages";

describe("MarkdownEditor", () => {
  const mockOnChange = vi.fn();
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with default split view", () => {
    render(
      <MarkdownEditor
        value="# テスト見出し"
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    expect(screen.getByDisplayValue("# テスト見出し")).toBeInTheDocument();
    expect(screen.getByText("テスト見出し")).toBeInTheDocument(); // プレビューでレンダリングされた内容
    expect(screen.getByText("📝 分割表示")).toBeInTheDocument();
  });

  it("can switch to tab view using toggle", () => {
    render(
      <MarkdownEditor
        value="# テスト"
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    // トグルスイッチでタブ表示に切り替え
    const toggleInput = screen.getByRole("checkbox");
    fireEvent.click(toggleInput);

    // タブが表示される
    expect(screen.getByText("✏️ 編集")).toBeInTheDocument();
    expect(screen.getByText("👁️ プレビュー")).toBeInTheDocument();
  });

  it("shows enhanced toolbar with horizontal layout", () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    // ツールバーボタンが横並びで表示される
    expect(screen.getByTitle("太字")).toBeInTheDocument();
    expect(screen.getByTitle("斜体")).toBeInTheDocument();
    expect(screen.getByTitle("取り消し線")).toBeInTheDocument();
    expect(screen.getByTitle("インラインコード")).toBeInTheDocument();
    expect(screen.getByTitle("ハイライト")).toBeInTheDocument();

    // 見出しボタン
    expect(screen.getByTitle("見出し1")).toBeInTheDocument();
    expect(screen.getByTitle("見出し2")).toBeInTheDocument();
    expect(screen.getByTitle("見出し3")).toBeInTheDocument();
    expect(screen.getByTitle("見出し4")).toBeInTheDocument();

    // リスト・構造ボタン
    expect(screen.getByTitle("箇条書きリスト")).toBeInTheDocument();
    expect(screen.getByTitle("番号付きリスト")).toBeInTheDocument();
    expect(screen.getByTitle("チェックリスト")).toBeInTheDocument();
    expect(screen.getByTitle("引用")).toBeInTheDocument();

    // 挿入ボタン
    expect(screen.getByTitle("リンク")).toBeInTheDocument();
    expect(screen.getByTitle("画像")).toBeInTheDocument();
    expect(screen.getByTitle("表")).toBeInTheDocument();
    expect(screen.getByTitle("水平線")).toBeInTheDocument();

    // コード・数式ボタン
    expect(screen.getByTitle("JavaScriptコードブロック")).toBeInTheDocument();
    expect(screen.getByTitle("Pythonコードブロック")).toBeInTheDocument();
    expect(screen.getByTitle("Bashコードブロック")).toBeInTheDocument();
    expect(screen.getByTitle("数式")).toBeInTheDocument();

    // グループ名ラベルが表示されないことを確認
    expect(screen.queryByText("テキスト:")).not.toBeInTheDocument();
    expect(screen.queryByText("見出し:")).not.toBeInTheDocument();
    expect(screen.queryByText("リスト:")).not.toBeInTheDocument();
    expect(screen.queryByText("挿入:")).not.toBeInTheDocument();
    expect(screen.queryByText("コード:")).not.toBeInTheDocument();
  });

  it("supports enhanced syntax highlighting languages", () => {
    // サポートされている言語の一部をテスト
    expect(SUPPORTED_LANGUAGES).toContainEqual({
      code: "javascript",
      name: "JavaScript",
      aliases: ["js"],
    });
    expect(SUPPORTED_LANGUAGES).toContainEqual({
      code: "typescript",
      name: "TypeScript",
      aliases: ["ts"],
    });
    expect(SUPPORTED_LANGUAGES).toContainEqual({
      code: "python",
      name: "Python",
      aliases: ["py"],
    });
    expect(SUPPORTED_LANGUAGES).toContainEqual({
      code: "rust",
      name: "Rust",
      aliases: ["rs"],
    });
    expect(SUPPORTED_LANGUAGES).toContainEqual({
      code: "cpp",
      name: "C++",
      aliases: ["c++"],
    });
    expect(SUPPORTED_LANGUAGES).toContainEqual({
      code: "markdown",
      name: "Markdown",
      aliases: ["md"],
    });

    // 27言語をサポートしていることを確認
    expect(SUPPORTED_LANGUAGES).toHaveLength(27);
  });

  it("can insert enhanced markdown elements", () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    // 取り消し線ボタンをクリック
    const strikethroughButton = screen.getByTitle("取り消し線");
    fireEvent.click(strikethroughButton);
    expect(mockOnChange).toHaveBeenCalledWith("~~~~");

    // ハイライトボタンをクリック
    mockOnChange.mockClear();
    const highlightButton = screen.getByTitle("ハイライト");
    fireEvent.click(highlightButton);
    expect(mockOnChange).toHaveBeenCalledWith("====");

    // チェックリストボタンをクリック
    mockOnChange.mockClear();
    const checklistButton = screen.getByTitle("チェックリスト");
    fireEvent.click(checklistButton);
    expect(mockOnChange).toHaveBeenCalledWith(
      "- [ ] タスク1\n- [ ] タスク2\n- [x] 完了済みタスク",
    );
  });

  it("toolbar buttons work in split view", () => {
    const textarea = document.createElement("textarea");
    textarea.value = "";
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;

    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    const boldButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent === "B");
    fireEvent.click(boldButton!);

    expect(mockOnChange).toHaveBeenCalledWith("****");
  });

  it("handles tab key for indentation", () => {
    render(
      <MarkdownEditor
        value="テスト"
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    const textarea = screen.getByDisplayValue("テスト");

    // カーソルを先頭に設定
    Object.defineProperty(textarea, "selectionStart", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(textarea, "selectionEnd", {
      value: 0,
      writable: true,
    });

    // テキストエリアにフォーカスを当ててTabキーを押す
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, { key: "Tab", preventDefault: vi.fn() });

    expect(mockOnChange).toHaveBeenCalledWith("  テスト");
  });

  it("shows preview content in split view", () => {
    render(
      <MarkdownEditor
        value="# テスト見出し\n\n**太字テキスト**"
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    // proseクラス内のプレビュー要素を確認
    const previewContainer = document.querySelector(".prose");
    expect(previewContainer).toBeInTheDocument();
    expect(previewContainer?.textContent).toContain("テスト見出し");
    expect(previewContainer?.textContent).toContain("太字テキスト");
  });

  it("shows empty message when no content in split view", () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    expect(
      screen.getByText("Markdownを入力するとここにプレビューが表示されます。"),
    ).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(
      <MarkdownEditor value="テスト" onChange={mockOnChange} disabled={true} />,
    );

    const textarea = screen.getByDisplayValue("テスト");
    const buttons = screen.getAllByRole("button");

    expect(textarea).toBeDisabled();
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("toggle switch changes view mode correctly", () => {
    render(
      <MarkdownEditor
        value="# トグルテスト"
        onChange={mockOnChange}
        defaultViewMode="split"
      />,
    );

    // 初期状態では分割表示
    expect(screen.getByText("📝 分割表示")).toBeInTheDocument();

    // トグルを切り替えてタブ表示に
    const toggle = screen.getByRole("checkbox");
    fireEvent.click(toggle);

    expect(screen.getByText("📋 タブ表示")).toBeInTheDocument();
    expect(screen.getByText("✏️ 編集")).toBeInTheDocument();

    // 再度トグルを切り替えて分割表示に戻す
    fireEvent.click(toggle);
    expect(screen.getByText("📝 分割表示")).toBeInTheDocument();
  });
});

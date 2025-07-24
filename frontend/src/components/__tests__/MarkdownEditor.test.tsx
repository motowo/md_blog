import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MarkdownEditor from "../MarkdownEditor";

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

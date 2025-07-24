import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "../Pagination";

describe("Pagination", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it("renders pagination with page numbers", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />,
    );

    // 先頭・前・次・末尾ボタンが表示される
    expect(screen.getByTitle("先頭ページ")).toBeInTheDocument();
    expect(screen.getByTitle("前のページ")).toBeInTheDocument();
    expect(screen.getByTitle("次のページ")).toBeInTheDocument();
    expect(screen.getByTitle("最後のページ")).toBeInTheDocument();

    // 現在のページがprimaryボタンで表示される
    expect(screen.getByRole("button", { name: "3" })).toHaveClass(
      "bg-blue-600",
    );
  });

  it("disables first and previous buttons on first page", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByTitle("先頭ページ")).toBeDisabled();
    expect(screen.getByTitle("前のページ")).toBeDisabled();
    expect(screen.getByTitle("次のページ")).not.toBeDisabled();
    expect(screen.getByTitle("最後のページ")).not.toBeDisabled();
  });

  it("disables last and next buttons on last page", () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByTitle("先頭ページ")).not.toBeDisabled();
    expect(screen.getByTitle("前のページ")).not.toBeDisabled();
    expect(screen.getByTitle("次のページ")).toBeDisabled();
    expect(screen.getByTitle("最後のページ")).toBeDisabled();
  });

  it("calls onPageChange when clicking navigation buttons", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />,
    );

    // 先頭ページボタンをクリック
    fireEvent.click(screen.getByTitle("先頭ページ"));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    // 前のページボタンをクリック
    fireEvent.click(screen.getByTitle("前のページ"));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    // 次のページボタンをクリック
    fireEvent.click(screen.getByTitle("次のページ"));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);

    // 最後のページボタンをクリック
    fireEvent.click(screen.getByTitle("最後のページ"));
    expect(mockOnPageChange).toHaveBeenCalledWith(10);
  });

  it("calls onPageChange when clicking page number buttons", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />,
    );

    // ページ番号ボタンをクリック
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it("shows ellipsis for large page ranges", () => {
    render(
      <Pagination
        currentPage={10}
        totalPages={20}
        onPageChange={mockOnPageChange}
        maxVisible={5}
      />,
    );

    // 省略記号が表示される（複数存在する可能性がある）
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);

    // 最初のページと最後のページが表示される
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
  });

  it("does not render when totalPages is 1 or less", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows simple page indicator when showPageNumbers is false", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
        showPageNumbers={false}
      />,
    );

    // ページ番号ボタンが表示されない
    expect(screen.queryByRole("button", { name: "3" })).not.toBeInTheDocument();

    // 代わりに "3/10" 形式の表示がある
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("disables all buttons when disabled prop is true", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
        disabled={true}
      />,
    );

    // すべてのボタンが無効化される
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

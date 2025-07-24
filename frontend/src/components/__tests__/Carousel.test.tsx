import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import Carousel from "../Carousel";

describe("Carousel", () => {
  const mockItems = [
    <div key="1">Item 1</div>,
    <div key="2">Item 2</div>,
    <div key="3">Item 3</div>,
    <div key="4">Item 4</div>,
    <div key="5">Item 5</div>,
    <div key="6">Item 6</div>,
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders carousel with visible items", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("shows navigation buttons when there are multiple pages", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    expect(screen.getByLabelText("前へ")).toBeInTheDocument();
    expect(screen.getByLabelText("次へ")).toBeInTheDocument();
  });

  it("navigates to next page when next button is clicked", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    const nextButton = screen.getByLabelText("次へ");
    fireEvent.click(nextButton);

    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
  });

  it("navigates to previous page when previous button is clicked", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    const nextButton = screen.getByLabelText("次へ");
    const prevButton = screen.getByLabelText("前へ");

    // 次のページへ移動
    fireEvent.click(nextButton);
    // 前のページへ戻る
    fireEvent.click(prevButton);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("auto plays when autoPlay is true", async () => {
    render(
      <Carousel itemsPerView={3} autoPlay={true} interval={1000}>
        {mockItems}
      </Carousel>,
    );

    // 初期状態を確認
    expect(screen.getByText("Item 1")).toBeInTheDocument();

    // 1秒後に次のページへ
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText("Item 4")).toBeInTheDocument();
    });
  });

  it("pauses auto play on mouse enter", () => {
    const { container } = render(
      <Carousel itemsPerView={3} autoPlay={true} interval={1000}>
        {mockItems}
      </Carousel>,
    );

    const carousel = container.firstChild as HTMLElement;

    // マウスを乗せる
    fireEvent.mouseEnter(carousel);

    // 1秒経過させる
    vi.advanceTimersByTime(1000);

    // まだ最初のページのまま
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Item 4")).not.toBeInTheDocument();
  });

  it("resumes auto play on mouse leave", async () => {
    const { container } = render(
      <Carousel itemsPerView={3} autoPlay={true} interval={1000}>
        {mockItems}
      </Carousel>,
    );

    const carousel = container.firstChild as HTMLElement;

    // マウスを乗せて一時停止
    fireEvent.mouseEnter(carousel);
    vi.advanceTimersByTime(1000);

    // マウスを離す
    fireEvent.mouseLeave(carousel);

    // 1秒後に次のページへ
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText("Item 4")).toBeInTheDocument();
    });
  });

  it("shows indicators for multiple pages", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    const indicators = screen.getAllByRole("button", { name: /スライド/ });
    expect(indicators).toHaveLength(2); // 6 items / 3 per view = 2 pages
  });

  it("navigates to specific slide when indicator is clicked", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    const secondIndicator = screen.getByLabelText("スライド 2");
    fireEvent.click(secondIndicator);

    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
  });

  it("loops back to first page after last page", () => {
    render(<Carousel itemsPerView={3}>{mockItems}</Carousel>);

    const nextButton = screen.getByLabelText("次へ");

    // 2ページ目へ
    fireEvent.click(nextButton);
    // 1ページ目へループ
    fireEvent.click(nextButton);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("does not show navigation when there is only one page", () => {
    const singlePageItems = [
      <div key="1">Item 1</div>,
      <div key="2">Item 2</div>,
    ];

    render(<Carousel itemsPerView={3}>{singlePageItems}</Carousel>);

    expect(screen.queryByLabelText("前へ")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("次へ")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /スライド/ }),
    ).not.toBeInTheDocument();
  });
});

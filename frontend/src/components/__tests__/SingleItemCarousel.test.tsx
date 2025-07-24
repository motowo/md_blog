import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import SingleItemCarousel from "../SingleItemCarousel";

describe("SingleItemCarousel", () => {
  const mockItems = [
    <div key="1">Item 1</div>,
    <div key="2">Item 2</div>,
    <div key="3">Item 3</div>,
    <div key="4">Item 4</div>,
    <div key="5">Item 5</div>,
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders carousel with single item visible", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Item 2")).not.toBeInTheDocument();
  });

  it("shows navigation buttons", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    expect(screen.getByLabelText("前へ")).toBeInTheDocument();
    expect(screen.getByLabelText("次へ")).toBeInTheDocument();
  });

  it("shows indicators for all items", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    const indicators = screen.getAllByRole("button", { name: /スライド/ });
    expect(indicators).toHaveLength(5);

    // Check that indicators have proper styling
    const firstIndicator = screen.getByLabelText("スライド 1");
    expect(firstIndicator).toHaveClass(
      "bg-blue-600",
      "border-blue-600",
      "shadow-lg",
      "scale-125",
    );
  });

  it("shows current position counter", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("navigates to next item when next button is clicked", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    const nextButton = screen.getByLabelText("次へ");
    fireEvent.click(nextButton);

    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("navigates to previous item when previous button is clicked", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    const prevButton = screen.getByLabelText("前へ");
    fireEvent.click(prevButton);

    // Should wrap to last item
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  it("navigates to specific slide when indicator is clicked", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    const thirdIndicator = screen.getByLabelText("スライド 3");
    fireEvent.click(thirdIndicator);

    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("loops back to first item after last item", () => {
    render(<SingleItemCarousel>{mockItems}</SingleItemCarousel>);

    const nextButton = screen.getByLabelText("次へ");

    // Navigate to last item
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton);
    }
    expect(screen.getByText("5 / 5")).toBeInTheDocument();

    // Navigate to first item (loop)
    fireEvent.click(nextButton);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("auto plays when autoPlay is true", async () => {
    render(
      <SingleItemCarousel autoPlay={true} interval={1000}>
        {mockItems}
      </SingleItemCarousel>,
    );

    // Initially shows first item
    expect(screen.getByText("1 / 5")).toBeInTheDocument();

    // After 1 second, should show second item
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText("2 / 5")).toBeInTheDocument();
    });
  });

  it("pauses auto play on mouse enter", () => {
    const { container } = render(
      <SingleItemCarousel autoPlay={true} interval={1000}>
        {mockItems}
      </SingleItemCarousel>,
    );

    const carousel = container.firstChild as HTMLElement;

    // Mouse enter should pause
    fireEvent.mouseEnter(carousel);

    // Advance time but should not move
    vi.advanceTimersByTime(1000);

    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("handles empty children", () => {
    render(<SingleItemCarousel>{[]}</SingleItemCarousel>);

    expect(screen.getByText("コンテンツがありません")).toBeInTheDocument();
  });

  it("handles single item without controls", () => {
    const singleItem = [<div key="1">Single Item</div>];

    render(<SingleItemCarousel>{singleItem}</SingleItemCarousel>);

    expect(screen.getByText("Single Item")).toBeInTheDocument();
    expect(screen.queryByLabelText("前へ")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("次へ")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /スライド/ }),
    ).not.toBeInTheDocument();
  });
});

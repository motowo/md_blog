import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import ThreeItemCarousel from "../ThreeItemCarousel";

describe("ThreeItemCarousel", () => {
  const mockItems = Array.from({ length: 10 }, (_, i) => (
    <div key={i + 1}>Item {i + 1}</div>
  ));

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders carousel with three items visible", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.queryByText("Item 4")).not.toBeInTheDocument();
  });

  it("shows navigation buttons", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    expect(screen.getByLabelText("前へ")).toBeInTheDocument();
    expect(screen.getByLabelText("次へ")).toBeInTheDocument();
  });

  it("shows indicators for all items", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    const indicators = screen.getAllByRole("button", { name: /スライド/ });
    expect(indicators).toHaveLength(10);

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
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    expect(screen.getByText("1 / 10")).toBeInTheDocument();
  });

  it("slides one item when next button is clicked", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    const nextButton = screen.getByLabelText("次へ");
    fireEvent.click(nextButton);

    expect(screen.getByText("2 / 10")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("slides one item when previous button is clicked", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    const prevButton = screen.getByLabelText("前へ");
    fireEvent.click(prevButton);

    // Should wrap to show items 10, 1, 2
    expect(screen.getByText("10 / 10")).toBeInTheDocument();
    expect(screen.getByText("Item 10")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("navigates to specific slide when indicator is clicked", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    const fifthIndicator = screen.getByLabelText("スライド 5");
    fireEvent.click(fifthIndicator);

    expect(screen.getByText("5 / 10")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
    expect(screen.getByText("Item 7")).toBeInTheDocument();
  });

  it("loops back to first item after last item", () => {
    render(<ThreeItemCarousel>{mockItems}</ThreeItemCarousel>);

    // Navigate to item 10
    const tenthIndicator = screen.getByLabelText("スライド 10");
    fireEvent.click(tenthIndicator);
    expect(screen.getByText("10 / 10")).toBeInTheDocument();

    // Click next should loop to item 1
    const nextButton = screen.getByLabelText("次へ");
    fireEvent.click(nextButton);
    expect(screen.getByText("1 / 10")).toBeInTheDocument();
  });

  it("shows static grid when items are 3 or fewer", () => {
    const fewItems = [
      <div key="1">Item 1</div>,
      <div key="2">Item 2</div>,
      <div key="3">Item 3</div>,
    ];

    render(<ThreeItemCarousel>{fewItems}</ThreeItemCarousel>);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();

    // Should not show navigation or indicators
    expect(screen.queryByLabelText("前へ")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /スライド/ }),
    ).not.toBeInTheDocument();
  });

  it("auto plays when autoPlay is true", async () => {
    render(
      <ThreeItemCarousel autoPlay={true} interval={1000}>
        {mockItems}
      </ThreeItemCarousel>,
    );

    // Initially shows first position
    expect(screen.getByText("1 / 10")).toBeInTheDocument();

    // After 1 second, should advance to second position
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText("2 / 10")).toBeInTheDocument();
    });
  });

  it("pauses auto play on mouse enter", () => {
    const { container } = render(
      <ThreeItemCarousel autoPlay={true} interval={1000}>
        {mockItems}
      </ThreeItemCarousel>,
    );

    const carousel = container.firstChild as HTMLElement;

    // Mouse enter should pause
    fireEvent.mouseEnter(carousel);

    // Advance time but should not move
    vi.advanceTimersByTime(1000);

    expect(screen.getByText("1 / 10")).toBeInTheDocument();
  });

  it("handles empty children", () => {
    render(<ThreeItemCarousel>{[]}</ThreeItemCarousel>);

    expect(screen.getByText("コンテンツがありません")).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PriceInput from "../PriceInput";

describe("PriceInput", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with initial value", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue("100");
    expect(input).toBeInTheDocument();
    expect(screen.getByText("円")).toBeInTheDocument();
  });

  it("shows price annotation notes", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    expect(screen.getByText("• 最低10円から設定可能")).toBeInTheDocument();
    expect(
      screen.getByText("• 10円単位での設定となります"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("• おすすめの価格は下のボタンから選択可能"),
    ).toBeInTheDocument();
  });

  it("shows price preset buttons", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    expect(screen.getByText("おすすめの価格:")).toBeInTheDocument();
    expect(screen.getByText("¥100")).toBeInTheDocument();
    expect(screen.getByText("¥200")).toBeInTheDocument();
    expect(screen.getByText("¥500")).toBeInTheDocument();
    expect(screen.getByText("¥1,000")).toBeInTheDocument();
  });

  it("calls onChange when preset button is clicked", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    const preset500Button = screen.getByText("¥500");
    fireEvent.click(preset500Button);

    expect(mockOnChange).toHaveBeenCalledWith(500);
  });

  it("highlights selected preset price", () => {
    render(<PriceInput value={500} onChange={mockOnChange} />);

    const preset500Button = screen.getByText("¥500");
    expect(preset500Button).toHaveClass("bg-blue-500", "text-white");
  });

  it("is disabled when disabled prop is true", () => {
    render(<PriceInput value={100} onChange={mockOnChange} disabled={true} />);

    const input = screen.getByDisplayValue("100");
    expect(input).toBeDisabled();

    // プリセットボタンと注釈は表示されない
    expect(
      screen.queryByText("• おすすめの価格は下のボタンから選択可能"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("おすすめの価格:")).not.toBeInTheDocument();
  });

  it("handles direct input changes", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue("100");
    fireEvent.change(input, { target: { value: "200" } });

    expect(mockOnChange).toHaveBeenCalledWith(200);
  });

  it("formats price with comma separators in presets", () => {
    render(<PriceInput value={1000} onChange={mockOnChange} />);

    expect(screen.getByText("¥1,000")).toBeInTheDocument();
    expect(screen.getByText("¥5,000")).toBeInTheDocument();
  });

  it("has numeric input mode for mobile keyboards", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue("100");
    expect(input).toHaveAttribute("inputMode", "numeric");
  });

  it("has proper min and step attributes", () => {
    render(<PriceInput value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue("100");
    expect(input).toHaveAttribute("min", "10");
    expect(input).toHaveAttribute("step", "10");
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Toggle } from "./Toggle";

test("renders with base class and switch role", () => {
  render(<Toggle aria-label="notify" />);
  const el = screen.getByRole("switch", { name: "notify" });
  expect(el).toHaveClass("hx-toggle");
});

test("reflects checked state via aria-checked", () => {
  render(<Toggle aria-label="notify" checked />);
  expect(screen.getByRole("switch", { name: "notify" })).toHaveAttribute("aria-checked", "true");
});

test("calls onChange with the inverted value when clicked", () => {
  const onChange = vi.fn();
  render(<Toggle aria-label="notify" checked={false} onChange={onChange} />);
  fireEvent.click(screen.getByRole("switch", { name: "notify" }));
  expect(onChange).toHaveBeenCalledWith(true);
});

test("forwards disabled", () => {
  render(<Toggle aria-label="notify" disabled />);
  expect(screen.getByRole("switch", { name: "notify" })).toBeDisabled();
});

test("forwards ref to the underlying button element", () => {
  const ref = React.createRef<HTMLButtonElement>();
  render(<Toggle aria-label="notify" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("switch", { name: "notify" }));
});

test("preserves custom className alongside base class", () => {
  render(<Toggle aria-label="notify" className="custom" />);
  expect(screen.getByRole("switch", { name: "notify" })).toHaveClass("hx-toggle", "custom");
});

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Radio } from "./Radio";

test("renders with base class", () => {
  render(<Radio aria-label="option-a" />);
  expect(screen.getByRole("radio", { name: "option-a" })).toHaveClass("hx-radio");
});

test("reflects checked state", () => {
  render(<Radio aria-label="option-a" checked readOnly />);
  expect(screen.getByRole("radio", { name: "option-a" })).toBeChecked();
});

test("renders associated label text", () => {
  render(<Radio label="Option A" />);
  const el = screen.getByRole("radio", { name: "Option A" });
  expect(el).toHaveClass("hx-radio");
});

test("forwards native props", () => {
  render(<Radio aria-label="option-a" disabled />);
  expect(screen.getByRole("radio", { name: "option-a" })).toBeDisabled();
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Radio aria-label="option-a" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("radio", { name: "option-a" }));
});

test("preserves custom className alongside base class", () => {
  render(<Radio aria-label="option-a" className="custom" />);
  expect(screen.getByRole("radio", { name: "option-a" })).toHaveClass("hx-radio", "custom");
});

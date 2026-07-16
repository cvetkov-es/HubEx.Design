import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Checkbox } from "./Checkbox";

test("renders with base class", () => {
  render(<Checkbox aria-label="agree" />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toHaveClass("hx-checkbox");
});

test("reflects checked state", () => {
  render(<Checkbox aria-label="agree" checked readOnly />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toBeChecked();
});

test("renders associated label text", () => {
  render(<Checkbox label="Agree to terms" />);
  const el = screen.getByRole("checkbox", { name: "Agree to terms" });
  expect(el).toHaveClass("hx-checkbox");
});

test("forwards native props", () => {
  render(<Checkbox aria-label="agree" disabled />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toBeDisabled();
});

test("forwards ref to the underlying input element", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Checkbox aria-label="agree" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("checkbox", { name: "agree" }));
});

test("preserves custom className alongside base class", () => {
  render(<Checkbox aria-label="agree" className="custom" />);
  expect(screen.getByRole("checkbox", { name: "agree" })).toHaveClass("hx-checkbox", "custom");
});

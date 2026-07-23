import { render, screen } from "@testing-library/react";
import * as React from "react";
import { BadgeDot } from "./BadgeDot";

test("defaults to the error background token", () => {
  render(<BadgeDot data-testid="dot" />);
  expect(screen.getByTestId("dot")).toHaveClass("hx-badge-dot", "hx-badge-dot--bg-error");
});

test("applies a custom background token modifier class", () => {
  render(<BadgeDot data-testid="dot" background="success" />);
  expect(screen.getByTestId("dot")).toHaveClass("hx-badge-dot--bg-success");
  expect(screen.getByTestId("dot")).not.toHaveClass("hx-badge-dot--bg-error");
});

test("renders no visible text content", () => {
  const { container } = render(<BadgeDot />);
  expect(container.querySelector(".hx-badge-dot")?.textContent).toBe("");
});

test("sets aria-label when provided", () => {
  render(<BadgeDot ariaLabel="Unread" />);
  expect(screen.getByLabelText("Unread")).toBeInTheDocument();
});

test("forwards ref to the underlying span element", () => {
  const ref = React.createRef<HTMLSpanElement>();
  render(<BadgeDot ref={ref} data-testid="dot" />);
  expect(ref.current).toBe(screen.getByTestId("dot"));
});

test("preserves custom className alongside the base class", () => {
  render(<BadgeDot className="custom" data-testid="dot" />);
  expect(screen.getByTestId("dot")).toHaveClass("hx-badge-dot", "custom");
});

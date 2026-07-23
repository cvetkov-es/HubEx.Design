import { render, screen } from "@testing-library/react";
import * as React from "react";
import { BadgeCount } from "./BadgeCount";

test("renders the value as its content", () => {
  render(<BadgeCount value={5} />);
  expect(screen.getByText("5")).toBeInTheDocument();
});

test("accepts a string value", () => {
  render(<BadgeCount value="99+" />);
  expect(screen.getByText("99+")).toBeInTheDocument();
});

test("is a pill built from --hx-radius-pill and defaults to the error background", () => {
  render(<BadgeCount value={5} />);
  expect(screen.getByText("5")).toHaveClass("hx-badge-count", "hx-badge-count--bg-error");
});

test("applies a custom background token modifier class", () => {
  render(<BadgeCount value={5} background="accent" />);
  expect(screen.getByText("5")).toHaveClass("hx-badge-count--bg-accent");
  expect(screen.getByText("5")).not.toHaveClass("hx-badge-count--bg-error");
});

test("sets aria-label when provided", () => {
  render(<BadgeCount value={5} ariaLabel="5 unread" />);
  expect(screen.getByLabelText("5 unread")).toBeInTheDocument();
});

test("forwards ref to the underlying span element", () => {
  const ref = React.createRef<HTMLSpanElement>();
  render(
    <BadgeCount ref={ref} value={5} data-testid="count-el" />
  );
  expect(ref.current).toBe(screen.getByTestId("count-el"));
});

test("preserves custom className alongside the base class", () => {
  render(<BadgeCount value={5} className="custom" />);
  expect(screen.getByText("5")).toHaveClass("hx-badge-count", "custom");
});
